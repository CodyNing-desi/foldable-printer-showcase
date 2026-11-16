"""3D 视觉验收判定：读取 e2e/visual3d.mjs 生成的绘图缓冲度量，判定模型可见/完整/不裁切。
规则（按视图类型）：
  普通视角: cov>=0.04, touch<=1, bw>=0.18, bh>=0.30   （完整可见、不贴边裁切）
  爆炸视角: cov>=0.02, touch<=1, bw>=0.20, bh>=0.30   （零件分离导致覆盖率天然低，要求全部零件在框内）
  特写/隔离: cov>=0.06, bw>=0.35, bh>=0.50            （有意裁切，主体须占画面主导）
用法: python e2e/accept3d.py [shotsdir ...]
"""
import json, io, sys, os

CLOSE = {'f09-detail', 'f09-isolate-arm', 'f04-why-close', 'f12-close-wobble'}
EXPLODE = {'f09-explode50', 'f09-explode100'}

def judge(name, met):
    if not met:
        return False, 'no-metrics'
    if name in CLOSE:
        ok = met['cov'] >= 0.06 and met['bw'] >= 0.35 and met['bh'] >= 0.50
    elif name in EXPLODE:
        ok = met['cov'] >= 0.02 and met['touch'] <= 1 and met['bw'] >= 0.20 and met['bh'] >= 0.30
    else:
        ok = met['cov'] >= 0.04 and met['touch'] <= 1 and met['bw'] >= 0.18 and met['bh'] >= 0.30
    return ok, f"cov={met['cov']},touch={met['touch']},span={met['bw']}x{met['bh']}"

def main():
    dirs = sys.argv[1:] or ['e2e/shots3d', 'e2e/shots3d-1366']
    allfail = []
    for d in dirs:
        man = json.load(io.open(os.path.join(d, 'manifest.json'), encoding='utf-8'))
        fails = []
        for m in man['manifest']:
            ok, why = judge(m['name'], m.get('met'))
            print(f"{d.split('/')[-1]:14s} {m['name']:20s} {'PASS' if ok else 'FAIL'}  {why}")
            if not ok:
                fails.append(m['name'])
        print(f"== {d}: {len(man['manifest']) - len(fails)}/{len(man['manifest'])} pass; ctx={man.get('ctx')}\n")
        allfail += [f"{d}:{f}" for f in fails]
    print('ALL FAILS:', allfail or 'none')
    sys.exit(1 if allfail else 0)

if __name__ == '__main__':
    main()
