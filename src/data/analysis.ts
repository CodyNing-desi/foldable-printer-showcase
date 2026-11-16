// 章节 3–6 的真实数据（全部带版本口径）。来源见各 source 字段对应的证据文件。

export interface MatrixRow {
  id: string
  intersection: number | null   // mm²，V1 修正名义
  storage: number | null        // 系统收纳比，V1 修正名义
  coverage: number | null       // 工作空间覆盖
  reachable: number | null      // 可达比例
  deflection: number | null     // mm，仅 V1 优化四候选（L2 降阶）
  p95: number | null            // mm，仅推荐方案 20,000 次抽样
  drive: string | null          // 驱动力口径说明
  passed: boolean
  reasons: string[]
}

// simulation/results/screening_summary.json（V1 修正，201 姿态名义）
// + simulation/results/selection.json（优化解，1001/5001 姿态复验）
export const MATRIX_V1: MatrixRow[] = [
  { id: 'F01', intersection: 2750.0, storage: 0.3135, coverage: 1, reachable: 1, deflection: null, p95: null, drive: null, passed: false, reasons: ['轨迹最大穿透面积 2750.000 mm²'] },
  { id: 'F02', intersection: 2700.0, storage: 1.6667, coverage: 1, reachable: 1, deflection: null, p95: null, drive: null, passed: false, reasons: ['轨迹最大穿透面积 2700.000 mm²', '收纳体积比 1.667 > 0.800'] },
  { id: 'F03', intersection: 2750.0, storage: 1.3662, coverage: 1, reachable: 1, deflection: null, p95: null, drive: null, passed: false, reasons: ['轨迹最大穿透面积 2750.000 mm²', '收纳体积比 1.366 > 0.800'] },
  { id: 'F04', intersection: 45.338, storage: 0.5823, coverage: 1, reachable: 1, deflection: null, p95: null, drive: null, passed: false, reasons: ['轨迹最大穿透面积 45.338 mm²（补全槽轨后）'] },
  { id: 'F05', intersection: 0, storage: 0.9966, coverage: 1, reachable: 1, deflection: null, p95: null, drive: null, passed: false, reasons: ['收纳体积比 0.997 > 0.800'] },
  { id: 'F06', intersection: 0, storage: 2.0021, coverage: 1, reachable: 1, deflection: null, p95: null, drive: null, passed: false, reasons: ['收纳体积比 2.002 > 0.800'] },
  { id: 'F07', intersection: 0, storage: 0.6719, coverage: 1, reachable: 1, deflection: 0.3193, p95: 0.5593, drive: '81.2 N（假定 50 mm 力臂换算，不作选型依据）', passed: true, reasons: [] },
  { id: 'F08', intersection: 0, storage: 0.5419, coverage: 1, reachable: 1, deflection: 0.3193, p95: 0.6555, drive: '84.6 N 同口径换算（V1 审查指出跨机构不可比）', passed: true, reasons: [] },
  { id: 'F09', intersection: 848.292, storage: 1.187, coverage: 1, reachable: 1, deflection: null, p95: null, drive: null, passed: false, reasons: ['轨迹最大穿透面积 848.292 mm²', '收纳体积比 1.187 > 0.800'] },
  { id: 'F10', intersection: 43.075, storage: 1.187, coverage: 1, reachable: 1, deflection: null, p95: null, drive: null, passed: false, reasons: ['轨迹最大穿透面积 43.075 mm²', '收纳体积比 1.187 > 0.800'] },
  { id: 'F11', intersection: 6.275, storage: 1.0023, coverage: 1, reachable: 1, deflection: null, p95: null, drive: null, passed: false, reasons: ['轨迹最大穿透面积 6.275 mm²', '收纳体积比 1.002 > 0.800'] },
  { id: 'F12', intersection: 0, storage: 0.754, coverage: 1, reachable: 1, deflection: 0.1708, p95: 0.6583, drive: '39.7 N（重力 + 0.08 摩擦 / 0.8 效率，分族模型）', passed: true, reasons: [] },
  { id: 'F13', intersection: 0, storage: 1.2262, coverage: 1, reachable: 1, deflection: null, p95: null, drive: null, passed: false, reasons: ['收纳体积比 1.226 > 0.800'] },
  { id: 'F14', intersection: 789.006, storage: 3.7062, coverage: 1, reachable: 1, deflection: null, p95: null, drive: null, passed: false, reasons: ['轨迹最大穿透面积 789.006 mm²', '收纳体积比 3.706 > 0.800'] },
  { id: 'SCZ', intersection: 0, storage: 0.4937, coverage: 1, reachable: 1, deflection: 0.3071, p95: 0.8926, drive: '105.7 N（几何增益/效率定义，非执行器选型值）', passed: true, reasons: [] },
]

export const MATRIX_COLS = [
  { key: 'intersection', label: '运动干涉', unit: 'mm²', criterion: '名义轨迹最大穿透面积 = 0', note: 'V1 修正名义（201 姿态）；穿透 >0 即失败' },
  { key: 'storage', label: '收纳包络', unit: '体积比', criterion: '系统收纳比 ≤ 0.800', note: '含运输附件包络；非箱体方案计入料盘/电源/工具' },
  { key: 'coverage', label: '工作空间', unit: '覆盖', criterion: '180 mm 打印高度覆盖 = 1.0', note: '工作空间目标 180 mm；参考外形 347×315×365 mm' },
  { key: 'reachable', label: '可达性', unit: '比例', criterion: '可达比例 = 1.0', note: 'V1 审查后优化亦加入装配可达性约束' },
  { key: 'deflection', label: '刚度/挠度', unit: 'mm', criterion: '10 N 侧载降阶挠度（越低越好）', note: '仅 V1 优化四候选有值；L2 降阶、未标定，跨族为启发式' },
  { key: 'p95', label: '重复定位', unit: 'mm P95', criterion: '20,000 次误差抽样 P95', note: '仅推荐/备选方案补算；模型值，非实测打印精度' },
]

// V1 权重扰动（selection.json）：100 次，基线权重 storage .25 / error .25 / deflection .15 / reliability .15 / cost .1 / complexity .1
export const ROBUST_TABLE = [
  { id: 'F07', freq: '100%', score: 0.1670, pareto: true, family: '根部翻折' },
  { id: 'F08', freq: '100%', score: 0.2544, pareto: false, family: '根部翻折（与 F07 同族，被支配）' },
  { id: 'F12', freq: '100%', score: 0.4666, pareto: true, family: '伸缩' },
  { id: 'SCZ', freq: '0%', score: 0.7346, pareto: true, family: '剪叉（独立机构族）' },
]

// THIRD_OPTION_DECISION.md：F08 vs SCZ
export const THIRD_COMPARE = [
  { metric: '5001 姿态几何复验', f08: '通过，0 mm²', scz: '通过，0 mm²' },
  { metric: '权重扰动前三频率', f08: '100%', scz: '0%' },
  { metric: '系统收纳比（V1 优化）', f08: '0.5175', scz: '0.4703' },
  { metric: '重复定位 P95（模型）', f08: '0.6555 mm', scz: '0.8926 mm' },
  { metric: '10 N 降阶挠度', f08: '0.319 mm', scz: '0.307 mm' },
  { metric: '概念增量成本', f08: '337 CNY', scz: '850 CNY' },
  { metric: '机构族', f08: '根部翻折，与 F07 相同', scz: '剪刀升降，独立' },
  { metric: '主要风险', f08: '与 F07 冗余、偏置铰链刚度', scz: '低位力比、回差、同步、非线性 Z 映射、8+ 销轴' },
]

// F04 证据时间线（review1 + process + summary + final31）
export const F04_TIMELINE = [
  { step: '返工前 · 名义', value: '22.222 mm²', detail: '31 姿态抽象模型最大穿透（审查复算口径）', source: 'review1' },
  { step: '返工前 · 加密', value: '22.825 mm²', detail: '1001 姿态下穿透极值增大——31 点漏掉真实极值', source: 'review1' },
  { step: '返工前 · 优化解', value: '0 穿透', detail: 'lift=70, shift=20 在抽象"抬升+平移+转轴"路径下 31/1001 姿态均 0 —— 一度被推荐', source: 'review1' },
  { step: '审查 critical-1', value: '模型不成立', detail: 'guided 参数从未使用；F04/F10 与根部翻折共用轨迹函数；无槽轨中心线/槽宽/滚轮/导向约束', source: 'review1' },
  { step: '补全槽轨后 · 名义', value: '45.338 mm²', detail: '槽轨中心线、槽宽 12、滚轮 Ø8、导向间隙实例化；槽轨与热床参与碰撞', source: 'summary' },
  { step: '补全槽轨后 · 优化', value: '无可行解', detail: '原优化解在新槽轨碰撞模型下失效；推荐撤回', source: 'process' },
  { step: 'V3.1 final', value: '0 / 238', detail: '全域搜索无可行解；No-Go 冻结暂停', source: 'final31' },
]

// F12 左右对比（selection + v3 + sum321 + lineup32/321）
export const F12_SIM = [
  { metric: 'V1 优化收纳比', value: '0.7998', note: '门槛 0.800，裕量 <0.005，边界候选', version: 'V1 修正' },
  { metric: 'V1 降阶挠度', value: '0.171 mm', note: '四候选中最优', version: 'V1 修正' },
  { metric: 'V1 峰值驱动', value: '39.7 N', note: '重力 + 0.08 摩擦 / 0.8 效率（审查后分族模型）', version: 'V1 修正' },
  { metric: '权重扰动前三频率', value: '100%', note: '100 次扰动始终前三', version: 'V1 修正' },
  { metric: 'V3.2.1 连续碰撞 / 筛选', value: 'PASS / PASS', note: '收纳比 0.735；认证净距 0.474 mm', version: 'V3.2.1' },
  { metric: 'V3.2.1 Y 向挠度', value: '0.0612 mm', note: '全部候选最优', version: 'V3.2.1' },
]
export const F12_ENG = [
  { metric: '研发时间窗口', value: '约六周', note: '课程周期硬约束', version: 'V3.1 决策' },
  { metric: '精密套筒加工', value: '三级嵌套', note: '外径 60 / 壁厚 3 mm 套筒的精密加工与返工风险', version: 'V3 参数' },
  { metric: '导向配合间隙', value: '0.015 mm', note: 'V3 优化预紧版径向间隙——打印/常规加工难以稳定保证', version: 'V3 参数' },
  { metric: '导向晃动', value: '0.203–0.229 mm', note: '多级伸缩导向间隙引起的晃动与卡滞风险不可控', version: 'V3.2 评估' },
  { metric: '概念增量成本', value: '610 CNY', note: '高于 F07 的 320 CNY（±40% 概念估算）', version: 'V1 修正' },
  { metric: '最终资格', value: 'No-Go / Archived', note: '不进入实物制作；仿真结论保留归档', version: 'V3.1→V3.2.1' },
]

// 章节 6 定性矩阵：设计决策维度，而非仿真定量指标
export const QUAL_MATRIX = {
  cols: ['实施复杂度', '机构证据增益', '六周可行性', '收纳表现'],
  rows: [
    { id: 'F09_L82', vals: ['中', '中（同族但双柱同步是新问题）', '中', '0.786 达标'], why: '复杂度 2.5（config 声明）；双侧同步与横梁连接是必须实物回答的问题' },
    { id: 'F07', vals: ['低', '中（根部翻折基线）', '高', '0.751 达标'], why: '复杂度 2.0；结构最简、六周完成概率最高（V3.1 final）' },
    { id: 'SCZ', vals: ['高', '高（独立剪叉族）', '台架可行', '0.503 最低之一'], why: '复杂度 4.8；只做台架不做整机，回答回差/同步/非线性 Z 映射' },
    { id: 'F08', vals: ['低', '低（与 F07 同族重复）', '高', '0.616 但最长边 897'], why: '复杂度 2.4；工程通过概率高但证据增益重复，故为备选' },
    { id: 'F12', vals: ['高', '中（伸缩族）', '低', '0.735 达标'], why: '复杂度 4.1；精密套筒在六周内不可控 → No-Go' },
  ],
}

// V3.2.1 冻结状态板（lineup321 + sum321 + final31 门槛）
export const FINAL_BOARD = [
  { id: 'F09_L82', status: 'Conditional Go', role: '主候选 1', storage: '0.786', defl: '0.1252 mm（最优）', bench: '双立柱同步抬升与横梁连接刚度；215 mm 折叠 X 臂锁紧重复定位；真实公差下底座避让间隙', nogo: '左右高度差 >0.15 mm 引发别卡 → 停 F09，聚焦 F07' },
  { id: 'F07', status: 'Conditional Go', role: '主候选 2', storage: '0.751', defl: '0.8166 mm', bench: '单柱抗扭刚度；抬升导杆装配同轴度与不卡滞间隙', nogo: '侧载挠度 >0.55 mm 或展开 P95 >0.70 mm → 切 F08' },
  { id: 'SCZ', status: 'Bench-only', role: '主候选 3（台架）', storage: '0.503', defl: '0.4446 mm', bench: '仅验证低位丝杆推力与 Z 向回差；不作整机主力', nogo: '双向 Z 回差 >0.15 mm 或低位失步/卡滞 → 立即终止' },
  { id: 'F08', status: 'Fallback', role: '备选 1', storage: '0.616', defl: '0.8166 mm', bench: '后置支撑防倾覆与偏置铰链刚度', nogo: '仅当 F07/F09 台架失败时启用；最长边 897 mm 超便携限制' },
  { id: 'F12', status: 'No-Go', role: '淘汰归档', storage: '0.735（仿真 PASS）', defl: '0.0612 mm（最优）', bench: '不制造', nogo: '六周精密三级伸缩导轨晃动 0.203–0.229 mm 与卡滞不可控' },
]

// V3.2.1 正弦反例（v3_2_1_verification_summary.json）
export const SINUSOID = {
  before: { status: 'PASS', evals: 3, note: 'V3.2 修复前：t=0, 0.5, 1 均在原点，采样漏检 t=0.25 的碰撞' },
  certified: { status: 'FAIL', evals: 4, t: 0.25, pen: 2.0, bound: 'v_max = 100π mm/t', note: 'V3.2.1 认证上界强制自适应细分，在 t=0.25 捕获穿透 2.000 mm' },
  unresolved: { status: 'UNRESOLVED', evals: 3, note: '无上界 Callable：missing_certified_motion_bound，拒绝虚假 PASS' },
}
