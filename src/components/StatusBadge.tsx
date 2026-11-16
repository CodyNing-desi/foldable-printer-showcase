import { STATUS_META } from '../data/types'
import type { Status } from '../data/types'

export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const meta = STATUS_META[status]
  return (
    <span className="badge" style={{ color: meta.color, borderColor: meta.color, background: `color-mix(in srgb, ${meta.color} 10%, transparent)` }}>
      {label ?? meta.label}
    </span>
  )
}
