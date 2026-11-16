import type { StageId } from './data/types'

export interface AutoStep {
  chapter: string
  caption: string
  dur: number // seconds
  stage?: StageId
  motion?: string
  play?: boolean
  f04?: number
}

export const AUTO_STEPS: AutoStep[] = [
  { chapter: 'ch1', dur: 6, caption: '设计问题：展开要能打印，收纳要能运输，折叠全程不能干涉，展开后还要够刚、够准、装得起来。' },
  { chapter: 'ch2', dur: 6, stage: 's0', caption: '起点是 15 种机构构想：根部翻折、横臂、伸缩、槽轨、外部托架、箱体、抽屉、剪叉。此时没有任何一套被验证。' },
  { chapter: 'ch2', dur: 7, stage: 'v1pre', caption: 'V1 统一初筛（31 姿态）：6 套名义通过。F04 名义失败，却在抽象优化模型里"通过"，一度与 F07 一起被推荐。' },
  { chapter: 'ch2', dur: 7, stage: 'v1fix', caption: '独立审查发现 F04 没有真实槽轨。补全机构后穿透 45.338 mm²、优化无可行解——推荐撤回。F11/F14 补全联动后也失败。' },
  { chapter: 'ch4', dur: 7, f04: 1, caption: 'F04 三联对照：抽象模型 → 补全槽轨 → 失败机制。优化器找到可行路径，不等于被优化的机械结构真实可行。' },
  { chapter: 'ch2', dur: 6, stage: 'v2', caption: 'V2 升级到三维 OBB/SAT 检查：F09 双柱龙门首次通过筛选——它不是早期入围者，而是后续设计复评进入名单。' },
  { chapter: 'ch2', dur: 6, stage: 'v3', caption: 'V3 计入附件包络与扫掠：F07 一度失败（0.910），F12 以优化预紧版重新通过。筛选不是单向淘汰，而是引入—修改—复评。' },
  { chapter: 'ch5', dur: 7, caption: 'F12 仿真持续可行、刚度最优，但六周内精密三级套筒的晃动与卡滞风险不可控——工程 No-Go，不是仿真失败。' },
  { chapter: 'ch2', dur: 6, stage: 'v31', caption: 'V3.1 实物决选：F09/F07/SCZ 获 Conditional Go，F08 备选；F12 与 F04 冻结暂停。' },
  { chapter: 'ch2', dur: 7, stage: 'v321', caption: 'V3.2.1 冻结：F09 以 lift=82 通过 0.800 门槛。卡片重组为主候选、探索台架、工程备选、No-Go 及归档。' },
  { chapter: 'ch6', dur: 7, caption: '为什么不是综合前三名？选择规则在优化前冻结：稳健前三 ≥80% 且机构族不同。SCZ 入围靠的是独立机构证据增益，不是分数。' },
  { chapter: 'ch7', dur: 8, motion: 'F09_L82', play: true, caption: 'R1-V6 真实 CAD 动画：F09 双柱龙门——X 臂下折 → 双柱抬升 → 根部翻折。注意这是 1:2 缩比原理演示。' },
  { chapter: 'ch7', dur: 7, motion: 'F07', play: true, caption: 'F07 单柱路线：X 臂下折 → 滑座抬升 → 根部翻折。台架要回答单柱抗扭与导向配合。' },
  { chapter: 'ch7', dur: 7, motion: 'SCZ', play: true, caption: 'SCZ 剪叉台架：低位输入力比大、双向回差与同步是必须实物验证的问题。回差超 0.15 mm 即终止。' },
  { chapter: 'ch8', dur: 5, caption: '打印任务昨晚已执行完毕，但 PETG 零件数量不足——打印执行完 ≠ 零件齐套 ≠ 实验完成。让实物决定最终留下什么。' },
]

export const AUTO_TOTAL = AUTO_STEPS.reduce((s, x) => s + x.dur, 0)
