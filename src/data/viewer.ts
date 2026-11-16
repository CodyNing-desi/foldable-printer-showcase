// 3D 解释器的设计数据：零件中文名、按机构结构设计的分解方向、相机预设、相位-运动副映射。
// 分解方向依据各方案真实装配关系（紧固件→子装配→主结构），不是通用径向分解。

export interface ExplodeSpec { vec: [number, number, number]; order: number }

export const PART_LABELS: Record<string, string> = {
  BASE: '底座', BED: '热床', TWR: '抬升塔', CAR: '滑座', COL: '立柱',
  XBAR: '顶横梁', BRG: '中横梁（中央叉耳）', SYNC: '刚性同步杆', ARM: 'X 臂 + 工具头',
  ARM_A: '剪叉臂 A（滑动端）', ARM_B: '剪叉臂 B（固定端）', SLB: '底部滑块', SLT: '顶部滑块',
  POST: '固定座', SHB: '底部输入横轴', SHT: '顶部横轴', PLAT: '平台',
  CARD: '平面运动卡', SLIDER: '根滑块（L 槽）', FOOT: '后支脚',
}

export function partLabel(pid: string): string {
  const base = pid.split('_')[0]
  const suffix = pid.includes('_') ? pid.slice(base.length + 1) : ''
  const side = suffix === '0' || suffix === 'L' ? ' · 左' : suffix === '1' || suffix === 'R' ? ' · 右' : ''
  return (PART_LABELS[base] ?? base) + side
}

export const EXPLODE: Record<string, Record<string, ExplodeSpec>> = {
  F09_L82: {
    BASE: { vec: [0, 0, -45], order: 0 }, BED: { vec: [0, 0, 32], order: 1 },
    TWR_0: { vec: [0, -60, 0], order: 2 }, TWR_1: { vec: [0, 60, 0], order: 2 },
    CAR_0: { vec: [0, -100, 18], order: 3 }, CAR_1: { vec: [0, 100, 18], order: 3 },
    SYNC: { vec: [-75, 0, 18], order: 3 },
    COL_0: { vec: [0, -145, 50], order: 4 }, COL_1: { vec: [0, 145, 50], order: 4 },
    XBAR: { vec: [0, 0, 100], order: 5 }, BRG: { vec: [50, 0, 75], order: 5 },
    ARM: { vec: [100, 0, 100], order: 6 },
  },
  F07: {
    BASE: { vec: [0, 0, -45], order: 0 }, BED: { vec: [0, 0, 32], order: 1 },
    TWR_0: { vec: [0, -60, 0], order: 2 }, CAR_0: { vec: [0, -100, 18], order: 3 },
    COL_0: { vec: [0, -135, 50], order: 4 }, ARM: { vec: [95, 0, 95], order: 5 },
  },
  SCZ: {
    BASE: { vec: [0, 0, -45], order: 0 }, BED: { vec: [0, 0, 32], order: 1 },
    POST_L: { vec: [0, -65, 0], order: 2 }, POST_R: { vec: [0, 65, 0], order: 2 },
    SLB_L: { vec: [0, -95, -12], order: 3 }, SLB_R: { vec: [0, 95, -12], order: 3 },
    SHB: { vec: [0, 0, -40], order: 3 },
    ARM_A_L: { vec: [0, -125, 30], order: 4 }, ARM_A_R: { vec: [0, 125, 30], order: 4 },
    ARM_B_L: { vec: [0, -155, 60], order: 5 }, ARM_B_R: { vec: [0, 155, 60], order: 5 },
    SLT_L: { vec: [0, -95, 85], order: 6 }, SLT_R: { vec: [0, 95, 85], order: 6 },
    SHT: { vec: [0, 0, 115], order: 6 }, PLAT: { vec: [0, 0, 150], order: 7 },
  },
  F08_OPTIONAL: {
    CARD: { vec: [0, 0, -35], order: 0 }, FOOT: { vec: [-65, 0, 12], order: 1 },
    SLIDER: { vec: [0, -65, 25], order: 2 }, COL: { vec: [0, -105, 50], order: 3 },
    ARM: { vec: [65, -135, 75], order: 4 },
  },
}

export type CamPreset = 'iso' | 'front' | 'side' | 'top' | 'detail'

// 视线方向（Z-up 世界）。距离由自动取景按包围盒计算，这里只定方向。
export const CAM_DIRS: Record<CamPreset, [number, number, number]> = {
  iso: [1, -1, 0.72],
  front: [0, -1, 0.16],
  side: [1, 0, 0.16],
  top: [0, -0.18, 1],
  detail: [1, -1, 0.5],
}

// 零件功能分组配色（工业可视化口径，参考 CADScope 分类调色）
export const PART_COLORS: Record<string, string> = {
  BASE: '#aeb6c0', BED: '#c2c8d0', CARD: '#aeb6c0',
  TWR: '#7d8590', POST: '#7d8590',
  CAR: '#2456e6', SLB: '#2456e6', SLT: '#2456e6', SLIDER: '#2456e6',
  COL: '#e0a63a',
  XBAR: '#1a7f4b', BRG: '#1a7f4b', PLAT: '#1a7f4b',
  SYNC: '#7c5cd6', SHB: '#7c5cd6', SHT: '#7c5cd6',
  ARM: '#f0883e', ARM_A: '#f0883e', ARM_B: '#f0883e', FOOT: '#f0883e',
}

export const CAM_PRESETS: Record<string, Record<CamPreset, { pos: [number, number, number]; target: [number, number, number] }>> = {
  F09_L82: {
    iso: { pos: [300, -330, 230], target: [70, 0, 85] },
    front: { pos: [70, -430, 95], target: [70, 0, 85] },
    side: { pos: [480, 0, 95], target: [70, 0, 85] },
    top: { pos: [70, 0, 520], target: [70, 0, 60] },
    detail: { pos: [150, -160, 220], target: [36, 0, 150] },
  },
  F07: {
    iso: { pos: [280, -320, 220], target: [60, 0, 85] },
    front: { pos: [60, -420, 95], target: [60, 0, 85] },
    side: { pos: [460, 0, 95], target: [60, 0, 85] },
    top: { pos: [60, 0, 500], target: [60, 0, 60] },
    detail: { pos: [140, -150, 210], target: [36, 0, 150] },
  },
  SCZ: {
    iso: { pos: [330, -330, 220], target: [80, 0, 70] },
    front: { pos: [80, -430, 80], target: [80, 0, 70] },
    side: { pos: [500, 0, 80], target: [80, 0, 70] },
    top: { pos: [80, 0, 500], target: [80, 0, 50] },
    detail: { pos: [200, -170, 130], target: [100, 0, 60] },
  },
  F08_OPTIONAL: {
    iso: { pos: [160, -260, 260], target: [20, 40, 10] },
    front: { pos: [20, 40, 420], target: [20, 40, 0] },
    side: { pos: [420, 40, 60], target: [20, 40, 10] },
    top: { pos: [20, 40, 420], target: [20, 40, 0] },
    detail: { pos: [90, -120, 160], target: [20, 25, 10] },
  },
}

export const PHASE_JOINTS: Record<string, string[][]> = {
  F09_L82: [['arm'], ['lift_0', 'lift_1'], [], ['root_0', 'root_1'], []],
  F07: [['arm'], ['lift_0'], [], ['root_0'], []],
  SCZ: [[], ['center_L', 'center_R', 'slide_bot_L']],
  F08_OPTIONAL: [['arm'], ['root'], ['root_slot'], ['root'], []],
}

export const JOINT_LABELS: Record<string, string> = {
  arm: 'X 臂铰链', arm_0: 'X 臂铰链', lift_0: '左抬升副', lift_1: '右抬升副',
  root_0: '左根部铰链', root_1: '右根部铰链', root: '根部铰链', root_slot: 'L 槽路径',
  center_L: '左中心交叉铰', center_R: '右中心交叉铰', slide_bot_L: '底部滑动端',
  slide_bot_R: '底部滑动端', slide_top_L: '顶部滑动端', slide_top_R: '顶部滑动端',
  armA_bot_L: '臂A底铰', armB_bot_L: '臂B底铰', armA_top_L: '臂A顶铰', armB_top_L: '臂B顶铰',
}

// 运动轨迹追踪点（零件局部坐标）
export const TRACE_POINTS: Record<string, { pid: string; local: [number, number, number]; label: string }[]> = {
  F09_L82: [
    { pid: 'ARM', local: [107.5, 0, 0], label: 'X 臂端轨迹' },
    { pid: 'CAR_0', local: [14, 0, 3], label: '滑座抬升轨迹' },
    { pid: 'COL_0', local: [0, 0, 0], label: '根部枢轴轨迹' },
  ],
  F07: [
    { pid: 'ARM', local: [107.5, 0, 0], label: 'X 臂端轨迹' },
    { pid: 'CAR_0', local: [14, 0, 3], label: '滑座抬升轨迹' },
  ],
  SCZ: [
    { pid: 'PLAT', local: [0, 0, 0], label: '平台高度轨迹' },
    { pid: 'SLB_L', local: [0, 0, 0], label: '底部输入轨迹' },
  ],
  F08_OPTIONAL: [
    { pid: 'ARM', local: [0, 137.5, 10.5], label: '臂端轨迹' },
    { pid: 'SLIDER', local: [0, 0, 1.5], label: '根滑块 L 槽轨迹' },
  ],
}

export function explodeWindow(order: number, maxOrder: number, progress: number): number {
  const n = maxOrder + 1
  const a = order / n, b = (order + 1) / n
  const u = Math.min(1, Math.max(0, (progress - a) / (b - a)))
  return u * u * (3 - 2 * u)
}
