import { useEffect, useRef, useState } from 'react'
import { MATRIX_V1, MATRIX_COLS, SINUSOID } from '../data/analysis'
import { CAND_BY_ID } from '../data/candidates'
import { useApp } from '../state'

type Mode = 'nominal' | 'optimized'
type DemoMode = 'before' | 'certified' | 'unresolved'

interface Tip { x: number; y: number; title: string; body: string; src: string }

function cellInfo(row: typeof MATRIX_V1[number], key: string): { text: string; ok: boolean | null; detail: string } {
  const r = row as unknown as Record<string, number | string | null>
  const v = r[key]
  if (key === 'intersection') {
    if (v === null) return { text: '—', ok: null, detail: '未提供' }
    const n = v as number
    return { text: n === 0 ? '0' : n.toFixed(n < 100 ? 3 : 1), ok: n === 0, detail: `名义轨迹最大穿透面积 ${n} mm²；判据：= 0` }
  }
  if (key === 'storage') {
    const n = v as number
    return { text: n.toFixed(3), ok: n <= 0.8, detail: `系统收纳比 ${n.toFixed(4)}；判据：≤ 0.800（含附件包络）` }
  }
  if (key === 'coverage' || key === 'reachable') {
    const n = v as number
    return { text: n.toFixed(1), ok: n >= 1, detail: `${key === 'coverage' ? '工作空间覆盖' : '可达比例'} ${n}；判据：= 1.0` }
  }
  if (key === 'deflection') {
    if (v === null) return { text: '未确认', ok: null, detail: '仅 V1 优化四候选（F07/F08/F12/SCZ）有降阶挠度值；其余候选未进入优化' }
    return { text: (v as number).toFixed(3), ok: true, detail: `10 N 侧载降阶挠度 ${v} mm（L2 降阶、未标定，跨族为启发式）` }
  }
  if (key === 'p95') {
    if (v === null) return { text: '未确认', ok: null, detail: '仅推荐/备选方案补算 20,000 次误差抽样' }
    return { text: (v as number).toFixed(3), ok: true, detail: `重复定位 P95 = ${v} mm（20,000 次抽样，模型值非实测）` }
  }
  return { text: '—', ok: null, detail: '' }
}

export function Ch3Matrix() {
  const { openEvidence, openCandidate, reduced } = useApp()
  const [mode, setMode] = useState<Mode>('nominal')
  const [tip, setTip] = useState<Tip | null>(null)

  const rows = mode === 'nominal' ? MATRIX_V1 : MATRIX_V1.filter(r => ['F07', 'F08', 'F12', 'SCZ'].includes(r.id))

  return (
    <section className="chapter" id="ch3">
      <div className="container">
        <div className="ch-kicker">CHAPTER 03 · 第一轮统一筛选</div>
        <h2 className="ch-title">为什么需要统一评价标准？</h2>
        <p className="ch-lead">
          15 套机构的运动方式完全不同，无法凭直觉比较。第一轮把它们放进同一套硬约束：
          <strong>无穿透、可达、工作空间、系统收纳比 ≤ 0.800</strong>，再叠加刚度、误差、驱动力与成本。
          悬停任意单元格查看数值、单位、判据与来源。
        </p>

        <div className="seg-btns">
          <button className={`seg-btn ${mode === 'nominal' ? 'active' : ''}`} onClick={() => setMode('nominal')}>名义筛选（15 候选 · V1 修正 201 姿态）</button>
          <button className={`seg-btn ${mode === 'optimized' ? 'active' : ''}`} onClick={() => setMode('optimized')}>优化后可行解（4 候选 · 1001/5001 姿态复验）</button>
        </div>

        <div className="legend">
          <span><i style={{ background: 'rgba(67,192,120,0.5)' }} />通过判据</span>
          <span><i style={{ background: 'rgba(217,106,106,0.5)' }} />未通过判据</span>
          <span><i style={{ background: 'var(--bg3)' }} />未确认 / 不适用</span>
          <span className="muted tiny">来源：simulation/results/screening_summary.json + selection.json（分支 sync/v2-to-v3_2_1）</span>
        </div>

        <div className="matrix-wrap">
          <table className="matrix">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>候选</th>
                {MATRIX_COLS.map(c => <th key={c.key}>{c.label}<span className="unit">{c.unit}</span></th>)}
                <th>名义结果</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
                  <td className="rowhead">
                    <button className="ev-link" style={{ fontWeight: 700 }} onClick={() => openCandidate(row.id)}>{row.id}</button>
                    {' '}<span className="muted tiny">{CAND_BY_ID[row.id].name}</span>
                  </td>
                  {MATRIX_COLS.map(col => {
                    const info = cellInfo(row, col.key)
                    const cls = info.ok === null ? 'na' : info.ok ? 'ok' : 'bad'
                    return (
                      <td
                        key={col.key}
                        className={`cell ${cls}`}
                        onMouseEnter={e => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect()
                          setTip({
                            x: Math.min(rect.left, window.innerWidth - 360), y: rect.bottom + 8,
                            title: `${row.id} · ${col.label}（${col.unit}）`,
                            body: `${info.detail}。判据：${col.criterion}。${col.note}`,
                            src: '来源：screening_summary.json / selection.json（V1 修正口径）',
                          })
                        }}
                        onMouseLeave={() => setTip(null)}
                      >
                        {info.text}
                      </td>
                    )
                  })}
                  <td className={`cell ${row.passed ? 'ok' : 'bad'}`}>{row.passed ? '通过' : '失败'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tip && (
          <div className="tooltip" style={{ left: tip.x, top: tip.y }}>
            <b>{tip.title}</b>{tip.body}<span className="src">{tip.src}</span>
          </div>
        )}

        <div className="concept-cards">
          <div className="panel">
            <h3>名义筛选</h3>
            <p className="small muted" style={{ margin: 0 }}>按 config 声明的名义参数跑统一硬约束。回答"这套机构在默认尺寸下是否自洽"。V1 修正后名义通过仅 F07/F08/F12/SCZ。</p>
          </div>
          <div className="panel">
            <h3>优化后可行解</h3>
            <p className="small muted" style={{ margin: 0 }}>NSGA-II 在参数边界内搜索，回答"是否存在一组尺寸让它可行"。F04 曾在抽象模型里找到可行解——模型补全后失效（见 Chapter 04）。</p>
          </div>
          <div className="panel">
            <h3>最终工程入围</h3>
            <p className="small muted" style={{ margin: 0 }}>在可行解之上叠加机构族多样性、六周制造窗口与实物证据增益。F12 仿真可行仍被 No-Go（见 Chapter 05）。</p>
          </div>
        </div>

        <SamplingDemo reduced={reduced} />

        <div className="panel" style={{ marginTop: 22 }}>
          <h3>为什么 31 个离散姿态不足以证明连续无碰撞？</h3>
          <p className="small muted" style={{ margin: '0 0 8px' }}>
            真实记录：F04 名义最大穿透从 31 姿态的 <b className="mono">22.222 mm²</b> 增至 1001 姿态的 <b className="mono">22.825 mm²</b>——采样会漏掉极值。
            V3.2 验收进一步发现：从离散采样推断运动上界的算法，会把一个真实碰撞的正弦运动误判为 PASS。
            V3.2.1 改用解析运动上界认证，缺少可信上界时强制返回 UNRESOLVED，绝不静默 PASS。
          </p>
          <button className="ev-link" onClick={() => openEvidence('report321')}>V3.2.1 验收纠错报告</button>
          {' '}<button className="ev-link" onClick={() => openEvidence('review1')}>第一轮独立审查 · medium-5</button>
        </div>
      </div>
    </section>
  )
}

function SamplingDemo({ reduced }: { reduced: boolean }) {
  const [demo, setDemo] = useState<DemoMode>('before')
  const [t, setT] = useState(0)
  const raf = useRef(0)

  useEffect(() => {
    if (reduced) { setT(0.25); return }
    let last = performance.now()
    const loop = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setT(x => (x + dt / 4) % 1)
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [reduced])

  const W = 640, H = 240, pad = 46
  const xOf = (tt: number) => pad + tt * (W - 2 * pad)
  const yOf = (x: number) => H / 2 - x * 1.7
  const path = Array.from({ length: 101 }, (_, i) => {
    const tt = i / 100
    return `${i === 0 ? 'M' : 'L'}${xOf(tt).toFixed(1)},${yOf(50 * Math.sin(2 * Math.PI * tt)).toFixed(1)}`
  }).join(' ')
  const samples = demo === 'certified' ? [0, 0.25, 0.5, 1] : [0, 0.5, 1]
  const curX = 50 * Math.sin(2 * Math.PI * t)
  const colliding = curX > 48
  const v = SINUSOID[demo]

  return (
    <div className="sampling">
      <div>
        <div className="seg-btns">
          <button className={`seg-btn ${demo === 'before' ? 'active' : ''}`} onClick={() => setDemo('before')}>V3.2 修复前（3 次采样）</button>
          <button className={`seg-btn ${demo === 'certified' ? 'active' : ''}`} onClick={() => setDemo('certified')}>V3.2.1 认证上界</button>
          <button className={`seg-btn ${demo === 'unresolved' ? 'active' : ''}`} onClick={() => setDemo('unresolved')}>无上界 Callable</button>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="正弦往复运动采样反例">
          <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="var(--line)" strokeWidth="1" />
          <rect x={pad} y={yOf(52)} width={W - 2 * pad} height={yOf(48) - yOf(52)} fill="rgba(239,95,95,0.12)" stroke="var(--st-nogo)" strokeDasharray="5 4" strokeWidth="1" />
          <text x={W - pad - 4} y={yOf(52) - 6} fill="var(--st-nogo)" fontSize="12" textAnchor="end">障碍区（x ≥ 48 mm，最大穿透 2 mm）</text>
          <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" />
          {samples.map(s => (
            <g key={s}>
              <line x1={xOf(s)} y1={H / 2 - 6} x2={xOf(s)} y2={H / 2 + 6} stroke="var(--text3)" strokeWidth="1.5" />
              <circle cx={xOf(s)} cy={yOf(50 * Math.sin(2 * Math.PI * s))} r="4.5" fill="var(--text3)" />
              <text x={xOf(s)} y={H - 8} fill="var(--text3)" fontSize="11" textAnchor="middle">t={s}</text>
            </g>
          ))}
          {demo === 'certified' && (
            <text x={xOf(0.25)} y={yOf(50) - 12} fill="var(--st-pass)" fontSize="12" textAnchor="middle">自适应细分捕获 t=0.25</text>
          )}
          <circle cx={xOf(t)} cy={yOf(curX)} r="7" fill={colliding ? 'var(--st-nogo)' : 'var(--st-pass)'} stroke="#0b1220" strokeWidth="2" />
          <text x={pad} y={20} fill="var(--text2)" fontSize="13">x(t) = 50·sin(2πt) mm · 真实仓库反例</text>
        </svg>
      </div>
      <div>
        <div className={`verdict ${demo === 'before' ? 'pass' : demo === 'certified' ? 'fail' : 'unresolved'}`}>
          <span className="tiny muted">算法输出（v3_2_1_verification_summary.json）</span>
          <b style={{ color: demo === 'before' ? 'var(--st-nogo)' : demo === 'certified' ? 'var(--st-pass)' : 'var(--st-conditional)' }}>
            {v.status}{demo === 'before' ? '（误判）' : ''}
          </b>
          <p className="small muted" style={{ margin: '6px 0 0' }}>{v.note}</p>
          <p className="tiny mono muted" style={{ margin: '6px 0 0' }}>
            evals = {v.evals}{demo === 'certified' ? ` · t_collision = ${SINUSOID.certified.t} · pen = ${SINUSOID.certified.pen.toFixed(3)} mm · ${SINUSOID.certified.bound}` : ''}
          </p>
        </div>
        <p className="tiny muted" style={{ marginTop: 10 }}>
          绿点为当前运动位置；灰点为算法实际评估的采样时刻。修复前算法只评估 t=0/0.5/1（均在原点），
          漏掉 t=0.25 的真实碰撞。认证上界 v_max=100π 强制细分后才捕获。
        </p>
      </div>
    </div>
  )
}
