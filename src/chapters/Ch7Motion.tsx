import { useEffect, useRef, useState } from 'react'
import { MOTIONS, phaseAt, phaseIndex } from '../data/motion'
import { useApp, useCtrl, useInView } from '../state'
import { MechanismViewer, webglAvailable } from '../three/MechanismViewer'
import type { ViewerCtrl as VCtrl } from '../three/MechanismViewer'
import { FramePlayer } from '../components/FramePlayer'
import { partLabel } from '../data/viewer'
import type { CamPreset } from '../data/viewer'
import { EV_BY_ID } from '../data/evidence'

const STROKE_SECONDS = 5.76 // 与原 GIF 48帧×120ms 一致

export function Ch7Motion() {
  const { motionTab, setMotionTab, openEvidence, reduced } = useApp()
  const { ctrl, setCtrl } = useCtrl()
  const [sceneRef, inView] = useInView<HTMLDivElement>()
  const [fallback, setFallback] = useState(!webglAvailable())
  const [treeOpen, setTreeOpen] = useState(false)
  const [instances, setInstances] = useState<string[]>([])
  const spec = MOTIONS.find(m => m.id === motionTab) ?? MOTIONS[0]
  const ctrlRef = useRef(ctrl)
  ctrlRef.current = ctrl

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}models/${motionTab}/manifest.json`).then(r => r.json()).then(m => setInstances(m.instances)).catch(() => setInstances([]))
  }, [motionTab])

  useEffect(() => {
    setCtrl({ t: 0, playing: false, explode: 0, xray: false, isolate: null, selectedPart: null, traces: false, preset: 'iso', presetToken: ctrl.presetToken + 1 })
    setFallback(!webglAvailable())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionTab])

  // 连续播放：推进真实运动学轨道参数 t
  useEffect(() => {
    if (!ctrl.playing || fallback) return
    let raf = 0, last = performance.now()
    const loop = (now: number) => {
      const dt = (now - last) / 1000; last = now
      const nt = ctrlRef.current.t + dt / STROKE_SECONDS
      if (nt >= 1) { setCtrl({ t: 1, playing: false }); return }
      setCtrl({ t: nt })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [ctrl.playing, fallback, setCtrl])

  const pIdx = phaseIndex(spec, ctrl.t)
  const phase = phaseAt(spec, ctrl.t)
  const viewerCtrl: VCtrl = {
    t: ctrl.t, explode: ctrl.explode, xray: ctrl.xray, isolate: ctrl.isolate,
    selected: ctrl.selectedPart, traces: ctrl.traces, labels: ctrl.labels,
    preset: ctrl.preset, presetToken: ctrl.presetToken, frameToken: ctrl.frameToken,
  }
  const presets: { id: CamPreset; label: string }[] = [
    { id: 'iso', label: '等轴' }, { id: 'front', label: '正视' }, { id: 'side', label: '侧视' },
    { id: 'top', label: '顶视' }, { id: 'detail', label: '关节特写' },
  ]

  return (
    <section className="chapter" id="ch7">
      <div className="wrap">
        <div className="kicker">CHAPTER 07 · 机构解释器</div>
        <h2 className="question">让机械自己解释机械</h2>
        <p className="lede">
          这不是手工动画：零件来自原始工程文件的逐件三维模型，运动由原工程文件里的<b>运动学公式</b>驱动。你可以旋转、点选零件、隔离、X 光、分阶段爆炸——所有操作都不会改变运动本身。
        </p>

        <div className="seg" role="tablist" aria-label="方案切换" style={{ marginBottom: 20 }}>
          {MOTIONS.map(m => (
            <button key={m.id} role="tab" aria-selected={motionTab === m.id} className={motionTab === m.id ? 'on' : ''} onClick={() => setMotionTab(m.id)}>{m.tab}</button>
          ))}
        </div>

        <div className="scene">
          <div className="scene-canvas" ref={sceneRef}>
            <span className="scene-badge">{spec.title} · 缩比 1:2 · {fallback ? '原始帧回退' : '真实 CAD 三维装配'}</span>
            {fallback ? (
              <FramePlayer cand={motionTab} />
            ) : (
              <MechanismViewer cand={motionTab} ctrl={viewerCtrl} onSelect={pid => setCtrl({ selectedPart: pid })} onFallback={() => setFallback(true)} className="viewer-fill" active={inView} />
            )}
            {!fallback && (
              <div className="scene-caption">
                <div className="cap-t">{phase.label} · {Math.round(ctrl.t * 100)}%</div>
                <div className="cap-d">{phase.purpose}｜风险：{phase.risk}</div>
              </div>
            )}
            {!fallback && treeOpen && (
              <div className="part-panel">
                <h4>零件树（{instances.length} 实例）</h4>
                {instances.map(pid => (
                  <button key={pid} className={`part-row ${ctrl.selectedPart === pid ? 'sel' : ''}`} onClick={() => setCtrl({ selectedPart: ctrl.selectedPart === pid ? null : pid })}>
                    <span className="dot" />{partLabel(pid)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="vbar">
            <button className="play-btn" aria-label={ctrl.playing ? '暂停' : '播放'} onClick={() => { if (!ctrl.playing && ctrl.t >= 1) setCtrl({ t: 0 }); setCtrl({ playing: !ctrl.playing }) }}>{ctrl.playing ? '❚❚' : '▶'}</button>
            <button className="btn sm" onClick={() => setCtrl({ t: 0, playing: true })}>↺ 重播</button>
            <input type="range" min={0} max={1} step={0.002} value={ctrl.t} onChange={e => setCtrl({ t: Number(e.target.value), playing: false })} aria-label="折叠进度" />
            <span className="meta mono" style={{ minWidth: 64 }}>{Math.round(ctrl.t * 100)}%</span>
            <div className="phasebar grow" style={{ flex: 2 }}>
              {spec.phases.map((p, i) => (
                <button key={i} className={i === pIdx ? 'on' : ''} style={{ width: `${(p.to - p.from) * 100}%` }} onClick={() => setCtrl({ t: p.from + 0.001, playing: false, frameToken: ctrl.frameToken + 1 })} title={p.detail}>
                  {(p.to - p.from) >= 0.12 ? p.label : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="vtools">
            {presets.map(p => (
              <button key={p.id} className={`chip ${ctrl.preset === p.id ? 'on' : ''}`} onClick={() => setCtrl({ preset: p.id, presetToken: ctrl.presetToken + 1 })}>{p.label}</button>
            ))}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 220 }}>
              <span className="meta">爆炸</span>
              <input type="range" min={0} max={1} step={0.01} value={ctrl.explode} onChange={e => setCtrl({ explode: Number(e.target.value), playing: false })} aria-label="爆炸分解进度" />
            </span>
            <button className="chip" onClick={() => setCtrl({ frameToken: ctrl.frameToken + 1 })}>重新取景</button>
            <button className={`chip ${ctrl.traces ? 'on' : ''}`} onClick={() => setCtrl({ traces: !ctrl.traces })}>运动轨迹</button>
            <button className={`chip ${ctrl.labels ? 'on' : ''}`} onClick={() => setCtrl({ labels: !ctrl.labels })}>关节标注</button>
            <button className={`chip ${ctrl.xray ? 'on' : ''}`} onClick={() => setCtrl({ xray: !ctrl.xray })}>X 光</button>
            <button className={`chip ${treeOpen ? 'on' : ''}`} onClick={() => setTreeOpen(o => !o)}>零件树</button>
            {ctrl.selectedPart && (
              <>
                <button className={`chip ${ctrl.isolate === ctrl.selectedPart ? 'on danger' : ''}`} onClick={() => setCtrl({ isolate: ctrl.isolate === ctrl.selectedPart ? null : ctrl.selectedPart })}>
                  {ctrl.isolate === ctrl.selectedPart ? '取消隔离' : `隔离 ${partLabel(ctrl.selectedPart)}`}
                </button>
                <button className="chip" onClick={() => setCtrl({ selectedPart: null, isolate: null })}>清除选择</button>
              </>
            )}
          </div>
        </div>

        <p className="verdict-line blue" style={{ marginTop: 26 }}>
          {spec.decision.role}——{spec.decision.why}
        </p>

        <details className="expand">
          <summary>查看证据：当前模型已验证 / 未验证 · 简化声明 · CAD 验证数据</summary>
          <div className="expand-body">
            <div className="boundary-grid" style={{ margin: '8px 0 16px' }}>
              <div className="boundary-col ok">
                <h3>已验证（CAD 级）</h3>
                <ul>{spec.decision.verified.map((v, i) => <li key={i}>{v}</li>)}</ul>
              </div>
              <div className="boundary-col todo">
                <h3>未验证 · 必须实物回答</h3>
                <ul>{spec.decision.notVerified.map((v, i) => <li key={i}>{v}</li>)}</ul>
              </div>
            </div>
            <p style={{ marginBottom: 12 }}><b>本方案简化声明：</b>{spec.disclaimer}</p>
            <table>
              <tbody>
                {spec.validation.map((v, i) => <tr key={i}><td>{v.label}</td><td className="num">{v.value}</td></tr>)}
              </tbody>
            </table>
            <div className="evidence-row">
              {['cadmotion', 'cadlimits', 'cadchangelog'].map(id => (
                <button key={id} className="btn sm ghost" onClick={() => openEvidence(id)}>{EV_BY_ID[id].title}</button>
              ))}
            </div>
            <p className="meta" style={{ marginTop: 12 }}>
              运动映射：scripts/export_cad.py 对原仓库 validate_r1.placements() 密集采样（161 步）生成变换轨道，浏览器端仅插值；
              关键姿态真值见 public/models/&lt;方案&gt;/keyposes.json。销/卡圈为紧固件，与原渲染器口径一致不进入运行时网格。
              {reduced && '（已按系统设置减少动效。）'}
            </p>
          </div>
        </details>
      </div>
    </section>
  )
}
