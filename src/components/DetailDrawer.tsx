import { useEffect } from 'react'
import { CAND_BY_ID } from '../data/candidates'
import { STAGES } from '../data/stages'
import { EV_BY_ID } from '../data/evidence'
import { STATUS_META } from '../data/types'
import { useApp, assetUrl } from '../state'
import { StatusBadge } from './StatusBadge'

export function DetailDrawer() {
  const { selected, openCandidate, openEvidence, setMotionTab, scrollTo } = useApp()

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') openCandidate(null) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [openCandidate])

  if (!selected) return null
  const c = CAND_BY_ID[selected]
  if (!c) return null

  return (
    <>
      <div className="overlay" onClick={() => openCandidate(null)} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={`${c.id} 详情`}>
        <button className="close" onClick={() => openCandidate(null)} aria-label="关闭">✕</button>
        <div className="muted small">{c.familyLabel} · {c.family}</div>
        <h2>{c.id} · {c.name}</h2>
        <div style={{ marginTop: 8 }}><StatusBadge status={c.finalStatus} label={c.finalLabel} /></div>

        <section>
          <h3>设计原理</h3>
          <p className="small muted" style={{ margin: 0 }}>{c.description}</p>
          <dl className="kv" style={{ marginTop: 10 }}>
            <dt>预期优势</dt><dd>{c.advantage}</dd>
            <dt>主要约束</dt><dd>{c.constraints}</dd>
          </dl>
        </section>

        {c.visual && (
          <section>
            <h3>真实 CAD 素材（R1-V6 · 1:2 缩比）</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <img src={assetUrl(`assets/${c.visual}/view_open.png`)} alt={`${c.id} 展开`} style={{ width: '100%', borderRadius: 8, background: '#fff' }} />
              <img src={assetUrl(`assets/${c.visual}/view_folded.png`)} alt={`${c.id} 折叠`} style={{ width: '100%', borderRadius: 8, background: '#fff' }} />
            </div>
            <button className="btn sm" style={{ marginTop: 10 }} onClick={() => {
              setMotionTab(c.visual!)
              openCandidate(null)
              scrollTo('ch7')
            }}>查看运动演示 →</button>
          </section>
        )}

        <section>
          <h3>关键指标（跨版本不可直接排序）</h3>
          {c.keyMetrics.map((m, i) => (
            <div className="metric-row" key={i}>
              <span className="muted">{m.label}<span className="vtag">{m.version}</span></span>
              <span className="v">{m.value}</span>
            </div>
          ))}
        </section>

        <section>
          <h3>状态变化时间线</h3>
          <div className="timeline">
            {STAGES.map(s => {
              const cell = s.cells[c.id]
              return (
                <div className="hist-item" key={s.id}>
                  <div className="h-stage">
                    {s.label} <StatusBadge status={cell.status} />
                  </div>
                  <div className="h-note">{cell.note || '—'}</div>
                  <div className="h-ver">{s.version} · {s.resultType}</div>
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <h3>淘汰 / 入围原因</h3>
          <ul className="reason-list">
            {c.decisionReasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </section>

        <section>
          <h3>证据文件</h3>
          <div className="ev-list">
            {c.evidence.map(id => {
              const e = EV_BY_ID[id]
              if (!e) return null
              return (
                <div className="ev-item" key={id}>
                  <span>{e.title}<br /><span className="tiny muted mono">{e.repoPath}</span></span>
                  <button className="btn sm" onClick={() => openEvidence(id)}>查看</button>
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <h3>当前冻结状态</h3>
          <p className="small" style={{ margin: 0, color: STATUS_META[c.finalStatus].color }}>{c.finalLabel}</p>
        </section>
      </aside>
    </>
  )
}
