export interface Phase {
  from: number
  to: number
  label: string
  detail: string
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
      { from: 0, to: 0.2, label: 'X 臂下折', detail: '中央 X 臂绕中横梁 BRG 叉耳 0→90° 下折' },
      { from: 0.2, to: 0.4, label: '双柱抬升', detail: '双滑座沿塔抬升 0→41 mm（余弦缓动），刚性 SYNC 杆耦合' },
      { from: 0.4, to: 0.45, label: '保持', detail: '抬升到位，等待根部翻折' },
      { from: 0.45, to: 0.95, label: '根部翻折', detail: '龙门整体绕根部同轴转动副 0→90°' },
      { from: 0.95, to: 1, label: '折叠保持', detail: '收纳姿态' },
    ],
    focus: ['左右同步：演示为刚性杆被动耦合，不验证原双丝杆+同步带传动', '横梁连接：V6 起中央 X 臂物理铰接于中横梁 BRG 中央叉耳', '四锁点与折臂锁紧重复定位待实物验证'],
    disclaimer: '缩比原理演示：取消双 T8 丝杆+同步带，抬升为手推+两位置锁销。不得声称已验证原双柱同步传动的载荷分配、消回差与同步误差。',
    validation: [
      { label: 'L2 全行程 2001 步', value: '非允许接触对穿透 0 处' },
      { label: '扫掠凸包保守检查', value: '366 / 366 对确认连续无碰撞' },
      { label: 'L2b 装配约束闭合', value: '14 运动副，闭合失败 0；孔轴审计缺失 0' },
    ],
    keyframes: keys('F09_L82'),
  },
  {
    id: 'F07', tab: 'F07 单柱翻折', title: 'F07 · 单立柱抬升与根部翻折',
    subtitle: 'R1-V6 缩比 1:2 · lift 37.5 mm（原 75）· X 臂 107.5 mm（原 215）',
    phases: [
      { from: 0, to: 0.2, label: 'X 臂下折', detail: 'X 臂绕柱顶叉耳 0→90° 下折' },
      { from: 0.2, to: 0.4, label: '滑座抬升', detail: '单滑座沿双 Ø5 导柱抬升 0→37.5 mm（抗转导向）' },
      { from: 0.4, to: 0.45, label: '保持', detail: '抬升到位，等待根部翻折' },
      { from: 0.45, to: 0.95, label: '根部翻折', detail: '立柱绕根部转动副 0→90°' },
      { from: 0.95, to: 1, label: '折叠保持', detail: '收纳姿态' },
    ],
    focus: ['单柱抗扭：双 Ø5 导柱保留抗转导向（对应原双光轴）', '导向配合：打印配合间隙，非原 0.021 mm 认证净距', '根部/臂铰链为打印销+叉耳，非原 CNC M8 耳片+锥销'],
    disclaimer: '缩比原理演示：抬升手推+锁销，三手动输入（抬升/臂折/根翻）。不承载工程载荷，不测真实刚度/寿命/精度。',
    validation: [
      { label: 'L2 全行程 2001 步', value: '非允许接触对穿透 0 处' },
      { label: '扫掠凸包保守检查', value: '96 / 96 对确认（2 对经细化采样）' },
      { label: 'L2b 装配约束闭合', value: '5 运动副，闭合失败 0；孔轴审计缺失 0' },
    ],
    keyframes: keys('F07'),
  },
  {
    id: 'SCZ', tab: 'SCZ 剪刀 Z 轴', title: 'SCZ · 剪刀式 Z 轴台架',
    subtitle: 'R1-V6 缩比 1:2 · 臂半长 77 mm（原 154）· H 135→22.5 mm（原 270→45）',
    phases: [
      { from: 0, to: 0.15, label: '工具头停靠', detail: '工具头标记移至停靠位' },
      { from: 0.15, to: 1, label: '剪叉收拢', detail: 'H 135→22.5 mm 线性；手推底部横轴，顶横轴随顶滑块移动（V6）' },
    ],
    focus: ['低位输入：低位 |dH/dS| 大（-6.771），水平输入大/垂直输出小，推力放大', '双向回差与左右同步：台架实测目标，回差 >0.15 mm 即终止', '1 DOF 可证：Grübler 3×5−2×7=1；平台水平、x 不漂移'],
    disclaimer: '缩比原理演示：经典固定端+滑动端剪叉（镜像），与仿真对称丝杆驱动不同。输入为手推底部横轴，不演示丝杆推力、效率、自锁；无载荷摩擦不代表真实输入推力。',
    validation: [
      { label: 'L2 全行程 2001 步', value: '非允许接触对穿透 0 处' },
      { label: '扫掠凸包保守检查', value: '18 / 18 对确认连续无碰撞' },
      { label: 'L2b 装配约束闭合', value: '21 运动副，闭合失败 0；孔轴审计 20 项缺失 0' },
    ],
    keyframes: keys('SCZ'),
  },
  {
    id: 'F08_OPTIONAL', tab: 'F08 备选', title: 'F08_OPTIONAL · 后移低枢轴翻折（平面运动卡）',
    subtitle: 'R1-V6 缩比 1:2 · lift 12.5 mm（原 25）· shift −37.5 mm（原 −75）',
    phases: [
      { from: 0, to: 0.2, label: 'X 臂下折', detail: '臂先折 0→90°' },
      { from: 0.2, to: 0.4, label: '抬升', detail: 'L 槽竖直段 0→12.5 mm' },
      { from: 0.4, to: 0.55, label: '后移', detail: 'L 槽水平段 0→−37.5 mm（V6 相位顺序化，无重叠）' },
      { from: 0.55, to: 0.95, label: '向后翻折', detail: '绕低枢轴 0→−90°' },
      { from: 0.95, to: 1, label: '折叠保持', detail: '收纳姿态' },
    ],
    focus: ['L 槽相位：V6 改抬升→后移顺序，避免根销对角卡滞', '仅演示运动关系，不演示整机 897 mm 折叠包络'],
    disclaimer: '平面运动卡（任务允许）：仅演示后移/抬升/反向翻折/避让顺序。工程备选，仅当 F07/F09 台架失败时启用。',
    validation: [
      { label: 'L2 全行程 2001 步', value: '非允许接触对穿透 0 处' },
      { label: 'L2b 装配约束闭合', value: '4 运动副，闭合失败 0；root_slot 路径偏移 ~0' },
    ],
    keyframes: keys('F08_OPTIONAL'),
  },
]

export function phaseAt(spec: MotionSpec, t: number): Phase {
  return spec.phases.find(p => t >= p.from && t < p.to) ?? spec.phases[spec.phases.length - 1]
}
