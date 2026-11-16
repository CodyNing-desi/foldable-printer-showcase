import type { ReactNode } from 'react'
import { Icon } from './Icons'

export function RiskCallout({ tone = 'warn', title, children }: { tone?: 'warn' | 'danger' | 'info' | 'bench'; title: string; children: ReactNode }) {
  const icon = tone === 'danger' ? 'stop' : tone === 'info' ? 'eye' : tone === 'bench' ? 'flask' : 'alert'
  return (
    <div className={`risk-callout rc-${tone}`}>
      <div className="rc-title"><Icon name={icon} size={14} />{title}</div>
      <div className="rc-body">{children}</div>
    </div>
  )
}
