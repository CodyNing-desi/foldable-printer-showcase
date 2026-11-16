import { STATUS_META } from '../data/types'
import type { Status } from '../data/types'
import { Icon } from './Icons'

export function StatusBadge({ status, label, size = 'md' }: { status: Status; label?: string; size?: 'sm' | 'md' }) {
  const meta = STATUS_META[status]
  return (
    <span className={`badge ${size === 'sm' ? 'badge-sm' : ''}`} style={{ color: meta.color, borderColor: meta.color, background: `color-mix(in srgb, ${meta.color} 10%, transparent)` }}>
      <Icon name={meta.icon} size={size === 'sm' ? 11 : 13} />
      {label ?? meta.label}
    </span>
  )
}
