import type { ReasonCategory } from './types'

export interface Elimination {
  id: string
  family: string
  kind: 'revoked' | 'nogo' | 'fail' | 'turn' | 'scope'
  stage: string
  lookedGood: string
  trigger: string
  category: ReasonCategory
  verdict: string
  evidence: string[]
}

// 全部事实与 public/evidence 口径一致；kind 表示事件性质而非最终状态。
export const ELIMINATIONS: Elimination[] = [
  {
    id: 'F04', family: '槽轨导向', kind: 'revoked', stage: 'V1 审查修正',
    lookedGood: '抽象优化解 lift=70/shift=20 在 31/1001 姿态下 0 穿透，100 次权重扰动均进前三，一度与 F07 并列推荐。',
    trigger: '模型里没有槽轨实体、滚轮与导向约束——guided 参数从未被使用，F04 与根部翻折共用同一条抽象轨迹。补全后名义穿透 45.338 mm²，优化无可行解。',
    category: 'unmodeled',
    verdict: '不是优化失败，而是建模对象错了。',
    evidence: ['review1', 'summary', 'process'],
  },
  {
    id: 'F12', family: '三级伸缩', kind: 'nogo', stage: 'V3.1 → V3.2.1',
    lookedGood: 'V1 推荐 #2：收纳比 0.7998、挠度 0.171 mm 最优、前三频率 100%；V3.2.1 仍连续碰撞 PASS、Y 挠度 0.0612 mm 全场最优。',
    trigger: '六周课程窗口内，精密三级套筒加工、0.015 mm 径向间隙、0.203–0.229 mm 导向晃动与卡滞风险不可控。',
    category: 'manufacturing',
    verdict: '仿真可行，但工程 No-Go——不是弱，是现阶段不该做。',
    evidence: ['selection', 'sum321', 'lineup32', 'lineup321'],
  },
  {
    id: 'F11', family: '箱体联动', kind: 'fail', stage: 'V1 审查修正',
    lookedGood: 'V1 返工前名义通过：箱体一体化收纳看起来自洽。',
    trigger: '箱盖与联动件从未实例化。补全运动箱盖与自碰撞后：穿透 6.275 mm²、收纳比 1.002，名义失败。',
    category: 'unmodeled',
    verdict: '通过的是"没有箱盖的箱体"，不是这套机构。',
    evidence: ['review1', 'summary'],
  },
  {
    id: 'F14', family: '外部托架组合', kind: 'fail', stage: 'V1 审查修正',
    lookedGood: 'V1 返工前名义通过：先折龙门再收入托架的组合避让理论上最彻底。',
    trigger: '缺少第二阶段翻转，且"龙门"实为单柱。补全双柱预筛与第二阶段翻转后：穿透 789.006 mm²、收纳比 3.706，全场最差。',
    category: 'unmodeled',
    verdict: '组合运动的每一段都必须真实建模，否则包络与干涉都是假的。',
    evidence: ['review1', 'summary'],
  },
  {
    id: 'F09', family: '双柱龙门', kind: 'turn', stage: 'V1 失败 → V2 入围 → V3.2.1 过线',
    lookedGood: '双柱龙门刚度潜力最高；V3.2.1 Y 挠度 0.1252 mm 全场最优。',
    trigger: 'V1 名义穿透 848.292 mm²、收纳比 1.187 失败；V3.2 时 lift=85 收纳比 0.802 仍超 0.800 门槛——直到真实几何调整为 lift=82（0.786）才过线。',
    category: 'storage',
    verdict: '不是早期入围者：引入—修改—复评，三次改参数才真正过线。',
    evidence: ['summary', 'v2', 'report321', 'sum321'],
  },
  {
    id: 'F07', family: '单柱抬升翻折', kind: 'turn', stage: 'V3 一度失败 → V3.1 回归',
    lookedGood: 'V1 推荐 #1：收纳比 0.4927、P95 0.559 mm、100% 稳健前三，结构最简。',
    trigger: 'V3 计入附件包络后收纳比 0.910 超门槛，一度出局；以 lift=75 重新优化后回到名单（0.751）。',
    category: 'storage',
    verdict: '筛选不是单向删除：附件口径一变，推荐方案也会出局再回归。',
    evidence: ['selection', 'v3', 'final31', 'sum321'],
  },
  {
    id: 'F08', family: '单柱后移翻折', kind: 'scope', stage: 'V1 → V3.2.1',
    lookedGood: '工程通过概率最高：5001 姿态通过、前三频率 100%、成本 337 CNY、收纳比 0.616。',
    trigger: '与 F07 同属根部翻折族且被 Pareto 支配——即使成功也只是再验证一次同族机构；折叠最长边 897 mm 超便携限制。',
    category: 'redundant',
    verdict: '不是不够好，是证据重复：留作 Fallback，不做首发主线。',
    evidence: ['third', 'selection', 'sum321'],
  },
  {
    id: 'SCZ', family: '剪叉 Z 轴', kind: 'scope', stage: 'V1 → V3.2.1',
    lookedGood: '独立剪叉机构族、收纳比最低之一（0.503），能回答回差/同步/非线性 Z 映射的关键证据缺口。',
    trigger: '前三频率 0%、P95 0.893 mm、成本 850 CNY、8+ 销轴；低位力比大、回差与同步只能实物回答。',
    category: 'benchrisk',
    verdict: '入围靠证据增益，不是分数：只做台架，不做整机主力。',
    evidence: ['third', 'lineup321', 'sum321'],
  },
]

export const ELIM_BY_ID = Object.fromEntries(ELIMINATIONS.map(e => [e.id, e]))
