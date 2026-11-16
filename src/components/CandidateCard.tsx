import { motion } from 'framer-motion'
import { CAND_BY_ID } from '../data/candidates'
import { STAGE_BY_ID, stageStatus } from '../data/stages'
import { useApp } from '../state'
import { MechanismSketch } from './MechanismSketch'
import { StatusBadge } from './StatusBadge'
import { Icon } from './Icons'

export function CandidateCard({ id, compact = false, highlight = false }: { id: string; compact?: boolean; highlight?: boolean }) {
  const { stage, openCandidate, reduced } = useApp()
  const c = CAND_BY_ID[id]
  const cell = stageStatus(stage, id)
  const st = STAGE_BY_ID[stage]
  const out = cell.status === 'fail' || cell.status === 'archived' || cell.status === 'nogo'
  const entered = st.entered.includes(id) && stage !== 's0'
  const revoked = st.revoked.includes(id)

  const anim = reduced ? {} : {
    opacity: out ? 0.55 : 1,
    y: out ? 6 : 0,
    scale: revoked ? 0.97 : 1,
  }

  if (compact) {
    return (
      <motion.button
        layoutId={reduced ? undefined : `card-${id}`}
        layout={!reduced}
        animate={anim}
        className={`cand-chip ${highlight ? 'hl' : ''}`}
        onClick={() => openCandidate(id)}
        title={cell.note}
      >
        <b>{id} <span>{c.name}</span></b>
        <StatusBadge status={cell.status} size="sm" />
      </motion.button>
    )
  }

  return (
    <motion.button
      layoutId={reduced ? undefined : `card-${id}`}
      layout={!reduced}
      animate={anim}
      transition={{ duration: 0.4 }}
      className={`cand-card ${out ? 'dim' : ''} ${highlight ? 'hl' : ''} ${entered ? 'is-in' : ''} ${revoked ? 'is-revoked' : ''}`}
      onClick={() => openCandidate(id)}
      aria-label={`${id} ${c.name}，当前阶段状态：${cell.note || cell.status}`}
    >
      {entered && <span className="card-flag in"><Icon name="check" size={11} />{stage === 'v3' || stage === 'v31' ? '回归' : '进入'}</span>}
      {revoked && <span className="card-flag revoke"><Icon name="star" size={11} />推荐撤回</span>}
      <div className="sketch"><MechanismSketch id={id} family={c.family} /></div>
      <div className="statusline">
        <span className="cid">{id}</span>
        <span className="fam">{c.familyLabel} · 原理示意</span>
      </div>
      <span className="cname">{c.name}</span>
      <StatusBadge status={cell.status} size="sm" />
      <span className="cnote">{cell.note}</span>
    </motion.button>
  )
}
