import { useEffect, useState } from 'react'
import { CHAPTERS, useApp } from '../state'

export function Nav() {
  const { activeChapter, scrollTo, startAuto, auto } = useApp()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const fn = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      setProgress(max > 0 ? h.scrollTop / max : 0)
    }
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className="nav" aria-label="章节导航">
      <div className="nav-brand">可折叠3D打印机<span>方案筛选全过程</span></div>
      <div className="nav-links">
        {CHAPTERS.map(c => (
          <button
            key={c.id}
            className={`nav-link ${activeChapter === c.id ? 'active' : ''}`}
            onClick={() => scrollTo(c.id)}
          >
            <span className="no">{c.no}</span>{c.label}
          </button>
        ))}
      </div>
      {!auto.active && (
        <button className="nav-auto" onClick={startAuto}>▶ 播放筛选过程</button>
      )}
      <div className="nav-progress" style={{ width: `${progress * 100}%` }} />
    </nav>
  )
}
