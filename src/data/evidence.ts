import type { EvidenceItem } from './types'

const SIM = 'sync/v2-to-v3_2_1'
const CAD = 'round1-demo-cad'
const BASE = 'https://github.com/CodyNing-desi/foldable-3d-printer'

export const EVIDENCE: EvidenceItem[] = [
  { id: 'process', title: '全方案仿真实验过程复盘', file: 'PROCESS_REVIEW.md', repoPath: 'simulation/PROCESS_REVIEW.md', branch: SIM, desc: 'V1 全过程：起点、过早推荐、独立审查、返工、最终筛选与证据等级。', plain: '整个仿真筛选过程的复盘记录：每一步做了什么、为什么做、结果可信到什么程度。' },
  { id: 'review1', title: '第一轮独立审查（含处置记录）', file: 'independent_review_round1.md', repoPath: 'simulation/reviews/independent_review_round1.md', branch: SIM, desc: 'critical-1：F04 槽轨未建模；8 项问题与逐项修复。', plain: '外部独立审查逐条检查模型代码后写的问题清单：F04 的"槽轨"当时只是一条抽象路径，并没有真实机构。' },
  { id: 'candidates', title: '15 候选参数定义', file: 'candidates.json', repoPath: 'simulation/config/candidates.json', branch: SIM, desc: 'F01–F14 + SCZ 的机构族、参数边界、质量、成本与假设声明。', plain: '15 套候选机构的尺寸、质量、成本与假设声明——所有仿真共用同一份输入。' },
  { id: 'summary', title: 'V1 修正后初筛结果', file: 'screening_summary.json', repoPath: 'simulation/results/screening_summary.json', branch: SIM, desc: '15 候选名义筛选：穿透面积、收纳比、覆盖与可达性（返工后口径）。', plain: '第一轮统一初筛的原始结果：每套机构在默认尺寸下是否穿透、收纳比是否达标。' },
  { id: 'selection', title: 'V1 推荐与权重扰动', file: 'selection.json', repoPath: 'simulation/results/selection.json', branch: SIM, desc: '100 次权重扰动、前三频率、Pareto 前沿；推荐 F07+F12。', plain: '推荐是怎么算出来的：100 次权重扰动下各方案进入前三的频率，以及"不同机构族"的去重规则。' },
  { id: 'third', title: '第三项决策：SCZ 探索 / F08 备选', file: 'THIRD_OPTION_DECISION.md', repoPath: 'simulation/verification/THIRD_OPTION_DECISION.md', branch: SIM, desc: '工程通过概率 vs 独立机构证据增益的两种排序。', plain: '第三个实物名额为什么给剪叉而不是更稳的后移翻折：比的是"能带回多少新证据"，不是分数。' },
  { id: 'v2', title: 'V2 三维筛选结果', file: 'screening_v2.json', repoPath: 'simulation_v2/results/screening_v2.json', branch: SIM, desc: 'L2_3D_OBB_SAT：F09 首次通过；F12 收纳比 0.856 失败。', plain: '升级到三维碰撞检查后的结果：双柱龙门 F09 在这一轮第一次通过筛选。' },
  { id: 'v3', title: 'V3 扫掠+附件筛选结果', file: 'screening_v3.json', repoPath: 'simulation_v3/results/screening_v3.json', branch: SIM, desc: '附件包络：F07 一度失败（0.910）；F12 优化版重新通过。', plain: '把料盘、电源、工具等附件算进收纳包络后的结果：F07 一度出局、F12 改进后回归。' },
  { id: 'dec31', title: 'V3.1 实物验证决策', file: 'DECISION_v3_1.md', repoPath: 'simulation_v3_1/DECISION.md', branch: SIM, desc: '3 主选 + 1 备选；Go/No-Go 门槛与六周资源分配。', plain: '决定造哪几套实物的会议结论：三主选加一备选，以及每套的"做到什么程度就停"。' },
  { id: 'final31', title: 'V3.1 最终冻结', file: 'FINAL_DECISION_v3_1.md', repoPath: 'simulation_v3_1_final/FINAL_DECISION.md', branch: SIM, desc: 'F12/F04 No-Go；F04 全域 0/238 可行。', plain: '实物决选的冻结版本：F12 因六周造不稳被停，F04 因搜遍参数域无解被停。' },
  { id: 'lineup32', title: 'V3.2 冻结名单', file: 'LINEUP_DECISION_v3_2.md', repoPath: 'simulation_v3_2/LINEUP_DECISION.md', branch: SIM, desc: 'F09 主力但收纳比 0.802 边界；F12 晃动 0.203–0.229 mm。', plain: '验收前一轮的名单与风险记录：F09 收纳比 0.802 超线、F12 导向晃动实测口径。' },
  { id: 'lineup321', title: 'V3.2.1 实验入围名单（当前冻结）', file: 'LINEUP_DECISION_V3_2_1.md', repoPath: 'simulation_v3_2_1/LINEUP_DECISION_V3_2_1.md', branch: SIM, desc: 'F09_L82 / F07 Conditional Go；SCZ Bench-only；F08 Fallback；F12 No-Go。', plain: '当前生效的最终名单：谁主选、谁只做台架、谁备选、谁淘汰，一句话说清。' },
  { id: 'report321', title: 'V3.2.1 验收纠错报告', file: 'FINAL_REPORT_V3_2_1.md', repoPath: 'simulation_v3_2_1/FINAL_REPORT_V3_2_1.md', branch: SIM, desc: '连续碰撞上界修复；正弦反例；F09 lift 85→82。', plain: '验收纠错报告：旧算法会把"两点之间藏着碰撞"的运动误判为安全，本轮改为数学上可证明的检查。' },
  { id: 'sum321', title: 'V3.2.1 全候选复核数据', file: 'v3_2_1_verification_summary.json', repoPath: 'simulation_v3_2_1/results/v3_2_1_verification_summary.json', branch: SIM, desc: '认证净距、收纳比、FEA 挠度与线下资格（冻结比较基准）。', plain: '最终名单背后每个数字的出处：收纳比、间隙、刚度挠度，全部同一口径可比。' },
  { id: 'current', title: '当前冻结选型决策', file: 'CURRENT_DECISION.md', repoPath: 'docs/simulation_history/CURRENT_DECISION.md', branch: SIM, desc: '与 V3.2.1 名单一致的当前状态摘要。', plain: '与最终名单一致的一页摘要，供快速查阅当前状态。' },
  { id: 'cadreadme', title: 'R1-V6 CAD 包说明', file: 'CAD_README.md', repoPath: 'ROUND1_DEMO_CAD/README.md', branch: CAD, desc: '1:2 缩比、参数溯源、再生成命令与关键声明。', plain: '缩比演示模型包的说明：比例、来源、如何重新生成、哪些话不能说。' },
  { id: 'cadmotion', title: 'R1-V6 运动与装配验证报告', file: 'CAD_MOTION_VALIDATION_REPORT.md', repoPath: 'ROUND1_DEMO_CAD/MOTION_VALIDATION_REPORT.md', branch: CAD, desc: 'L1/L2/L2b/L3 证据等级；2001 步扫描与装配约束闭合。', plain: '演示模型做过的检查清单：运动全程扫描、装配约束闭合、孔是否真的存在。' },
  { id: 'cadlimits', title: 'R1-V6 模型限制声明', file: 'CAD_MODEL_LIMITATIONS.md', repoPath: 'ROUND1_DEMO_CAD/MODEL_LIMITATIONS.md', branch: CAD, desc: '缩比演示边界；F09 刚性同步杆、SCZ 手动剪叉等简化声明。', plain: '演示模型的能力边界声明：它只证明"动得对、装得上"，不证明"扛得住、用得久"。' },
  { id: 'cadchangelog', title: 'V5→V6 变更对照表', file: 'CAD_CHANGELOG_V5_V6.md', repoPath: 'ROUND1_DEMO_CAD/CHANGELOG_V5_V6.md', branch: CAD, desc: 'P0-1/P0-2/P0-3/P1-1/P1-2/P1-3 逐项修复与证据。', plain: '上一版演示模型被审查出的问题与本版逐条修复对照。' },
  { id: 'cadprint', title: '五机打印排产计划', file: 'CAD_PRINT_PLAN_5_MACHINES.md', repoPath: 'ROUND1_DEMO_CAD/PRINT_PLAN_5_MACHINES.md', branch: CAD, desc: 'L4 试件与正式零件的打印排产口径。', plain: '五台打印机如何分担这批零件的排产计划。' },
  { id: 'cadguide', title: '装配指南', file: 'CAD_ASSEMBLY_GUIDE.md', repoPath: 'ROUND1_DEMO_CAD/ASSEMBLY_GUIDE.md', branch: CAD, desc: '各方案装配顺序与锁销位置。', plain: '零件打印出来后按什么顺序装配、锁销插在哪里。' },
]

export const EV_BY_ID = Object.fromEntries(EVIDENCE.map(e => [e.id, e]))

export function githubUrl(e: EvidenceItem): string {
  return `${BASE}/blob/${e.branch}/${e.repoPath}`
}

export const REPO_BASE = BASE
export const SIM_BRANCH = SIM
export const CAD_BRANCH = CAD
export const CAD_COMMIT = 'd35cbd1eacfa9908aef302b009610c5dbc03d15a'
