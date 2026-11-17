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
  version?: string
  f04T?: number
  f12Extend?: number
  f12Wobble?: boolean
}

// 自动演示围绕"视觉变化"编排：每一步驱动一个可观察的机械状态变化，字幕只点题。
export const AUTO_STEPS: AutoStep[] = [
  { chapter: 'ch1', dur: 6, caption: '一台打印机要能打印、能运输、折叠全程不撞、展开后还够硬够准。右边这台 F09 是真实 CAD 模型，拖滑块看它折叠。' },
  { chapter: 'ch2', dur: 7, stage: 's0', motion: 'F09_L82', version: 'v1', caption: '起点是 15 种折叠思路。此刻没有任何一种被验证过。' },
  { chapter: 'ch2', dur: 7, stage: 'v1pre', motion: 'F07', version: 'v1', caption: '第一轮统一考试：6 套及格。F04 在一个简化过头的模型里"假及格"，一度被推荐。' },
  { chapter: 'ch4', dur: 7, f04Mode: 'before', f04T: 0.65, caption: '看 F04 的"考前模型"：只有一条理想路径，没有真实槽轨。优化器在假路径上找到了不撞的解。' },
  { chapter: 'ch4', dur: 8, f04Mode: 'why', f04T: 0.9, caption: '补上真实槽轨后：槽轨扫过热床，重叠 45.338 平方毫米，搜遍参数无解。推荐撤回。' },
  { chapter: 'ch2', dur: 6, stage: 'v2', motion: 'F09_L82', version: 'v2', caption: '换三维尺子再量：双柱龙门 F09 第一次及格——它靠后续改进进入名单，不是早期入围者。' },
  { chapter: 'ch2', dur: 6, stage: 'v3', motion: 'F07', version: 'v3', caption: '把料盘电源工具算进收纳体积：F07 一度出局，F12 改结构后回来。筛选有人出去、有人回来。' },
  { chapter: 'ch5', dur: 8, f12Extend: 0.85, f12Wobble: true, caption: 'F12 仿真全场最优，但三节套筒的间隙晃动在六周内做不稳。工程停止，不是仿真失败。' },
  { chapter: 'ch2', dur: 6, stage: 'v321', motion: 'F09_L82', version: 'v321', caption: '最终冻结：F09 抬升 85→82 毫米才过线。两套主候选 + 一套台架 + 一套备选。' },
  { chapter: 'ch6', dur: 6, caption: '为什么不是总分前三？F08 与 F07 同类、证据重复做备选；SCZ 靠"能带回新答案"只做台架。' },
  { chapter: 'ch7', dur: 9, motion: 'F09_L82', ctrl: { playing: true, traces: true, explode: 0, preset: 'iso' }, caption: '真实 CAD 连续折叠：臂先折 → 双柱抬升 → 根部翻折。蓝色是正在运动的零件。' },
  { chapter: 'ch7', dur: 7, motion: 'F09_L82', ctrl: { playing: false, explode: 1, t: 0, preset: 'iso' }, caption: '按真实装配顺序分阶段拆开：底座 → 塔 → 滑座 → 立柱 → 横梁 → 臂。' },
  { chapter: 'ch7', dur: 8, motion: 'SCZ', ctrl: { playing: true, explode: 0, traces: true, preset: 'iso' }, caption: '剪叉台架：越低越费力，换向空程和左右同步只能实物测。空程超 0.15 毫米即停止。' },
  { chapter: 'ch8', dur: 7, caption: '打印任务已执行完毕，但 PETG 零件不够——到齐、装配、实测都还没完成。让实物决定最终留下什么。' },
]

export const AUTO_TOTAL = AUTO_STEPS.reduce((s, x) => s + x.dur, 0)
