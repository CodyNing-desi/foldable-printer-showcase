import { useEffect, useState } from 'react'
import { assetUrl, useCtrl } from '../state'
import { interferenceAt } from '../data/replayInterference'
import type { VersionInfo } from '../three/MechanismViewer'

const cache: Record<string, VersionInfo[]> = {}

export function versionReadout(v: VersionInfo): string {
  const tail = `该版本收纳比 ${v.storage} · ${v.passed ? '通过' : '未通过'}`
  if (v.arm_len !== undefined) return `半臂长 ${v.arm_len} mm · 收纳高 ${v.h_fold} mm · ${tail}`
  if (v.shift !== undefined) return `抬升 ${v.lift} mm · 后移 ${-v.shift} mm · ${v.arm ? 'X 臂先折' : '无臂折'} · ${tail}`
  return `抬升 ${v.lift} mm · ${v.arm ? 'X 臂先折' : '无臂折'} · ${tail}`
}

// 版本回放选择器：点哪个版本，就加载该版本真实仿真配置采样的运动轨道并自动播放折叠。
export function VersionStrip({ cand }: { cand: string }) {
  const { ctrl, setCtrl } = useCtrl()
  const [vers, setVers] = useState<VersionInfo[]>(cache[cand] ?? [])

  useEffect(() => {
    if (cache[cand]) { setVers(cache[cand]); return }
    fetch(assetUrl(`models/${cand}/versions.json`)).then(r => r.json()).then(v => { cache[cand] = v; setVers(v) }).catch(() => setVers([]))
  }, [cand])

  const cur = vers.find(v => v.id === ctrl.version) ?? vers[vers.length - 1]

  return (
    <div className="version-strip">
      <div className="vs-row" role="tablist" aria-label="版本回放">
        <span className="vs-label">版本回放</span>
        {vers.map(v => (
          <button
            key={v.id}
            role="tab"
            aria-selected={ctrl.version === v.id}
            className={`vs-btn ${ctrl.version === v.id ? 'on' : ''} ${v.passed ? '' : 'fail'}`}
            onClick={() => setCtrl({ version: v.id, t: 0, playing: true, explode: 0, isolate: null })}
            title={v.source}
          >
            {v.label}
            <i className={`vs-dot ${v.passed ? 'ok' : 'bad'}`} />
          </button>
        ))}
      </div>
      {(() => {
        const hits = interferenceAt(cand, ctrl.version, ctrl.t)
        if (!hits.length) return null
        return (
          <p className="vs-interf">
            <b>版本回放实体干涉</b>：{hits.map(h => `${h.pair.replace('/', ' ↔ ')}（峰值 ${h.vol} mm³，t∈[${h.t0}, ${h.t1}]）`).join('；')}
            <span className="meta" style={{ display: 'block' }}>
              {hits[0].attribution === 'config_fail'
                ? '归因：该版本配置本就干涉（其仿真未通过）——干涉正是它被淘汰/修改的原因，非网页映射错误，亦非 R1-V6 原始 CAD 缺陷。'
                : '归因：该版本仿真通过，但回放使用 R1-V6 局部放大几何，与该版本仿真包络不同所致；非网页映射错误，亦非 R1-V6 原始 CAD 缺陷。'}
            </span>
          </p>
        )
      })()}
      {cur && (
        <p className="vs-readout">
          <b>{cur.label}</b>：{versionReadout(cur)}
          <span className="meta" style={{ display: 'block', marginTop: 4 }}>
            零件几何为 R1-V6 缩比模型；运动按该版本仿真配置由原工程运动学公式回放（示意回放，碰撞结论以该版本仿真结果为准）。来源：{cur.source}
          </span>
        </p>
      )}
    </div>
  )
}
