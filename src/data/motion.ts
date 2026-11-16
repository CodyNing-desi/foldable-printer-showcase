export interface Phase {
  from: number
  to: number
  label: string
  detail: string
  purpose: string
  risk: string
}

export interface OverlayMark {
  phase: number
  x: number
  y: number
  kind: 'joint' | 'path' | 'risk'
  label: string
}

export interface Magnifier {
  phase: number
  x: number
  y: number
  w: number
  h: number
  title: string
  note: string
}

export interface MotionSpec {
  id: string
  tab: string
  title: string
  subtitle: string
  phases: Phase[]
  focus: string[]
  disclaimer: string
  validation: { label: string; value: string }[]
  keyframes: { name: string; t: number; file: string }[]
  marks: OverlayMark[]
  magnifiers: Magnifier[]
  decision: { role: string; why: string; verified: string[]; notVerified: string[] }
}

const KEY_T = [
  { name: '展开', t: 0.0, file: 'open' },
  { name: '臂折', t: 0.2, file: 'armfold' },
  { name: '抬升', t: 0.42, file: 'lifted' },
  { name: '半折', t: 0.7, file: 'midfold' },
  { name: '折叠', t: 1.0, file: 'folded' },
]

function keys(id: string) {
  return KEY_T.map(k => ({ ...k, file: `assets/${id}/view_${k.file}.png` }))
}

export const MOTIONS: MotionSpec[] = [
  {
    id: 'F09_L82', tab: 'F09 双柱龙门', title: 'F09_L82 · 双柱龙门抬升与折叠',
    subtitle: 'R1-V6 缩比 1:2 · lift 41 mm（原 82）· 塔 y±65（原 ±130）· X 臂 107.5 mm（原 215）',
    phases: [
      { from: 0, to: 0.2, label: 'X 臂下折', detail: '中央 X 臂绕中横梁 BRG 叉耳 0→90° 下折', purpose: '先把 215 mm 悬臂收短，避免翻折时扫过底座与热床', risk: '折臂锁紧重复定位精度（台架实测目标）' },
      { from: 0.2, to: 0.4, label: '双柱抬升', detail: '双滑座沿塔抬升 0→41 mm（余弦缓动），刚性 SYNC 杆耦合', purpose: '抬高根部枢轴，为翻折让出避让空间', risk: '左右同步偏差——演示为刚性杆，原双丝杆+同步带载荷分配未验证' },
      { from: 0.4, to: 0.45, label: '保持', detail: '抬升到位，等待根部翻折', purpose: '相位分离：抬升与翻折不同时发生，降低干涉风险', risk: '锁销两位置保持可靠性' },
      { from: 0.45, to: 0.95, label: '根部翻折', detail: '龙门整体绕根部同轴转动副 0→90°', purpose: '整体倒伏收纳，压缩高度包络', risk: '横梁连接刚度、根部四锁点受力' },
      { from: 0.95, to: 1, label: '折叠保持', detail: '收纳姿态', purpose: '运输包络锁定', risk: '运输振动下锁点松脱' },
    ],
    focus: ['左右同步：演示为刚性杆被动耦合，不验证原双丝杆+同步带传动', '横梁连接：V6 起中央 X 臂物理铰接于中横梁 BRG 中央叉耳', '四锁点与折臂锁紧重复定位待实物验证'],
    disclaimer: '缩比原理演示：取消双 T8 丝杆+同步带，抬升为手推+两位置锁销。不得声称已验证原双柱同步传动的载荷分配、消回差与同步误差。',
    validation: [
      { label: 'L2 全行程 2001 步', value: '非允许接触对穿透 0 处' },
      { label: '扫掠凸包保守检查', value: '366 / 366 对确认连续无碰撞' },
      { label: 'L2b 装配约束闭合', value: '14 运动副，闭合失败 0；孔轴审计缺失 0' },
    ],
    keyframes: keys('F09_L82'),
    marks: [
      { phase: 0, x: 0.5, y: 0.32, kind: 'joint', label: 'BRG 中央叉耳（V6 修复 P0-1）' },
      { phase: 0, x: 0.62, y: 0.3, kind: 'path', label: 'X 臂下折 0→90°' },
      { phase: 1, x: 0.28, y: 0.55, kind: 'joint', label: '左滑座抬升副' },
      { phase: 1, x: 0.72, y: 0.55, kind: 'joint', label: '右滑座抬升副' },
      { phase: 1, x: 0.5, y: 0.62, kind: 'risk', label: '刚性 SYNC 杆 ≠ 原同步传动' },
      { phase: 3, x: 0.3, y: 0.82, kind: 'joint', label: '根部同轴转动副' },
      { phase: 3, x: 0.7, y: 0.82, kind: 'joint', label: '根部同轴转动副' },
    ],
    magnifiers: [
      { phase: 0, x: 0.34, y: 0.16, w: 0.34, h: 0.34, title: '中央 X 臂铰接（BRG 叉耳）', note: 'V5 曾悬空仅动画对齐；V6 零件级铰接，L2b 闭合误差 ~0、孔轴审计确认孔存在。' },
      { phase: 1, x: 0.14, y: 0.34, w: 0.34, h: 0.36, title: '滑座-塔抬升副', note: '双滑座由刚性 SYNC 杆被动耦合：只演示运动学同步，不验证载荷分配与消回差。' },
      { phase: 3, x: 0.16, y: 0.6, w: 0.4, h: 0.34, title: '根部翻折铰链', note: '双柱共轴翻折；左右高度差 >0.15 mm 引发别卡即停 F09（V3.1 门槛）。' },
    ],
    decision: {
      role: '主候选 1 · Conditional Go',
      why: '刚度潜力最高（Y 挠度 0.1252 mm 最优），但双侧同步与横梁连接必须实物回答。',
      verified: ['运动学相位与限位', '2001 步采样 + 凸包保守无碰撞', 'L2b 装配闭合与孔轴审计', '中央 X 臂真实铰接（V6）'],
      notVerified: ['原双丝杆+同步带的同步性能', '承载刚度 / 寿命', '真实公差下底座避让间隙', '折臂锁紧重复定位'],
    },
  },
  {
    id: 'F07', tab: 'F07 单柱翻折', title: 'F07 · 单立柱抬升与根部翻折',
    subtitle: 'R1-V6 缩比 1:2 · lift 37.5 mm（原 75）· X 臂 107.5 mm（原 215）',
    phases: [
      { from: 0, to: 0.2, label: 'X 臂下折', detail: 'X 臂绕柱顶叉耳 0→90° 下折', purpose: '收短悬臂，避免翻折干涉', risk: '臂铰链打印销+叉耳的锁紧重复性（非原 CNC M8 耳片）' },
      { from: 0.2, to: 0.4, label: '滑座抬升', detail: '单滑座沿双 Ø5 导柱抬升 0→37.5 mm（抗转导向）', purpose: '抬高枢轴让出避让空间', risk: '单柱抗扭 + 导杆同轴度：认证净距仅 0.021 mm，打印公差无法覆盖' },
      { from: 0.4, to: 0.45, label: '保持', detail: '抬升到位，等待根部翻折', purpose: '相位分离防呆：横臂先折→抬升→翻折', risk: '顺序错误即干涉（台架验证防呆）' },
      { from: 0.45, to: 0.95, label: '根部翻折', detail: '立柱绕根部转动副 0→90°', purpose: '倒伏收纳', risk: '根部铰链间隙与展开重复定位 P95' },
      { from: 0.95, to: 1, label: '折叠保持', detail: '收纳姿态', purpose: '运输包络锁定', risk: '锁点保持' },
    ],
    focus: ['单柱抗扭：双 Ø5 导柱保留抗转导向（对应原双光轴）', '导向配合：打印配合间隙，非原 0.021 mm 认证净距', '根部/臂铰链为打印销+叉耳，非原 CNC M8 耳片+锥销'],
    disclaimer: '缩比原理演示：抬升手推+锁销，三手动输入（抬升/臂折/根翻）。不承载工程载荷，不测真实刚度/寿命/精度。',
    validation: [
      { label: 'L2 全行程 2001 步', value: '非允许接触对穿透 0 处' },
      { label: '扫掠凸包保守检查', value: '96 / 96 对确认（2 对经细化采样）' },
      { label: 'L2b 装配约束闭合', value: '5 运动副，闭合失败 0；孔轴审计缺失 0' },
    ],
    keyframes: keys('F07'),
    marks: [
      { phase: 0, x: 0.42, y: 0.24, kind: 'joint', label: '柱顶叉耳（单柱承臂）' },
      { phase: 1, x: 0.4, y: 0.55, kind: 'joint', label: '双 Ø5 导柱抗转导向' },
      { phase: 1, x: 0.52, y: 0.5, kind: 'risk', label: '抗扭 / 同轴度风险' },
      { phase: 3, x: 0.4, y: 0.82, kind: 'joint', label: '根部转动副' },
    ],
    magnifiers: [
      { phase: 0, x: 0.28, y: 0.1, w: 0.36, h: 0.34, title: '柱顶叉耳臂铰', note: '单柱无 BRG，臂直接铰于柱顶；打印销+叉耳替代原 CNC 耳片+锥销。' },
      { phase: 1, x: 0.26, y: 0.36, w: 0.36, h: 0.36, title: '滑座-导柱抬升副', note: '双导柱抗转；原方案导杆认证净距 0.021 mm，FDM ±0.2–0.5 mm 公差必须靠试件冻结配合。' },
      { phase: 3, x: 0.24, y: 0.6, w: 0.4, h: 0.34, title: '根部铰链', note: '侧载挠度 >0.55 mm 或展开 P95 >0.70 mm → 切 F08（V3.1 门槛）。' },
    ],
    decision: {
      role: '主候选 2 · Conditional Go',
      why: '结构最简、六周完成概率最高；代价是单柱抗扭与极小导向净距必须实测。',
      verified: ['三手动输入相位与防呆顺序', '2001 步采样 + 凸包保守无碰撞', 'L2b 装配闭合与孔轴审计'],
      notVerified: ['3060 升级型材抗扭刚度', '真实导向间隙与卡滞', '折臂锁紧重复定位', '承载与寿命'],
    },
  },
  {
    id: 'SCZ', tab: 'SCZ 剪刀 Z 轴', title: 'SCZ · 剪刀式 Z 轴台架',
    subtitle: 'R1-V6 缩比 1:2 · 臂半长 77 mm（原 154）· H 135→22.5 mm（原 270→45）',
    phases: [
      { from: 0, to: 0.15, label: '工具头停靠', detail: '工具头标记移至停靠位', purpose: '收拢前清空平台上方干涉区', risk: '停靠位与剪叉臂净距' },
      { from: 0.15, to: 1, label: '剪叉收拢', detail: 'H 135→22.5 mm 线性；手推底部横轴，顶横轴随顶滑块移动（V6）', purpose: '以水平输入换垂直行程，压缩收纳高度', risk: '低位 |dH/dS|=6.771：推力放大；双向回差与左右同步只能实测' },
    ],
    focus: ['低位输入：低位 |dH/dS| 大（-6.771），水平输入大/垂直输出小，推力放大', '双向回差与左右同步：台架实测目标，回差 >0.15 mm 即终止', '1 DOF 可证：Grübler 3×5−2×7=1；平台水平、x 不漂移'],
    disclaimer: '缩比原理演示：经典固定端+滑动端剪叉（镜像），与仿真对称丝杆驱动不同。输入为手推底部横轴，不演示丝杆推力、效率、自锁；无载荷摩擦不代表真实输入推力。',
    validation: [
      { label: 'L2 全行程 2001 步', value: '非允许接触对穿透 0 处' },
      { label: '扫掠凸包保守检查', value: '18 / 18 对确认连续无碰撞' },
      { label: 'L2b 装配约束闭合', value: '21 运动副，闭合失败 0；孔轴审计 20 项缺失 0' },
    ],
    keyframes: keys('SCZ'),
    marks: [
      { phase: 1, x: 0.32, y: 0.8, kind: 'joint', label: '底部固定铰' },
      { phase: 1, x: 0.62, y: 0.8, kind: 'joint', label: '底部滑动端（手推输入）' },
      { phase: 1, x: 0.5, y: 0.5, kind: 'joint', label: '中心交叉铰' },
      { phase: 1, x: 0.62, y: 0.26, kind: 'joint', label: '顶滑块 + SHT 横轴（V6 修复 P0-2）' },
      { phase: 1, x: 0.44, y: 0.66, kind: 'risk', label: '低位推力放大 / 回差风险' },
    ],
    magnifiers: [
      { phase: 1, x: 0.3, y: 0.34, w: 0.4, h: 0.36, title: '剪叉中心交叉铰', note: '臂交叉认证净距仅 0.010 mm（OBB 理论值）；打印配合按 0.3/0.4 mm 设计，须试件冻结。' },
      { phase: 1, x: 0.44, y: 0.62, w: 0.4, h: 0.32, title: '底部滑动端输入', note: '手推横轴 SHB 刚性耦合左右副；不演示丝杆推力/效率/自锁。T8 回差 0.386 mm vs SFU1204 0.096 mm 待实测。' },
      { phase: 1, x: 0.4, y: 0.1, w: 0.4, h: 0.3, title: '顶滑块与 SHT 横轴', note: 'V5 顶横轴误置固定位；V6 随顶滑块 sx 移动，L2b 复核刚体相对位姿不变。' },
    ],
    decision: {
      role: '主候选 3 · Bench-only（仅台架）',
      why: '入围靠独立机构证据增益：回差、同步、非线性 Z 映射是现有资料最大的证据缺口。',
      verified: ['1 DOF 运动学（平台水平、x 不漂移）', '2001 步采样 + 凸包保守无碰撞', 'L2b 装配闭合与孔轴审计', '顶横轴随动修复（V6）'],
      notVerified: ['丝杆推力与真实效率', '双向 Z 回差 ≤0.15 mm', '左右同步倾角 ≤0.05°', '低位爬行/卡滞'],
    },
  },
  {
    id: 'F08_OPTIONAL', tab: 'F08 备选', title: 'F08_OPTIONAL · 后移低枢轴翻折（平面运动卡）',
    subtitle: 'R1-V6 缩比 1:2 · lift 12.5 mm（原 25）· shift −37.5 mm（原 −75）',
    phases: [
      { from: 0, to: 0.2, label: 'X 臂下折', detail: '臂先折 0→90°', purpose: '收短悬臂', risk: '臂铰锁紧' },
      { from: 0.2, to: 0.4, label: '抬升', detail: 'L 槽竖直段 0→12.5 mm', purpose: '让出根部避让高度', risk: 'L 槽竖直段导向间隙' },
      { from: 0.4, to: 0.55, label: '后移', detail: 'L 槽水平段 0→−37.5 mm（V6 相位顺序化，无重叠）', purpose: '枢轴后移，向底座后方翻折', risk: 'V5 相位重叠曾致根销对角卡滞（V6 已顺序化）' },
      { from: 0.55, to: 0.95, label: '向后翻折', detail: '绕低枢轴 0→−90°', purpose: '后倒收纳，体积比最低', risk: '后置支撑防倾覆、偏置铰链刚度' },
      { from: 0.95, to: 1, label: '折叠保持', detail: '收纳姿态', purpose: '运输包络锁定', risk: '最长边 897 mm 超便携箱包' },
    ],
    focus: ['L 槽相位：V6 改抬升→后移顺序，避免根销对角卡滞', '仅演示运动关系，不演示整机 897 mm 折叠包络'],
    disclaimer: '平面运动卡（任务允许）：仅演示后移/抬升/反向翻折/避让顺序。工程备选，仅当 F07/F09 台架失败时启用。',
    validation: [
      { label: 'L2 全行程 2001 步', value: '非允许接触对穿透 0 处' },
      { label: 'L2b 装配约束闭合', value: '4 运动副，闭合失败 0；root_slot 路径偏移 ~0' },
    ],
    keyframes: keys('F08_OPTIONAL'),
    marks: [
      { phase: 1, x: 0.4, y: 0.6, kind: 'joint', label: 'L 槽竖直段' },
      { phase: 2, x: 0.32, y: 0.7, kind: 'path', label: 'L 槽水平段（后移）' },
      { phase: 3, x: 0.3, y: 0.78, kind: 'joint', label: '低枢轴后翻' },
    ],
    magnifiers: [
      { phase: 2, x: 0.24, y: 0.5, w: 0.4, h: 0.36, title: 'L 槽根滑块', note: 'V6 相位顺序化：抬升 0.20–0.40 → 后移 0.40–0.55，无重叠，避免对角卡滞。' },
    ],
    decision: {
      role: '备选 1 · Fallback',
      why: '与 F07 同族、证据重复；收纳比虽低但最长边 897 mm。只在 F07/F09 台架失败时启用。',
      verified: ['平面运动顺序与 L 槽相位', 'L2b 装配闭合'],
      notVerified: ['整机 897 mm 包络的便携性', '后置支撑防倾覆', '偏置铰链刚度'],
    },
  },
]

export function phaseAt(spec: MotionSpec, t: number): Phase {
  return spec.phases.find(p => t >= p.from && t < p.to) ?? spec.phases[spec.phases.length - 1]
}

export function phaseIndex(spec: MotionSpec, t: number): number {
  const i = spec.phases.findIndex(p => t >= p.from && t < p.to)
  return i === -1 ? spec.phases.length - 1 : i
}
