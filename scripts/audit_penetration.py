"""穿模专项审计：分层归因（原始 CAD / GLB 几何 / 161 帧插值 / 历史版本回放 / 爆炸显示）。

复用原项目 L2 方法：AABB 粗筛 + manifold 网格布尔求交集体积；
允许接触对（运动副作用）单独列出，不一律排除。

层：
  L0 原始 R1-V6 CAD + 权威 placements（validate_r1.placements）
  L1 GLB 几何保真度（与 STL 逐件体积/包围盒偏差）
  L2 导出轨道 161 帧 + 浏览器同款插值（线性位置 + 最短弧 slerp）→ 干涉
  L3 插值变换 vs 权威变换偏差（mm / deg）
  L4 历史版本轨道回放（R1-V6 几何 + 版本参数；SCZ 臂按版本缩放）→ 干涉（归因为回放，非原始 CAD 缺陷）
  L5 爆炸分解显示态（t=0, explode=0.5/1.0）→ 干涉（显示态单独记录）

用法：<venv>/python scripts/audit_penetration.py --cad-root <ROUND1_DEMO_CAD> --models public/models --out docs/penetration_audit.json [--n 481]
"""
from __future__ import annotations
import argparse, importlib, json, math, os, sys
from pathlib import Path
import numpy as np
import trimesh

CANDS = ["F09_L82", "F07", "SCZ", "F08_OPTIONAL"]


def load_modules(cad_root: Path, cand: str):
    d = cad_root / cand / "CAD_SOURCE"
    for m in ("kinematics_r1", "common_r1", "validate_r1", "joints_r1"):
        sys.modules.pop(m, None)
    sys.path.insert(0, str(d))
    os.environ["ROUND1_OUT"] = str(cad_root)
    V = importlib.import_module("validate_r1")
    J = importlib.import_module("joints_r1")
    sys.path.pop(0)
    return V, J


def slerp(qa, qb, u):
    qa = np.asarray(qa, float); qb = np.asarray(qb, float)
    d = float(qa @ qb)
    if d < 0:
        qb = -qb; d = -d
    if d > 0.9995:
        r = qa + u * (qb - qa)
        return r / np.linalg.norm(r)
    th = math.acos(min(1.0, d))
    s = math.sin(th)
    return (math.sin((1 - u) * th) / s) * qa + (math.sin(u * th) / s) * qb


def quat_to_R(q):
    x, y, z, w = q
    return np.array([
        [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
        [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
        [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
    ])


def interp_track(tr, n, t):
    f = min(1.0, max(0.0, t)) * (n - 1)
    i = min(n - 2, int(math.floor(f)))
    u = f - i
    p = np.array(tr["p"][i * 3:i * 3 + 3]) * (1 - u) + np.array(tr["p"][(i + 1) * 3:(i + 1) * 3 + 3]) * u
    q = slerp(tr["q"][i * 4:i * 4 + 4], tr["q"][(i + 1) * 4:(i + 1) * 4 + 4], u)
    return p, quat_to_R(q)


def placed(mesh, pos, R):
    m = mesh.copy()
    T = np.eye(4); T[:3, :3] = R; T[:3, 3] = pos
    m.apply_transform(T)
    return m


def sweep(meshes_fn, ids, allowed_fn, ts, tag, worst, pens, unresolved):
    for t in ts:
        ms = meshes_fn(float(t))
        for ia in range(len(ids)):
            for ib in range(ia + 1, len(ids)):
                a, b = ids[ia], ids[ib]
                if allowed_fn(a, b):
                    continue
                ma, mb = ms[a], ms[b]
                if not (np.all(ma.bounds[1] + 0.05 >= mb.bounds[0]) and np.all(mb.bounds[1] + 0.05 >= ma.bounds[0])):
                    continue
                try:
                    inter = trimesh.boolean.intersection([ma, mb], engine="manifold")
                    v = 0.0 if inter is None or len(inter.faces) == 0 else float(abs(inter.volume))
                except Exception:
                    unresolved.append(dict(layer=tag, t=round(float(t), 4), pair=[a, b]))
                    continue
                if v > 1e-6:
                    key = "/".join(sorted((a, b)))
                    pens.append(dict(layer=tag, t=round(float(t), 4), pair=[a, b], vol_mm3=round(v, 4)))
                    if key not in worst or v > worst[key]["vol_mm3"]:
                        worst[key] = dict(layer=tag, vol_mm3=round(v, 4), t=round(float(t), 4))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cad-root", required=True)
    ap.add_argument("--models", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--n", type=int, default=481)
    args = ap.parse_args()
    cad_root = Path(args.cad_root).resolve(); models = Path(args.models).resolve()
    ts = np.linspace(0, 1, args.n)
    report = {}

    for cand in CANDS:
        V, J = load_modules(cad_root, cand)
        parts = V.load_parts(cand)
        ids = list(V.placements(cand, 0.0).keys())
        for pid in parts:
            if pid not in ids and pid not in [V.base_name(i) for i in ids]:
                ids.append(pid)
        allowed_fn = lambda a, b: V.allowed(cand, a, b)
        allowed_pairs = sorted({"/".join(sorted(p)) for p in V.ALLOW_CONTACT[cand]})
        joints = [dict(name=j["name"], kind=j["kind"], a=j["a"], b=j["b"]) for j in J.joints(cand)]

        pens, worst, unresolved = [], {}, []
        # L0 原始 CAD + 权威运动学
        sweep(lambda t: {pid: placed(parts[V.base_name(pid)], *V.placements(cand, t)[pid]) if pid in V.placements(cand, t) else placed(parts[V.base_name(pid)], np.zeros(3), np.eye(3)) for pid in ids},
              ids, allowed_fn, ts, "L0_original_cad", worst, pens, unresolved)

        # L1 GLB 保真度
        glb = trimesh.load(models / cand / "assembly.glb", force="scene")
        gmesh = {}
        for node in glb.graph.nodes_geometry:
            T, geom = glb.graph[node]
            gmesh[node] = glb.geometry[geom]
        fid = []
        for pid in ids:
            base = V.base_name(pid)
            if base in parts and pid in gmesh:
                dv = abs(float(gmesh[pid].volume) - float(parts[base].volume))
                db = float(np.max(np.abs(gmesh[pid].bounds - parts[base].bounds)))
                fid.append(dict(pid=pid, dvol_mm3=round(dv, 6), dbounds_mm=round(db, 6)))

        # L2/L3 导出轨道 + 浏览器插值
        trk = json.loads((models / cand / "tracks.json").read_text(encoding="utf-8"))
        n = trk["n"]; tracks = trk["tracks"]
        dev = []
        def pipe_meshes(t):
            out = {}
            for pid in ids:
                tr = tracks.get(pid)
                if tr:
                    p, R = interp_track(tr, n, t)
                else:
                    p, R = np.zeros(3), np.eye(3)
                m = gmesh.get(pid, parts.get(V.base_name(pid)))
                out[pid] = placed(m, p, R)
            return out
        for t in ts[::8]:
            pl = V.placements(cand, float(t))
            for pid in ids:
                if pid not in pl or pid not in tracks:
                    continue
                p, R = interp_track(tracks[pid], n, float(t))
                pa, Ra = pl[pid]
                dp = float(np.linalg.norm(p - np.asarray(pa)))
                ang = float(np.degrees(np.arccos(min(1.0, max(-1.0, (np.trace(R @ np.asarray(Ra).T) - 1) / 2)))))
                dev.append(dict(t=round(float(t), 4), pid=pid, dpos_mm=round(dp, 5), dang_deg=round(ang, 5)))
        sweep(pipe_meshes, ids, allowed_fn, ts, "L2_glb_interp161", worst, pens, unresolved)

        # L4 历史版本回放
        vers = json.loads((models / cand / "versions.json").read_text(encoding="utf-8"))
        for ver in vers:
            if ver["id"] == "v321":
                continue
            vt = json.loads((models / cand / ver["file"]).read_text(encoding="utf-8"))
            vtracks = vt["tracks"]; vn = vt["n"]
            scale = ver.get("arm_scale", 1.0)
            def ver_meshes(t, vtracks=vtracks, vn=vn, scale=scale):
                out = {}
                for pid in ids:
                    tr = vtracks.get(pid)
                    if tr:
                        p, R = interp_track(tr, vn, t)
                    else:
                        p, R = np.zeros(3), np.eye(3)
                    m = gmesh.get(pid, parts.get(V.base_name(pid))).copy()
                    if cand == "SCZ" and (pid.startswith("ARM_A") or pid.startswith("ARM_B")) and scale != 1.0:
                        S = np.eye(4); S[0, 0] = scale
                        m.apply_transform(S)
                    out[pid] = placed(m, p, R)
                return out
            sweep(ver_meshes, ids, allowed_fn, ts, f"L4_replay_{ver['id']}", worst, pens, unresolved)

        # L5 爆炸显示态（t=0）
        EXP = {
            "F09_L82": {"BASE": (0, 0, -45), "BED": (0, 0, 32), "TWR_0": (0, -60, 0), "TWR_1": (0, 60, 0), "CAR_0": (0, -100, 18), "CAR_1": (0, 100, 18), "SYNC": (-75, 0, 18), "COL_0": (0, -145, 50), "COL_1": (0, 145, 50), "XBAR": (0, 0, 100), "BRG": (50, 0, 75), "ARM": (100, 0, 100)},
            "F07": {"BASE": (0, 0, -45), "BED": (0, 0, 32), "TWR_0": (0, -60, 0), "CAR_0": (0, -100, 18), "COL_0": (0, -135, 50), "ARM": (95, 0, 95)},
            "SCZ": {"BASE": (0, 0, -45), "BED": (0, 0, 32), "POST_L": (0, -65, 0), "POST_R": (0, 65, 0), "SLB_L": (0, -95, -12), "SLB_R": (0, 95, -12), "SHB": (0, 0, -40), "ARM_A_L": (0, -125, 30), "ARM_A_R": (0, 125, 30), "ARM_B_L": (0, -155, 60), "ARM_B_R": (0, 155, 60), "SLT_L": (0, -95, 85), "SLT_R": (0, 95, 85), "SHT": (0, 0, 115), "PLAT": (0, 0, 150)},
            "F08_OPTIONAL": {"CARD": (0, 0, -35), "FOOT": (-65, 0, 12), "SLIDER": (0, -65, 25), "COL": (0, -105, 50), "ARM": (65, -135, 75)},
        }[cand]
        for ex in (0.5, 1.0):
            def ex_meshes(t, ex=ex):
                pl = V.placements(cand, t)
                out = {}
                for pid in ids:
                    p, R = pl.get(pid, (np.zeros(3), np.eye(3)))
                    p = np.asarray(p, float) + np.asarray(EXP.get(pid, (0, 0, 0)), float) * ex
                    out[pid] = placed(parts[V.base_name(pid)], p, R)
                return out
            sweep(ex_meshes, ids, allowed_fn, [0.0], f"L5_explode_{ex}", worst, pens, unresolved)

        report[cand] = dict(
            steps=args.n,
            allowed_contact_pairs=allowed_pairs,
            joints=joints,
            glb_fidelity=fid,
            interp_dev_max=dict(dpos_mm=max(d["dpos_mm"] for d in dev), dang_deg=max(d["dang_deg"] for d in dev)),
            penetrations=pens,
            n_penetrations=len(pens),
            worst_by_pair=worst,
            unresolved=unresolved[:30],
        )
        print(cand, "pens=", len(pens), "worst=", {k: v["vol_mm3"] for k, v in list(worst.items())[:6]}, "dev=", report[cand]["interp_dev_max"])

    Path(args.out).write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
    print("written", args.out)


if __name__ == "__main__":
    main()
