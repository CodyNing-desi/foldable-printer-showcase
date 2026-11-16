import { useEffect, useRef, useState } from 'react'
import { MATRIX_V1, MATRIX_COLS, SINUSOID } from '../data/analysis'
import { CAND_BY_ID } from '../data/candidates'
import { useApp } from '../state'

type DemoMode = 'before' | 'certified' | 'unresolved'

export function Ch3Matrix() {
  const { openEvidence, reduced } = useApp()
  const [demo, setDemo] = useState<DemoMode>('before')
  const [t, setT] = useState(0)
  const raf = useRef(0)

  useEffect(() => {
    if (reduced) { setT(0.25); return }
    let last = performance.now()
    const loop = (now: number) => {
      const dt = (now - last) / 1000; last = now
      setT(x => (x + dt / 4) % 1)
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [reduced])

  const W = 760, H = 320, pad = 56
  const xOf = (tt: number) => pad + tt * (W - 2 * pad)
  const yOf = (x: number) => H / 2 - x * 2.1
  const path = Array.from({ length: 121 }, (_, i) => {
    const tt = i / 120
    return `${i === 0 ? 'M' : 'L'}${xOf(tt).toFixed(1)},${yOf(50 * Math.sin(2 * Math.PI * tt)).toFixed(1)}`
  }).join(' ')
  const samples = demo === 'certified' ? [0, 0.25, 0.5, 1] : [0, 0.5, 1]
  const curX = 50 * Math.sin(2 * Math.PI * t)
  const colliding = curX > 48
  const v = SINUSOID[demo]

  return (
    <section className="chapter" id="ch3">
      <div className="wrap">
        <div className="kicker">CHAPTER 03 · 统一标准</div>
        <h2 className="question">31 个离散姿态，够证明连续无碰撞吗？</h2>
        <p className="lede">不够。这是 V3.2 验收抓到的真实反例：一个正弦往复运动，<b>采样点全在原点，碰撞藏在两点之间</b>。V3.2.1 改用解析运动上界强制细分，缺上界就拒绝下结论。</p>

        <div className="sampling-grid">
          <div>
            <div className="seg" style={{ marginBottom: 18 }}>
              <button className={demo === 'before' ? 'on danger' : ''} onClick={() => setDemo('before')}>修复前 · 3 点采样</button>
              <button className={demo === 'certified' ? 'on' : ''} onClick={() => setDemo('certified')}>认证上界</button>
              <button className={demo === 'unresolved' ? 'on' : ''} onClick={() => setDemo('unresolved')}>无上界</button>
            </div>
            <svg className="sampling-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="正弦采样反例">
              <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="var(--line)" strokeWidth="1.5" />
              <rect x={pad} y={yOf(52)} width={W - 2 * pad} height={yOf(48) - yOf(52)} fill="rgba(232,80,58,0.10)" stroke="var(--red)" strokeDasharray="6 5" strokeWidth="1.5" />
              <text x={W - pad - 6} y={yOf(52) - 10} fill="var(--red)" fontSize="17" textAnchor="end">障碍区 x ≥ 48 mm</text>
              <path d={path} fill="none" stroke="var(--blue)" strokeWidth="2.5" />
              {samples.map(s => (
                <g key={s}>
                  <circle cx={xOf(s)} cy={yOf(50 * Math.sin(2 * Math.PI * s))} r="6" fill="var(--faint)" />
                  <text x={xOf(s)} y={H - 12} fill="var(--faint)" fontSize="16" textAnchor="middle">t={s}</text>
                </g>
              ))}
              {demo === 'certified' && <text x={xOf(0.25)} y={yOf(50) - 16} fill="var(--green)" fontSize="17" textAnchor="middle" fontWeight="700">细分捕获 t=0.25</text>}
              <circle cx={xOf(t)} cy={yOf(curX)} r="9" fill={colliding ? 'var(--red)' : 'var(--green)'} stroke="#fff" strokeWidth="3" />
              <text x={pad} y={28} fill="var(--muted)" fontSize="18">x(t) = 50·sin(2πt) mm · 仓库真实反例</text>
            </svg>
          </div>
          <div>
            <div className={`verdict-big ${demo === 'before' ? 'bad' : demo === 'certified' ? 'good' : 'warn'}`}>
              {v.status}{demo === 'before' ? '（误判）' : ''}
            </div>
            <p style={{ fontSize: 21, color: 'var(--muted)', margin: '12px 0' }}>{v.note}</p>
            <p className="meta mono">evals = {v.evals}{demo === 'certified' ? ` · t=0.25 · 穿透 2.000 mm · v_max=100π` : ''}</p>
            <p className="verdict-line" style={{ marginTop: 24 }}>采样密度稳定 ≠ 连续轨迹已证明。</p>
            <div className="evidence-row">
              <button className="btn sm ghost" onClick={() => openEvidence('report321')}>V3.2.1 验收纠错报告</button>
              <button className="btn sm ghost" onClick={() => openEvidence('review1')}>独立审查 · medium-5</button>
            </div>
          </div>
        </div>

        <details className="expand">
          <summary>查看证据：15 候选统一指标矩阵（V1 修正口径）与三种"通过"的区别</summary>
          <div className="expand-body">
            <p style={{ marginBottom: 12 }}>
              <b>名义筛选</b>＝默认尺寸下是否自洽；<b>优化后可行解</b>＝是否存在一组尺寸让它可行（F04 曾在此"假可行"）；
              <b>工程入围</b>＝再叠加机构族多样性、六周窗口与证据增益（F12 仿真可行仍被 No-Go）。三者不是同一概念。
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr><th>候选</th>{MATRIX_COLS.map(c => <th key={c.key}>{c.label}<br /><span className="meta">{c.unit} · {c.criterion}</span></th>)}<th>名义</th></tr>
                </thead>
                <tbody>
                  {MATRIX_V1.map(row => (
                    <tr key={row.id}>
                      <td><b>{row.id}</b> <span className="meta">{CAND_BY_ID[row.id].name}</span></td>
                      {MATRIX_COLS.map(col => {
                        const val = (row as unknown as Record<string, number | null>)[col.key]
                        let text = '—', color = 'var(--faint)'
                        if (col.key === 'intersection' && val !== null) { text = val === 0 ? '0' : val.toFixed(val < 100 ? 3 : 1); color = val === 0 ? 'var(--green)' : 'var(--red)' }
                        if (col.key === 'storage' && val !== null) { text = val.toFixed(3); color = val <= 0.8 ? 'var(--green)' : 'var(--red)' }
                        if ((col.key === 'coverage' || col.key === 'reachable') && val !== null) { text = val.toFixed(1); color = val >= 1 ? 'var(--green)' : 'var(--red)' }
                        if (col.key === 'deflection') { text = val === null ? '未确认' : val.toFixed(3); color = val === null ? 'var(--faint)' : 'var(--ink)' }
                        if (col.key === 'p95') { text = val === null ? '未确认' : val.toFixed(3); color = val === null ? 'var(--faint)' : 'var(--ink)' }
                        return <td key={col.key} className="num" style={{ color, fontWeight: 600 }}>{text}</td>
                      })}
                      <td style={{ color: row.passed ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{row.passed ? '通过' : '失败'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="meta" style={{ marginTop: 10 }}>来源：screening_summary.json + selection.json（分支 sync/v2-to-v3_2_1）。挠度/重复定位仅优化四候选有值；跨版本数值不可直接排序。</p>
          </div>
        </details>
      </div>
    </section>
  )
}
