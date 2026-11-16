import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import type { Elimination } from '../data/eliminations'
import { REASON_META } from '../data/types'
import { useApp } from '../state'
import { Icon } from './Icons'
import { ReasonBadge } from './ReasonBadge'

const KIND_META: Record<Elimination['kind'], { label: string; color: string; icon: string }> = {
  revoked: { label: '推荐撤回', color: 'var(--st-recommended)', icon: 'star' },
  nogo: { label: '工程 No-Go', color: 'var(--st-nogo)', icon: 'stop' },
  fail: { label: '复评失败', color: 'var(--st-fail)', icon: 'cross' },
  turn: { label: '关键转折', color: 'var(--st-conditional)', icon: 'wave' },
  scope: { label: '范围限定', color: 'var(--st-bench)', icon: 'bench' },
}

export function EliminationCard({ e, compact = false }: { e: Elimination; compact?: boolean }) {
  const { openCandidate, openEvidence, reduced } = useApp()
  const kind = KIND_META[e.kind]
  const cat = REASON_META[e.category]

  return (
    <motion.article
      className={`elim-card ${compact ? 'elim-compact' : ''}`}
      style={{ '--elim-color': kind.color } as CSSProperties}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45 }}
    >
      <header className="elim-head">
        <button className="elim-id" onClick={() => openCandidate(e.id)}>{e.id}</button>
        <span className="elim-fam">{e.family} · {e.stage}</span>
        <span className="elim-kind" style={{ color: kind.color }}><Icon name={kind.icon} size={13} />{kind.label}</span>
      </header>

      <div className="elim-body">
        <div className="elim-col good">
          <div className="elim-col-t"><Icon name="eye" size={13} />当时为什么被看好</div>
          <p>{e.lookedGood}</p>
        </div>
        <div className="elim-vs" aria-hidden="true"><Icon name="arrow" size={18} /></div>
        <div className="elim-col bad">
          <div className="elim-col-t"><Icon name="alert" size={13} />触发问题</div>
          <p>{e.trigger}</p>
        </div>
      </div>

      <footer className="elim-foot">
        <ReasonBadge cat={e.category} full />
        <div className="elim-verdict" style={{ borderColor: cat.color }}>
          <Icon name="flag" size={15} />
          <span>{e.verdict}</span>
        </div>
        {!compact && (
          <div className="elim-evs">
            {e.evidence.slice(0, 3).map(id => (
              <button key={id} className="ev-link" onClick={() => openEvidence(id)}>证据</button>
            ))}
          </div>
        )}
      </footer>
    </motion.article>
  )
}
