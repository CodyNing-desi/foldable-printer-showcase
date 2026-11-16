import { useEffect, useRef, useState } from 'react'
import { MOTIONS, phaseAt, phaseIndex } from '../data/motion'
import type { MotionSpec } from '../data/motion'
import { useApp, assetUrl } from '../state'
import { ExplainerOverlay, Magnifier, PhaseInsight, DecisionBanner } from '../components/MotionExplainer'
import { Icon } from '../components/Icons'

interface Manifest { [mech: string]: { n_frames: number; size: number[]; frames: { file: string; t: number; delay_ms: number }[] } }

export function Ch7Motion() {
  const { motionTab, setMotionTab, openEvidence } = useApp()
  const [manifest, setManifest] = useState<Manifest | null>(null)

  useEffect(() => {
    fetch(assetUrl('assets/motion_manifest.json'))
      .then(r => r.json())
      .then(setManifest)
      .catch(() => setManifest(null))
  }, [])

  const spec = MOTIONS.find(m => m.id === motionTab) ?? MOTIONS[0]

  return (
    <section className="chapter" id="ch7">
      <div className="container">
        <div className="ch-kicker">CHAPTER 07 · 最终机构运动展示</div>
        <h2 className="ch-title">不只是"它在动"——每一步为什么这么动</h2>
        <p className="ch-lead">
          动画全部来自仓库 <strong>round1-demo-cad @ d35cbd1</strong> 的真实渲染帧（48 帧 · 640×500 · 120 ms/帧）。
          解释层标出当前阶段的关键关节、运动目的与风险点；放大镜裁切真实帧局部；每条路线附"已验证 / 未验证"边界。
        </p>

        <div className="motion-tabs" role="tablist" aria-label="方案切换">
          {MOTIONS.map(m => (
            <button key={m.id} role="tab" aria-selected={motionTab === m.id}
              className={`motion-tab ${motionTab === m.id ? 'active' : ''}`}
              onClick={() => setMotionTab(m.id)}>
              {m.tab}
            </button>
          ))}
        </div>

        {manifest && manifest[spec.id] ? (
          <MotionView key={spec.id} spec={spec} frames={manifest[spec.id].frames} />
        ) : (
          <p className="muted">素材加载中…（若持续失败，请确认通过本地服务器打开构建版本）</p>
        )}

        <div className="disclaimer" style={{ marginTop: 24 }}>
          <b>重要技术声明：</b>R1-V6 是缩比（1:2）机械原理演示模型，不是整机性能验证件。
          F09 采用刚性同步杆简化原始双丝杆/同步带机构；SCZ 采用手动固定端与滑动端剪叉（与仿真对称丝杆驱动不同）。
          本网站不宣称这些缩比模型已完成原方案的电机驱动、载荷、回差或寿命验证。
          L2 为 2001 步密集采样 + 凸包保守检查，非连续碰撞认证；L4 打印试件待现场确认。
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="ev-link" onClick={() => openEvidence('cadlimits')}>模型限制声明</button>
            <button className="ev-link" onClick={() => openEvidence('cadmotion')}>运动与装配验证报告</button>
            <button className="ev-link" onClick={() => openEvidence('cadchangelog')}>V5→V6 变更表</button>
          </div>
        </div>
      </div>
    </section>
  )
}

function MotionView({ spec, frames }: { spec: MotionSpec; frames: { file: string; t: number; delay_ms: number }[] }) {
  const { playToken, reduced } = useApp()
  const [frame, setFrame] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [overlay, setOverlay] = useState(true)
  const frameRef = useRef(frame)
  frameRef.current = frame
  const n = frames.length

  useEffect(() => {
    let alive = true
    let loaded = 0
    frames.forEach(f => {
      const img = new Image()
      img.onload = img.onerror = () => {
        loaded++
        if (alive && loaded >= Math.min(8, frames.length)) setReady(true)
      }
      img.src = assetUrl(f.file)
    })
    return () => { alive = false }
  }, [frames])

  useEffect(() => {
    if (playToken > 0) {
      if (frameRef.current >= n - 1) setFrame(0)
      setPlaying(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playToken])

  useEffect(() => {
    if (!playing || !ready) return
    let raf = 0
    let last = performance.now()
    let acc = 0
    const loop = (now: number) => {
      acc += now - last
      last = now
      const delay = frames[frameRef.current]?.delay_ms ?? 120
      if (acc >= delay) {
        acc = 0
        if (frameRef.current >= n - 1) {
          setPlaying(false)
          return
        }
        setFrame(f => Math.min(n - 1, f + 1))
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing, ready, frames, n])

  const t = frames[frame]?.t ?? 0
  const phase = phaseAt(spec, t)
  const pIdx = phaseIndex(spec, t)
  const toggle = () => {
    if (!playing && frame >= n - 1) setFrame(0)
    setPlaying(p => !p)
  }
  const replay = () => { setFrame(0); setPlaying(true) }
  const jump = (tt: number) => {
    setPlaying(false)
    setFrame(Math.round(tt * (n - 1)))
  }

  return (
    <div className="motion-grid">
      <div className="player">
        <div className="player-head">
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{spec.title}</div>
            <div className="tiny muted">{spec.subtitle}</div>
          </div>
          <button className={`btn sm ${overlay ? 'primary' : 'ghost'}`} onClick={() => setOverlay(o => !o)} aria-pressed={overlay}>
            <Icon name="eye" size={13} /> 解释层 {overlay ? '开' : '关'}
          </button>
        </div>
        <div className="screen">
          <img src={assetUrl(frames[frame].file)} alt={`${spec.title} 帧 ${frame + 1}/${n}，t=${t.toFixed(2)}`} />
          {overlay && ready && <ExplainerOverlay spec={spec} phaseIdx={pIdx} />}
          {!ready && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>帧加载中…</div>}
        </div>
        <div className="player-controls">
          <button className="play-btn" onClick={toggle} aria-label={playing ? '暂停' : '播放'}>{playing ? '❚❚' : '▶'}</button>
          <button className="btn sm" onClick={replay}>↺ 重新播放</button>
          <input
            type="range" min={0} max={n - 1} step={1} value={frame}
            onChange={e => { setPlaying(false); setFrame(Number(e.target.value)) }}
            aria-label="运动进度（逐帧拖动）"
          />
          <span className="mono tiny muted" style={{ minWidth: 110, textAlign: 'right' }}>
            帧 {String(frame + 1).padStart(2, '0')}/{n} · t={t.toFixed(2)}
          </span>
        </div>
        <div className="phase-bar" aria-hidden="true">
          {spec.phases.map((p, i) => (
            <div key={p.label + p.from}
              className={`phase-seg ${i === pIdx ? 'on' : ''}`}
              style={{ width: `${(p.to - p.from) * 100}%` }}>
              {(p.to - p.from) >= 0.12 ? p.label : ''}
            </div>
          ))}
        </div>
        <div className="phase-detail">
          <b>当前阶段：{phase.label}</b> · {phase.detail}
        </div>
        <PhaseInsight spec={spec} phaseIdx={pIdx} />
        <div className="keyframes">
          {spec.keyframes.map(k => (
            <button key={k.name}
              className={`kf-btn ${Math.abs(t - k.t) < 0.03 ? 'active' : ''}`}
              onClick={() => jump(k.t)}>
              {k.name} t={k.t.toFixed(2)}
            </button>
          ))}
        </div>
        <div className="kf-strip">
          {spec.keyframes.map(k => (
            <button key={k.name} className={Math.abs(t - k.t) < 0.03 ? 'active' : ''} onClick={() => jump(k.t)} aria-label={`关键帧 ${k.name}`}>
              <img src={assetUrl(k.file)} alt={`${spec.id} ${k.name}姿态截图`} />
              <span className="cap">{k.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="motion-side">
        <DecisionBanner spec={spec} />
        <Magnifier spec={spec} phaseIdx={pIdx} frameFile={frames[frame].file} />
        <div className="panel" style={{ marginTop: 14 }}>
          <h3>台架关注点</h3>
          <ul className="focus-list">
            {spec.focus.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
        <div className="panel" style={{ marginTop: 14 }}>
          <h3>CAD 级验证（R1-V6）</h3>
          <div className="val-list">
            {spec.validation.map((v, i) => (
              <div className="val-item" key={i}><span className="l">{v.label}</span><span className="mono">{v.value}</span></div>
            ))}
          </div>
          <p className="tiny muted" style={{ margin: '10px 0 0' }}>CAD 检查 ≠ 真实打印测试；装配与载荷结果待实物回填。</p>
        </div>
        <div className="panel" style={{ marginTop: 14 }}>
          <h3>运动简图（仓库素材）</h3>
          <img src={assetUrl(`assets/${spec.id}/joint_schematic.png`)} alt={`${spec.id} 关节运动简图`} style={{ width: '100%', borderRadius: 8, background: '#fff' }} />
        </div>
        <div className="disclaimer"><b>本方案简化：</b>{spec.disclaimer}</div>
      </div>
    </div>
  )
}
