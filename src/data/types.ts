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

export type ReasonCategory =
  | 'unmodeled'      // 真实机构未建模
  | 'uncertified'    // 连续碰撞未认证 / 采样漏洞
  | 'storage'        // 收纳比超阈值
  | 'interference'   // 运动干涉 / 穿透
  | 'manufacturing'  // 工程制造风险过高
  | 'redundant'      // 证据增益不足 / 同族重复
  | 'schedule'       // 周期窗口不现实
  | 'benchrisk'      // 关键机制待实物验证（台架限定）

export const REASON_META: Record<ReasonCategory, { label: string; short: string; color: string; icon: string }> = {
  unmodeled: { label: '真实机构未建模', short: '建模缺失', color: '#f0883e', icon: 'ghost' },
  uncertified: { label: '连续碰撞未认证', short: '认证缺失', color: '#d2a8ff', icon: 'wave' },
  storage: { label: '收纳比超阈值', short: '包络超标', color: '#e3b341', icon: 'box' },
  interference: { label: '运动干涉 / 穿透', short: '干涉穿透', color: '#f85149', icon: 'collide' },
  manufacturing: { label: '工程制造风险过高', short: '制造风险', color: '#ff7b72', icon: 'wrench' },
  redundant: { label: '证据增益不足 / 同族重复', short: '证据重复', color: '#79c0ff', icon: 'copy' },
  schedule: { label: '周期窗口不现实', short: '周期受限', color: '#ffa657', icon: 'clock' },
  benchrisk: { label: '关键机制待实物验证', short: '待实物验证', color: '#a78bfa', icon: 'flask' },
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
  rule: string
  lesson: string
  eliminated: string[]
  entered: string[]
  revoked: string[]
  reasonDist: { cat: ReasonCategory; ids: string[] }[]
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
  plain: string
}

export const STATUS_META: Record<Status, { label: string; color: string; icon: string }> = {
  candidate: { label: '候选 Candidate', color: 'var(--st-candidate)', icon: 'dot' },
  pass: { label: '通过 Pass', color: 'var(--st-pass)', icon: 'check' },
  fail: { label: '复评失败 Failed', color: 'var(--st-fail)', icon: 'cross' },
  recommended: { label: '曾被推荐 Once Recommended', color: 'var(--st-recommended)', icon: 'star' },
  conditional: { label: 'Conditional Go', color: 'var(--st-conditional)', icon: 'flag' },
  bench: { label: 'Bench-only 台架', color: 'var(--st-bench)', icon: 'bench' },
  fallback: { label: 'Fallback 备选', color: 'var(--st-fallback)', icon: 'shield' },
  nogo: { label: 'No-Go 淘汰', color: 'var(--st-nogo)', icon: 'stop' },
  archived: { label: '归档 Archived', color: 'var(--st-archived)', icon: 'archive' },
}
