import type { Stage, StageId, Status } from './types'

const IDS = ['F01','F02','F03','F04','F05','F06','F07','F08','F09','F10','F11','F12','F13','F14','SCZ']

function cells(map: Record<string, [Status, string]>, def: [Status, string]): Record<string, { status: Status; note: string }> {
  const out: Record<string, { status: Status; note: string }> = {}
  for (const id of IDS) {
    const [status, note] = map[id] ?? def
    out[id] = { status, note }
  }
  return out
}

export const STAGES: Stage[] = [
  {
    id: 's0', label: '候选定义', version: 'config/candidates.json · seed 20261113',
    resultType: '机构构想 + 参数假设', conditions: '统一硬约束：无穿透、可达、工作空间 180 mm、系统收纳比 ≤0.800；未知尺寸显式写为假设',
    summary: '15 套候选（F01–F14 + SCZ）按根部翻折、横臂、伸缩、槽轨、外部托架、箱体、抽屉、剪叉分别实例化。此时没有任何一套被验证。',
    evidence: ['candidates'],
    cells: cells({}, ['candidate', '参数化定义完成，尚未运行筛选']),
  },
  {
    id: 'v1pre', label: 'V1 初筛', version: 'simulation/ · 返工前 · 31 姿态',
    resultType: '名义筛选 + NSGA-II 抽象优化', conditions: '2.5D 刚体几何（L1）；31 离散姿态；Shapely 相交 + 包络体积 + 降阶刚度 + 10,000 次误差抽样',
    summary: '名义通过：F07、F08、F11、F12、F14、SCZ。F04 名义轨迹有穿透，但优化器在抽象"抬升+平移+转轴"路径中找到无穿透解，初始权重一度给出 F07+F04 推荐。',
    evidence: ['process', 'review1'],
    cells: cells({
      F01: ['fail', '穿透 2750 mm²：纯根部翻折无避让行程'],
      F02: ['fail', '穿透 2700 mm²；收纳比 1.667'],
      F03: ['fail', '穿透 2750 mm²；收纳比 1.366'],
      F04: ['recommended', '名义失败，但抽象优化解通过 → 与 F07 一起被推荐（模型未含槽轨实体）'],
      F05: ['fail', '收纳比 0.997 > 0.800'],
      F06: ['fail', '收纳比 2.002 > 0.800'],
      F07: ['pass', '名义通过；优化解收纳比 0.4927，进入推荐'],
      F08: ['pass', '名义通过；收纳比 0.542'],
      F09: ['fail', '穿透 848.292 mm²；收纳比 1.187（lift=140 名义参数）'],
      F10: ['fail', '穿透 43.075 mm²；收纳比 1.187'],
      F11: ['pass', '名义通过（箱盖联动尚未实例化，后被审查推翻）'],
      F12: ['pass', '名义通过；收纳比 0.754'],
      F13: ['fail', '收纳比 1.226 > 0.800'],
      F14: ['pass', '名义通过（第二阶段翻转尚未实例化，后被审查推翻）'],
      SCZ: ['pass', '名义通过；收纳比 0.494'],
    }, ['fail', '']),
  },
  {
    id: 'v1fix', label: 'V1 审查修正', version: 'simulation/ · 返工后 · 201/1001/5001 姿态',
    resultType: '独立审查 → 模型修正 → 复筛', conditions: '补全槽轨/箱盖/双柱联动；驱动力分族建模；优化加入装配可达性约束；推荐解 5001 姿态复验',
    summary: 'F04 补全槽轨后名义穿透 45.338 mm²、优化无可行解，推荐撤回。F11/F14 补全联动后名义失败。返工后名义通过仅 F07/F08/F12/SCZ；推荐 F07+F12，SCZ 为探索第三项，F08 为工程备选。',
    evidence: ['review1', 'process', 'summary', 'selection', 'third'],
    cells: cells({
      F01: ['fail', '穿透 2750 mm²（修正模型复核仍失败）'],
      F02: ['fail', '穿透 2700 mm²；收纳比 1.667'],
      F03: ['fail', '穿透 2750 mm²；收纳比 1.366'],
      F04: ['nogo', '槽轨实体化后名义穿透 45.338 mm²；优化无可行解 → 撤回推荐'],
      F05: ['fail', '收纳比 0.997 > 0.800'],
      F06: ['fail', '收纳比 2.002 > 0.800'],
      F07: ['recommended', '推荐 #1：收纳比 0.4927、挠度 0.319 mm、P95 0.559 mm、100% 稳健前三'],
      F08: ['fallback', '工程备选：5001 姿态通过、前三频率 100%，但与 F07 同族且被 Pareto 支配'],
      F09: ['fail', '穿透 848.292 mm²；收纳比 1.187（尚未引入抬升优化与折臂）'],
      F10: ['fail', '穿透 43.075 mm²；收纳比 1.187'],
      F11: ['fail', '补全运动箱盖与自碰撞后名义失败（穿透 6.275 mm²、收纳比 1.002）'],
      F12: ['recommended', '推荐 #2：收纳比 0.7998（距门槛 <0.005）、挠度 0.171 mm 最优、驱动 39.7 N'],
      F13: ['fail', '收纳比 1.226 > 0.800'],
      F14: ['fail', '补全双柱预筛与第二阶段翻转后名义失败（穿透 789.006 mm²、收纳比 3.706）'],
      SCZ: ['bench', '探索型第三项：独立剪叉机构族；前三频率 0%、P95 0.893 mm、成本 850 CNY'],
    }, ['fail', '']),
  },
  {
    id: 'v2', label: 'V2 三维筛选', version: 'simulation_v2/ · L2_3D_OBB_SAT',
    resultType: '三维 OBB/SAT 运动学筛选', conditions: '三维包围盒分离轴检查；引入折臂（arm_fold）与导柱/销轴实体；附件包络尚未全部计入',
    summary: 'F09 以 lift=140 首次通过（收纳比 0.784）。通过：F07/F08/F09/SCZ。F12 收纳比 0.856 失败；F04/F10 槽轨与热床穿透 46 mm。',
    evidence: ['v2'],
    cells: cells({
      F01: ['fail', '3D 穿透 46.28 mm（column↔bed）；收纳比 1.254'],
      F02: ['fail', '3D 穿透 46.00 mm（toolhead↔column）；收纳比 1.673'],
      F03: ['fail', '3D 穿透 19.46 mm（toolhead↔base）'],
      F04: ['fail', '槽轨-热床穿透 46.00 mm（slot_rail_L↔bed）'],
      F05: ['fail', '收纳比 1.051 > 0.800'],
      F06: ['fail', '收纳比 2.078 > 0.800'],
      F07: ['pass', 'lift=95 + 折臂：收纳比 0.659，穿透 0'],
      F08: ['pass', '收纳比 0.791，穿透 0'],
      F09: ['pass', '首次通过：lift=140，收纳比 0.784，穿透 0'],
      F10: ['fail', '槽轨-热床穿透 46.00 mm'],
      F11: ['fail', '穿透 30.00 mm；收纳比 1.424'],
      F12: ['fail', '收纳比 0.856 > 0.800（overlap=60 名义参数）'],
      F13: ['fail', '收纳比 1.226 > 0.800'],
      F14: ['fail', '收纳比 2.074 > 0.800'],
      SCZ: ['pass', '收纳比 0.495，穿透 0'],
    }, ['fail', '']),
  },
  {
    id: 'v3', label: 'V3 扫掠+附件', version: 'simulation_v3/ · swept_and_accessory',
    resultType: '扫掠干涉 + 附件包络 + 质心稳定', conditions: '运动扫掠检查；料盘/电源/工具附件计入收纳包络；F12 改为优化预紧侧置版',
    summary: '附件包络改变格局：F07 含附件收纳比 0.910 一度失败；F05/F13 因构型修订通过；F12 优化版（overlap=52、侧置电机、预紧导轨）以 0.735 重新通过。通过：F05/F08/F09/F12/F13/SCZ。',
    evidence: ['v3'],
    cells: cells({
      F01: ['fail', '扫掠穿透 47.23 mm；收纳比 1.145'],
      F02: ['fail', '扫掠穿透 46.11 mm；收纳比 1.038'],
      F03: ['fail', '扫掠穿透 20.01 mm'],
      F04: ['fail', '槽轨-热床穿透 46.00 mm；收纳比 0.942'],
      F05: ['pass', '侧置电机构型：收纳比 0.610，穿透 0'],
      F06: ['fail', '扫掠穿透 0.66 mm；收纳比 2.078'],
      F07: ['fail', '含附件收纳比 0.910 > 0.800（lift=95；后续重新优化为 lift=75）'],
      F08: ['pass', '收纳比 0.702，穿透 0'],
      F09: ['pass', 'lift=110：收纳比 0.529，穿透 0'],
      F10: ['fail', '槽轨-热床穿透 46.00 mm；收纳比 0.972'],
      F11: ['fail', '穿透 30.00 mm；收纳比 1.424'],
      F12: ['pass', '优化预紧侧置版：收纳比 0.735，穿透 0'],
      F13: ['pass', '收纳比 0.750，穿透 0（工作位外伸构型）'],
      F14: ['fail', '收纳比 2.074 > 0.800'],
      SCZ: ['pass', '收纳比 0.483，穿透 0'],
    }, ['fail', '']),
  },
  {
    id: 'v31', label: 'V3.1 实物决选', version: 'simulation_v3_1/ + v3_1_final/',
    resultType: '工程决策（冻结实物名单）', conditions: '连续扫掠认证 + 3D FEA 修正 + 六周课程资源约束；不再以单一分数排序',
    summary: 'F09/F07/SCZ 获 Conditional Go，F08 为 Backup。F12 因六周精密套筒加工风险被 No-Go；F04 全域 0/238 可行被 No-Go。F07 以 lift=75 重新优化后回到名单。',
    evidence: ['dec31', 'final31'],
    cells: cells({
      F04: ['nogo', '全域 0/238 可行；冻结暂停'],
      F07: ['conditional', '主选：连续扫掠 PASS；3060 升级抗扭与折臂锁紧重复性待实测'],
      F08: ['fallback', 'Backup：仅当 F07/F09 台架失败时启用'],
      F09: ['conditional', '主选：含 215 mm 折臂仍具最高刚度；双侧同步抬升待实测'],
      F12: ['nogo', '六周精密套筒加工风险过高；冻结暂停'],
      SCZ: ['bench', '探索台架：仅制造桌面剪刀台架，不先造整机'],
    }, ['archived', '未进入实物决选名单']),
  },
  {
    id: 'v321', label: 'V3.2.1 冻结', version: 'simulation_v3_2_1/ · 当前冻结名单',
    resultType: '认证连续碰撞 + 整体筛选 + 工程资格', conditions: '解析运动上界认证（废除离散采样推断）；收纳比门槛 0.800 不变；F09 真实几何调整 lift=82',
    summary: 'V3.2 验收发现采样漏洞与 F09(lift=85) 收纳比 0.802 超门槛。V3.2.1 以认证上界复核全部候选：F09_L82（0.786）、F07（0.751）、SCZ（0.503）、F08（0.616）通过；F12 仿真 PASS（0.735）但工程 No-Go 维持。',
    evidence: ['lineup321', 'report321', 'sum321', 'current'],
    cells: cells({
      F07: ['conditional', '主候选 2：收纳比 0.751；Y 挠度 0.8166 mm、认证净距 0.021 mm 待台架实测'],
      F08: ['fallback', 'Fallback：收纳比 0.616，但折叠最长边 897 mm 超便携限制'],
      F09: ['conditional', '主候选 1（F09_L82）：收纳比 0.786；Y 挠度 0.1252 mm 最优'],
      F12: ['nogo', '仿真 PASS（0.735）；六周精密三级伸缩导轨晃动 0.203–0.229 mm 与卡滞不可控 → No-Go'],
      SCZ: ['bench', 'Bench-only：收纳比 0.503；仅验证低位丝杆推力与 Z 向回差'],
    }, ['archived', '未进入冻结名单']),
  },
]

export const STAGE_BY_ID = Object.fromEntries(STAGES.map(s => [s.id, s])) as Record<StageId, Stage>

export function stageStatus(stage: StageId, id: string): { status: Status; note: string } {
  return STAGE_BY_ID[stage].cells[id]
}
