import { AUTO_STEPS, AUTO_TOTAL } from '../autoplay'
import { useApp } from '../state'

export function AutoplayBar() {
  const { auto, togglePause, autoNext, autoPrev, exitAuto } = useApp()
  if (!auto.active) return null
  const step = AUTO_STEPS[auto.index]
  const elapsed = AUTO_STEPS.slice(0, auto.index).reduce((s, x) => s + x.dur, 0) + step.dur * auto.progress

  return (
    <div className="auto-bar" role="region" aria-label="自动演示控制">
      <div className="auto-cap">
        <span className="idx">段落 {auto.index + 1}/{AUTO_STEPS.length}</span>
        {step.caption}
      </div>
      <div className="auto-row">
        <button className="btn" onClick={autoPrev} disabled={auto.index === 0}>← 上一段</button>
        <button className="btn primary" onClick={togglePause}>{auto.paused ? '▶ 继续' : '❚❚ 暂停'}</button>
        <button className="btn" onClick={autoNext}>{auto.index === AUTO_STEPS.length - 1 ? '结束' : '下一段 →'}</button>
        <div className="auto-progress"><i style={{ width: `${auto.progress * 100}%` }} /></div>
        <span className="auto-time">{Math.round(elapsed)}s / {AUTO_TOTAL}s</span>
        <button className="btn ghost" onClick={exitAuto}>✕ 退出演示</button>
      </div>
    </div>
  )
}
