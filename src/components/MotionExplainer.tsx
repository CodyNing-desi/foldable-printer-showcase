import type { MotionSpec } from '../data/motion'
import { assetUrl } from '../state'
import { Icon } from './Icons'

// 解释层：叠加在真实 CAD 帧上的原理示意标注（位置为示意，非像素级关节坐标）。
export function ExplainerOverlay({ spec, phaseIdx }: { spec: MotionSpec; phaseIdx: number }) {
  const marks = spec.marks.filter(m => m.phase === phaseIdx)
  return (
    <div className="explainer-overlay" aria-hidden="true">
      {marks.map((m, i) => (
        <div key={i} className={`mark mark-${m.kind}`} style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%` }}>
          <span className="mark-dot">{m.kind === 'risk' ? <Icon name="alert" size={11} /> : m.kind === 'path' ? <Icon name="arrow" size={11} /> : null}</span>
          <span className="mark-label">{m.label}</span>
        </div>
      ))}
      <span className="overlay-tag">解释层 · 原理示意标注</span>
    </div>
  )
}

export function Magnifier({ spec, phaseIdx, frameFile }: { spec: MotionSpec; phaseIdx: number; frameFile: string }) {
  const mag = spec.magnifiers.find(m => m.phase === phaseIdx) ?? spec.magnifiers[0]
  if (!mag) return null
  const posX = (mag.x / (1 - mag.w)) * 100
  const posY = (mag.y / (1 - mag.h)) * 100
  return (
    <div className="panel magnifier-panel">
      <h3><Icon name="zoom" size={15} />关键机制放大镜 <span className="tiny muted">真实帧局部裁切</span></h3>
      <div
        className="magnifier-view"
        style={{
          backgroundImage: `url(${assetUrl(frameFile)})`,
          backgroundSize: `${100 / mag.w}% ${100 / mag.h}%`,
          backgroundPosition: `${posX}% ${posY}%`,
        }}
        role="img"
        aria-label={mag.title}
      />
      <div className="mag-title">{mag.title}</div>
      <p className="small muted" style={{ margin: '6px 0 0' }}>{mag.note}</p>
    </div>
  )
}

export function PhaseInsight({ spec, phaseIdx }: { spec: MotionSpec; phaseIdx: number }) {
  const p = spec.phases[phaseIdx]
  return (
    <div className="phase-insight">
      <div className="pi-col purpose">
        <div className="pi-t"><Icon name="flag" size={13} />这一步在解决什么</div>
        <p>{p.purpose}</p>
      </div>
      <div className="pi-col risk">
        <div className="pi-t"><Icon name="alert" size={13} />引入的风险 / 待实测</div>
        <p>{p.risk}</p>
      </div>
    </div>
  )
}

export function DecisionBanner({ spec }: { spec: MotionSpec }) {
  const d = spec.decision
  return (
    <div className="panel decision-banner">
      <h3><Icon name="bench" size={15} />这条路线的决策含义</h3>
      <div className="db-role">{d.role}</div>
      <p className="small" style={{ margin: '6px 0 12px' }}>{d.why}</p>
      <div className="db-cols">
        <div className="db-col ok">
          <div className="pi-t"><Icon name="check" size={12} />当前模型已验证</div>
          <ul>{d.verified.map((v, i) => <li key={i}>{v}</li>)}</ul>
        </div>
        <div className="db-col bad">
          <div className="pi-t"><Icon name="flask" size={12} />还没验证 · 必须实物回答</div>
          <ul>{d.notVerified.map((v, i) => <li key={i}>{v}</li>)}</ul>
        </div>
      </div>
    </div>
  )
}
