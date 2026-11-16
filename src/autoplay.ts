import type { StageId } from './data/types'
import type { ViewerCtrl } from './state'
import type { F04Mode } from './three/SchematicScenes'

export interface AutoStep {
  chapter: string
  caption: string
  dur: number
  stage?: StageId
  motion?: string
  ctrl?: Partial<ViewerCtrl>
  f04Mode?: F04Mode
  f04T?: number
  f12Extend?: number
  f12Wobble?: boolean
}

// 自动演示围绕"视觉变化"编排：每一步驱动一个可观察的机械状态变化，字幕只点题。
export const AUTO_STEPS: AutoStep[] = [
  { chapter: 'ch1', dur: 6, caption: '一台打印机要能打印、能运输、折叠全程不干涉。右边这台 F09，拖动滑块看它折叠。' },
  { chapter: 'ch2', dur: 7, stage: 's0', motion: 'F09_L82', caption: '起点：15 种机构构想。没有任何一套被验证过。' },
  { chapter: 'ch2', dur: 7, stage: 'v1pre', motion: 'F07', caption: 'V1 初筛：6 套名义通过。F04 在抽象模型里"假可行"，一度被推荐。' },
  { chapter: 'ch4', dur: 7, f04Mode: 'before', f04T: 0.65, caption: 'F04 的 Before：优化器优化的只是一条抽象枢轴路径——没有槽轨。' },
  { chapter: 'ch4', dur: 8, f04Mode: 'why', f04T: 0.9, caption: '补全真实槽轨后：槽轨扫过热床，穿透 45.338 mm²，优化无可行解。推荐撤回。' },
  { chapter: 'ch2', dur: 6, stage: 'v2', motion: 'F09_L82', caption: 'V2 三维检查：F09 双柱龙门首次进入有效竞争——它不是早期入围者。' },
  { chapter: 'ch2', dur: 6, stage: 'v3', motion: 'F07', caption: 'V3 计入附件：F07 一度出局，F12 优化版回归。筛选不是单向删除。' },
  { chapter: 'ch5', dur: 8, f12Extend: 0.85, f12Wobble: true, caption: 'F12 仿真全场最优，但三级套筒的晃动与卡滞在六周内做不稳。工程 No-Go。' },
  { chapter: 'ch2', dur: 6, stage: 'v321', motion: 'F09_L82', caption: 'V3.2.1 冻结：F09 把抬升从 85 改到 82 才真正过线。三主候选 + 一备选。' },
  { chapter: 'ch6', dur: 6, caption: '为什么不是综合前三名？F08 证据重复做备选，SCZ 靠独立证据增益只做台架。' },
  { chapter: 'ch7', dur: 9, motion: 'F09_L82', ctrl: { playing: true, traces: true, explode: 0, preset: 'iso' }, caption: '真实 CAD 装配连续折叠：X 臂下折 → 双柱抬升 → 根部翻折。蓝色是正在运动的部件。' },
  { chapter: 'ch7', dur: 7, motion: 'F09_L82', ctrl: { playing: false, explode: 1, t: 0, preset: 'iso' }, caption: '按真实装配关系分阶段爆炸：底座 → 塔 → 滑座 → 立柱 → 横梁 → X 臂。' },
  { chapter: 'ch7', dur: 8, motion: 'SCZ', ctrl: { playing: true, explode: 0, traces: true, preset: 'iso' }, caption: 'SCZ 剪叉台架：低位推力放大、回差与同步只能实物回答。回差超 0.15 mm 即终止。' },
  { chapter: 'ch8', dur: 7, caption: '打印任务已执行完毕，但 PETG 缺件——齐套、装配、实测都还没完成。让实物决定最终留下什么。' },
]

export const AUTO_TOTAL = AUTO_STEPS.reduce((s, x) => s + x.dur, 0)
