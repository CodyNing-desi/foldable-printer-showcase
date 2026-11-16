import { REASON_META } from '../data/types'
import type { ReasonCategory } from '../data/types'
import { Icon } from './Icons'

export function ReasonBadge({ cat, full = false }: { cat: ReasonCategory; full?: boolean }) {
  const m = REASON_META[cat]
  return (
    <span className="reason-badge" style={{ color: m.color, borderColor: m.color, background: `color-mix(in srgb, ${m.color} 12%, transparent)` }} title={m.label}>
      <Icon name={m.icon} size={12} />
      {full ? m.label : m.short}
    </span>
  )
}
