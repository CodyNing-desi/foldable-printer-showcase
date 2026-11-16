import type { EvidenceItem } from './types'

const SIM = 'sync/v2-to-v3_2_1'
const CAD = 'round1-demo-cad'
const BASE = 'https://github.com/CodyNing-desi/foldable-3d-printer'

export const EVIDENCE: EvidenceItem[] = [
  { id: 'process', title: '全方案仿真实验过程复盘', file: 'PROCESS_REVIEW.md', repoPath: 'simulation/PROCESS_REVIEW.md', branch: SIM, desc: 'V1 全过程：起点、过早推荐、独立审查、返工、最终筛选与证据等级。' },
  { id: 'review1', title: '第一轮独立审查（含处置记录）', file: 'independent_review_round1.md', repoPath: 'simulation/reviews/independent_review_round1.md', branch: SIM, desc: 'critical-1：F04 槽轨未建模；8 项问题与逐项修复。' },
  { id: 'candidates', title: '15 候选参数定义', file: 'candidates.json', repoPath: 'simulation/config/candidates.json', branch: SIM, desc: 'F01–F14 + SCZ 的机构族、参数边界、质量、成本与假设声明。' },
  { id: 'summary', title: 'V1 修正后初筛结果', file: 'screening_summary.json', repoPath: 'simulation/results/screening_summary.json', branch: SIM, desc: '15 候选名义筛选：穿透面积、收纳比、覆盖与可达性（返工后口径）。' },
  { id: 'selection', title: 'V1 推荐与权重扰动', file: 'selection.json', repoPath: 'simulation/results/selection.json', branch: SIM, desc: '100 次权重扰动、前三频率、Pareto 前沿；推荐 F07+F12。' },
  { id: 'third', title: '第三项决策：SCZ 探索 / F08 备选', file: 'THIRD_OPTION_DECISION.md', repoPath: 'simulation/verification/THIRD_OPTION_DECISION.md', branch: SIM, desc: '工程通过概率 vs 独立机构证据增益的两种排序。' },
  { id: 'v2', title: 'V2 三维筛选结果', file: 'screening_v2.json', repoPath: 'simulation_v2/results/screening_v2.json', branch: SIM, desc: 'L2_3D_OBB_SAT：F09 首次通过；F12 收纳比 0.856 失败。' },
  { id: 'v3', title: 'V3 扫掠+附件筛选结果', file: 'screening_v3.json', repoPath: 'simulation_v3/results/screening_v3.json', branch: SIM, desc: '附件包络：F07 一度失败（0.910）；F12 优化版重新通过。' },
  { id: 'dec31', title: 'V3.1 实物验证决策', file: 'DECISION_v3_1.md', repoPath: 'simulation_v3_1/DECISION.md', branch: SIM, desc: '3 主选 + 1 备选；Go/No-Go 门槛与六周资源分配。' },
  { id: 'final31', title: 'V3.1 最终冻结', file: 'FINAL_DECISION_v3_1.md', repoPath: 'simulation_v3_1_final/FINAL_DECISION.md', branch: SIM, desc: 'F12/F04 No-Go；F04 全域 0/238 可行。' },
  { id: 'lineup32', title: 'V3.2 冻结名单', file: 'LINEUP_DECISION_v3_2.md', repoPath: 'simulation_v3_2/LINEUP_DECISION.md', branch: SIM, desc: 'F09 主力但收纳比 0.802 边界；F12 晃动 0.203–0.229 mm。' },
  { id: 'lineup321', title: 'V3.2.1 实验入围名单（当前冻结）', file: 'LINEUP_DECISION_V3_2_1.md', repoPath: 'simulation_v3_2_1/LINEUP_DECISION_V3_2_1.md', branch: SIM, desc: 'F09_L82 / F07 Conditional Go；SCZ Bench-only；F08 Fallback；F12 No-Go。' },
  { id: 'report321', title: 'V3.2.1 验收纠错报告', file: 'FINAL_REPORT_V3_2_1.md', repoPath: 'simulation_v3_2_1/FINAL_REPORT_V3_2_1.md', branch: SIM, desc: '连续碰撞上界修复；正弦反例；F09 lift 85→82。' },
  { id: 'sum321', title: 'V3.2.1 全候选复核数据', file: 'v3_2_1_verification_summary.json', repoPath: 'simulation_v3_2_1/results/v3_2_1_verification_summary.json', branch: SIM, desc: '认证净距、收纳比、FEA 挠度与线下资格（冻结比较基准）。' },
  { id: 'current', title: '当前冻结选型决策', file: 'CURRENT_DECISION.md', repoPath: 'docs/simulation_history/CURRENT_DECISION.md', branch: SIM, desc: '与 V3.2.1 名单一致的当前状态摘要。' },
  { id: 'cadreadme', title: 'R1-V6 CAD 包说明', file: 'CAD_README.md', repoPath: 'ROUND1_DEMO_CAD/README.md', branch: CAD, desc: '1:2 缩比、参数溯源、再生成命令与关键声明。' },
  { id: 'cadmotion', title: 'R1-V6 运动与装配验证报告', file: 'CAD_MOTION_VALIDATION_REPORT.md', repoPath: 'ROUND1_DEMO_CAD/MOTION_VALIDATION_REPORT.md', branch: CAD, desc: 'L1/L2/L2b/L3 证据等级；2001 步扫描与装配约束闭合。' },
  { id: 'cadlimits', title: 'R1-V6 模型限制声明', file: 'CAD_MODEL_LIMITATIONS.md', repoPath: 'ROUND1_DEMO_CAD/MODEL_LIMITATIONS.md', branch: CAD, desc: '缩比演示边界；F09 刚性同步杆、SCZ 手动剪叉等简化声明。' },
  { id: 'cadchangelog', title: 'V5→V6 变更对照表', file: 'CAD_CHANGELOG_V5_V6.md', repoPath: 'ROUND1_DEMO_CAD/CHANGELOG_V5_V6.md', branch: CAD, desc: 'P0-1/P0-2/P0-3/P1-1/P1-2/P1-3 逐项修复与证据。' },
  { id: 'cadprint', title: '五机打印排产计划', file: 'CAD_PRINT_PLAN_5_MACHINES.md', repoPath: 'ROUND1_DEMO_CAD/PRINT_PLAN_5_MACHINES.md', branch: CAD, desc: 'L4 试件与正式零件的打印排产口径。' },
  { id: 'cadguide', title: '装配指南', file: 'CAD_ASSEMBLY_GUIDE.md', repoPath: 'ROUND1_DEMO_CAD/ASSEMBLY_GUIDE.md', branch: CAD, desc: '各方案装配顺序与锁销位置。' },
]

export const EV_BY_ID = Object.fromEntries(EVIDENCE.map(e => [e.id, e]))

export function githubUrl(e: EvidenceItem): string {
  return `${BASE}/blob/${e.branch}/${e.repoPath}`
}

export const REPO_BASE = BASE
export const SIM_BRANCH = SIM
export const CAD_BRANCH = CAD
export const CAD_COMMIT = 'd35cbd1eacfa9908aef302b009610c5dbc03d15a'
