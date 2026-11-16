export type Status =
  | 'candidate'   // 未验证
  | 'pass'        // 通过筛选
  | 'fail'        // 筛选未通过
  | 'recommended' // 曾被推荐（后撤回）
  | 'conditional' // Conditional Go
  | 'bench'       // 台架 / 探索
  | 'fallback'    // 工程备选
  | 'nogo'        // No-Go
  | 'archived'    // 归档

export type StageId = 's0' | 'v1pre' | 'v1fix' | 'v2' | 'v3' | 'v31' | 'v321'

export interface StageCell {
  status: Status
  note: string
}

export interface Stage {
  id: StageId
  label: string
  version: string
  resultType: string
  conditions: string
  summary: string
  evidence: string[]
  cells: Record<string, StageCell>
}

export interface KeyMetric {
  label: string
  value: string
  version: string
  source: string
}

export interface Candidate {
  id: string
  name: string
  family: string
  familyLabel: string
  description: string
  advantage: string
  constraints: string
  finalStatus: Status
  finalLabel: string
  keyMetrics: KeyMetric[]
  decisionReasons: string[]
  evidence: string[]
  visual?: string
}

export interface EvidenceItem {
  id: string
  title: string
  file: string
  repoPath: string
  branch: string
  desc: string
}

export const STATUS_META: Record<Status, { label: string; color: string }> = {
  candidate: { label: '未验证', color: 'var(--st-candidate)' },
  pass: { label: '通过', color: 'var(--st-pass)' },
  fail: { label: '未通过', color: 'var(--st-fail)' },
  recommended: { label: '曾被推荐', color: 'var(--st-recommended)' },
  conditional: { label: 'Conditional Go', color: 'var(--st-conditional)' },
  bench: { label: '台架验证', color: 'var(--st-bench)' },
  fallback: { label: '工程备选', color: 'var(--st-fallback)' },
  nogo: { label: 'No-Go', color: 'var(--st-nogo)' },
  archived: { label: '归档', color: 'var(--st-archived)' },
}
