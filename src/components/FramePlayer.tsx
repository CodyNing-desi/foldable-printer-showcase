import { useEffect, useRef, useState } from 'react'
import { assetUrl } from '../state'

interface Frame { file: string; t: number; delay_ms: number }

// 回退播放器：WebGL 不可用或 GLB 加载失败时，使用原始 R1-V6 渲染帧。
export function FramePlayer({ cand }: { cand: string }) {
  const [frames, setFrames] = useState<Frame[] | null>(null)
  const [frame, setFrame] = useState(0)
  const [playing, setPlaying] = useState(false)
  const ref = useRef(frame)
  ref.current = frame

  useEffect(() => {
    fetch(assetUrl('assets/motion_manifest.json')).then(r => r.json()).then(m => setFrames(m[cand]?.frames ?? null)).catch(() => setFrames(null))
  }, [cand])

  useEffect(() => {
    if (!playing || !frames) return
    let raf = 0, last = performance.now(), acc = 0
    const loop = (now: number) => {
      acc += now - last; last = now
      if (acc >= (frames[ref.current]?.delay_ms ?? 120)) {
        acc = 0
        if (ref.current >= frames.length - 1) { setPlaying(false); return }
        setFrame(f => f + 1)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing, frames])

  if (!frames) return <div className="viewer-loading">帧素材加载中…</div>
  return (
    <div className="frameplayer">
      <div className="screen"><img src={assetUrl(frames[frame].file)} alt={`${cand} 帧 ${frame + 1}`} /></div>
      <div className="vbar" style={{ borderTop: 'none' }}>
        <button className="play-btn" onClick={() => { if (!playing && frame >= frames.length - 1) setFrame(0); setPlaying(p => !p) }}>{playing ? '❚❚' : '▶'}</button>
        <button className="btn sm" onClick={() => { setFrame(0); setPlaying(true) }}>↺ 重播</button>
        <input type="range" min={0} max={frames.length - 1} value={frame} onChange={e => { setPlaying(false); setFrame(Number(e.target.value)) }} aria-label="帧进度" />
        <span className="meta mono">帧 {frame + 1}/{frames.length} · 原始 CAD 渲染帧回退模式</span>
      </div>
    </div>
  )
}
