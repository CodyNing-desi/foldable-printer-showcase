import { useEffect, useState } from 'react'
import { EVIDENCE, EV_BY_ID, githubUrl } from '../data/evidence'
import { useApp, assetUrl } from '../state'

export function EvidenceModal() {
  const { evidence, openEvidence } = useApp()
  const [text, setText] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!evidence || evidence === 'index') return
    const item = EV_BY_ID[evidence]
    if (!item) return
    setText(null)
    setError(false)
    let alive = true
    fetch(assetUrl(`evidence/${item.file}`))
      .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.text() })
      .then(t => { if (alive) setText(t) })
      .catch(() => { if (alive) setError(true) })
    return () => { alive = false }
  }, [evidence])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') openEvidence(null) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [openEvidence])

  if (!evidence) return null
  const item = evidence === 'index' ? null : EV_BY_ID[evidence]

  return (
    <>
      <div className="overlay" onClick={() => openEvidence(null)} />
      <div className="modal" role="dialog" aria-modal="true" aria-label={item ? item.title : '技术证据索引'}>
        <div className="modal-head">
          <h2>{item ? item.title : '技术证据索引（本地副本，离线可读）'}</h2>
          <div className="meta">
            {item ? (
              <>
                <span className="mono">{item.branch} · {item.repoPath}</span>
                <a href={githubUrl(item)} target="_blank" rel="noreferrer">在 GitHub 打开 ↗</a>
              </>
            ) : (
              <span>仿真分支 sync/v2-to-v3_2_1 · CAD 分支 round1-demo-cad @ d35cbd1 · 全部文件已随网站本地打包</span>
            )}
          </div>
          <button className="close" onClick={() => openEvidence(null)} aria-label="关闭">✕</button>
        </div>
        <div className="modal-body">
          {item ? (
            error ? <p className="muted">本地副本加载失败。请通过 GitHub 链接查看原文。</p>
              : text === null ? <p className="muted">加载中…</p>
                : <pre>{text}</pre>
          ) : (
            <div className="modal-index">
              {EVIDENCE.map(e => (
                <div className="ev-item" key={e.id}>
                  <div>
                    <b>{e.title}</b>
                    <div className="d">{e.desc}</div>
                    <div className="d mono">{e.branch} · {e.repoPath}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn sm" onClick={() => openEvidence(e.id)}>本地阅读</button>
                    <a className="btn sm ghost" href={githubUrl(e)} target="_blank" rel="noreferrer">GitHub ↗</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
