"""ROUND1 CAD → web 资产转换脚本（第二轮重构）。

直接 import 源仓库 round1-demo-cad 分支各方案 CAD_SOURCE 中的权威模块：
  validate_r1.placements(cand, t)  —— 零件实例 -> (世界平移, 旋转矩阵)
  joints_r1.joints(cand)           —— 运动副基准（零件局部坐标）
不重写任何运动学逻辑：运行时变换轨道由本脚本对原函数密集采样生成，
浏览器端只做插值，保证与原始 CAD 运动姿态一致。

输出（public/models/<cand>/）：
  assembly.glb      逐实例命名节点（局部坐标几何，来自逐件 STL）
  tracks.json       每实例 pos/quat 采样轨道（N=161）
  joints.json       运动副基准与类型
  manifest.json     零件清单/实例映射/包围盒/关键姿态真值
  keyposes.json     t=0/0.2/0.42/0.7/1.0 的世界变换真值（验收比对用）

用法：
  <venv>/python scripts/export_cad.py --cad-root <path>/ROUND1_DEMO_CAD --out public/models
"""
from __future__ import annotations
import argparse, importlib, json, math, os, sys
from pathlib import Path
import numpy as np
import trimesh

CANDS = ["F09_L82", "F07", "SCZ", "F08_OPTIONAL"]
N_SAMPLES = 161
KEY_T = [0.0, 0.2, 0.42, 0.7, 1.0]


def load_modules(cad_root: Path, cand: str):
    d = cad_root / cand / "CAD_SOURCE"
    for m in ("kinematics_r1", "common_r1", "validate_r1", "joints_r1", "build_gantry", "build_scz", "build_f08"):
        sys.modules.pop(m, None)
    sys.path.insert(0, str(d))
    os.environ["ROUND1_OUT"] = str(cad_root)
    V = importlib.import_module("validate_r1")
    J = importlib.import_module("joints_r1")
    sys.path.pop(0)
    return V, J


def quat_from_R(R: np.ndarray):
    q = trimesh.transformations.quaternion_from_matrix(np.vstack([np.hstack([R, np.zeros((3, 1))]), [0, 0, 0, 1]]))
    return [float(x) for x in q]  # xyzw


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cad-root", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    cad_root = Path(args.cad_root).resolve()
    out = Path(args.out).resolve()
    report = {}

    for cand in CANDS:
        V, J = load_modules(cad_root, cand)
        parts = V.load_parts(cand)  # 结构件（与原渲染器一致；销/卡圈为紧固件，见 manifest 说明）
        pl0 = V.placements(cand, 0.0)
        instances = list(pl0.keys())
        # 未出现在 placements 中的已加载零件（如 SCZ 的 BED）按单位变换放置
        for pid in parts:
            if pid not in instances and pid not in [V.base_name(i) for i in instances]:
                instances.append(pid)

        scene = trimesh.Scene()
        for pid in instances:
            base = V.base_name(pid)
            mesh = parts.get(base)
            if mesh is None:
                continue
            scene.add_geometry(mesh.copy(), node_name=pid, geom_name=pid)
        cdir = out / cand
        cdir.mkdir(parents=True, exist_ok=True)
        scene.export(cdir / "assembly.glb")

        tracks = {pid: {"p": [], "q": []} for pid in instances}
        ts = np.linspace(0, 1, N_SAMPLES)
        for t in ts:
            pl = V.placements(cand, float(t))
            for pid in instances:
                if pid in pl:
                    pos, R = pl[pid]
                else:
                    pos, R = np.zeros(3), np.eye(3)
                tracks[pid]["p"].extend([float(x) for x in pos])
                tracks[pid]["q"].extend(quat_from_R(np.asarray(R)))
        (cdir / "tracks.json").write_text(json.dumps({"n": N_SAMPLES, "tracks": tracks}, separators=(",", ":")), encoding="utf-8")

        joints = []
        for j in J.joints(cand):
            joints.append({
                "name": j["name"], "kind": j["kind"], "a": j["a"], "b": j["b"],
                "pa": [float(x) for x in j["pa"]], "pb": [float(x) for x in j["pb"]],
                "axis": [float(x) for x in j["axis"]],
                "pin": j.get("pin"), "hole": j.get("hole"),
            })
        (cdir / "joints.json").write_text(json.dumps(joints, separators=(",", ":")), encoding="utf-8")

        keyposes = {}
        for t in KEY_T:
            pl = V.placements(cand, t)
            keyposes[str(t)] = {pid: {"p": [float(x) for x in pos], "q": quat_from_R(np.asarray(R))}
                                for pid, (pos, R) in pl.items()}
        (cdir / "keyposes.json").write_text(json.dumps(keyposes, separators=(",", ":")), encoding="utf-8")

        bounds = {pid: [float(x) for x in parts[V.base_name(pid)].bounds.flatten()] for pid in instances if V.base_name(pid) in parts}
        allv = np.vstack([m.vertices for m in parts.values()])
        manifest = {
            "cand": cand,
            "source": "round1-demo-cad @ d35cbd1 · CAD_SOURCE/validate_r1.placements + joints_r1.joints",
            "instances": instances,
            "base_parts": sorted(parts.keys()),
            "n_instances": len(instances),
            "n_base_parts": len(parts),
            "fasteners_note": "销轴/卡圈（PIN*/CLIP*）为紧固件，与原渲染器 load_parts 口径一致不进入运行时网格；其规格见 BOM 与证据。",
            "bounds_local": bounds,
            "assembly_bbox_t0": [float(x) for x in allv.min(0)] + [float(x) for x in allv.max(0)],
            "samples": N_SAMPLES,
            "key_t": KEY_T,
        }
        (cdir / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")

        glb_size = (cdir / "assembly.glb").stat().st_size
        report[cand] = {"instances": len(instances), "base_parts": len(parts), "glb_kb": round(glb_size / 1024), "joints": len(joints)}
        print(cand, report[cand])

    (out / "conversion_report.json").write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
    print("done")


if __name__ == "__main__":
    main()
