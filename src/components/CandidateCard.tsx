import { motion } from 'framer-motion'
import { CAND_BY_ID } from '../data/candidates'
import { stageStatus } from '../data/stages'
import { useApp } from '../state'
import { MechanismSketch } from './MechanismSketch'
import { StatusBadge } from './StatusBadge'

export function CandidateCard({ id, compact = false, highlight = false }: { id: string; compact?: boolean; highlight?: boolean }) {
  const { stage, openCandidate, reduced } = useApp()
  const c = CAND_BY_ID[id]
  const cell = stageStatus(stage, id)
  const dim = cell.status === 'fail' || cell.status === 'archived' || cell.status === 'nogo'

  if (compact) {
    return (
      <motion.button
        layoutId={reduced ? undefined : `card-${id}`}
        layout={!reduced}
        className={`cand-chip ${highlight ? 'hl' : ''}`}
        onClick={() => openCandidate(id)}
        title={cell.note}
      >
        <b>{id} <span>{c.name}</span></b>
        <StatusBadge status={cell.status} />
      </motion.button>
    )
  }

  return (
    <motion.button
      layoutId={reduced ? undefined : `card-${id}`}
      layout={!reduced}
      className={`cand-card ${dim ? 'dim' : ''} ${highlight ? 'hl' : ''}`}
      onClick={() => openCandidate(id)}
      aria-label={`${id} ${c.name}，当前阶段状态：${cell.note || cell.status}`}
    >
      <div className="sketch"><MechanismSketch id={id} family={c.family} /></div>
      <div className="statusline">
        <span className="cid">{id}</span>
        <span className="fam">{c.familyLabel} · 原理示意</span>
      </div>
      <span className="cname">{c.name}</span>
      <StatusBadge status={cell.status} />
      <span className="cnote">{cell.note}</span>
    </motion.button>
  )
}
