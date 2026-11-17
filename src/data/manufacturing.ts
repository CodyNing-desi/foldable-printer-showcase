// 实物执行状态（团队现场口径 2026-11-16：昨晚打印计划已执行完毕；PETG 零件数量不足）。
// 零件口径来自 ROUND1_DEMO_CAD/MASTER_PARTS_BOM.csv（R1-V6，MASTER 去重）。

export interface MfgStep {
  label: string
  state: 'done' | 'active' | 'pending'
  note: string
}

export const MFG_LADDER: MfgStep[] = [
  { label: '方案筛选', state: 'done', note: '15 候选 · 7 阶段 · V3.2.1 冻结' },
  { label: 'CAD 冻结', state: 'done', note: '演示模型第 6 版：装配约束与孔位检查通过' },
  { label: '打印计划制定', state: 'done', note: '五台打印机分担零件的排产计划' },
  { label: '打印任务执行', state: 'done', note: '昨晚计划已执行完毕（团队现场口径）' },
  { label: '零件齐套检查', state: 'active', note: 'PETG（较韧的打印材料）零件不够 · 缺口盘点中' },
  { label: '装配验证', state: 'pending', note: '零件到齐后装配；先用接口试件试配' },
  { label: '实测回填', state: 'pending', note: '刚度 / 换向空程 / 左右同步 / 折叠前后打印对照' },
  { label: '最终选型', state: 'pending', note: '由实物闸门决定' },
]

export interface MfgIssue {
  title: string
  detail: string
  affected: string
  options: string
  status: string
}

export const MFG_ISSUES: MfgIssue[] = [
  {
    title: 'PETG 零件数量不足',
    detail: 'BOM 口径 PETG 共 23 项 / 133 件（含跨方案共享）。现场盘点数量不足，具体缺口待齐套核查回填；打印执行完成 ≠ 零件齐套。',
    affected: '跨方案共享销/卡圈影响全部路线（如 F09-CLIP3 ×42、F09-PIN3-L14 ×14）；SCZ 专属 PETG 件最多（44 件：剪叉臂 ×4、滑块 ×4、横轴 ×2、销/卡圈等）',
    options: '补打 PETG / 调整排产；BOM 替代方案列允许评估金属销、E 形金属卡圈外购（非必须）；SCZ 臂加厚 4 mm 需改叉耳槽（未验证）',
    status: '对策待团队确认',
  },
  {
    title: '打印配合尚未冻结',
    detail: '仿真认证净距 0.007–0.023 mm 为 OBB 理论值，不覆盖 FDM ±0.2–0.5 mm 公差；演示模型按 0.3/0.4 mm 配合设计。',
    affected: '全部运动副（销-孔、滑槽、叉耳-舌板）',
    options: 'L4 接口试件试配后冻结配合间隙，再批量装配',
    status: '待试件确认',
  },
]

export const PETG_SHARED = [
  { part: 'F09-CLIP3 · C形卡圈 Ø3', qty: 42, scope: 'F09+F07+SCZ+F08' },
  { part: 'F09-PIN3-L14 · 打印销轴 Ø3', qty: 14, scope: 'F09+F07+F08' },
  { part: 'F09-PIN5-L34 / PIN3-L34 / PIN3-L26', qty: 16, scope: 'F09+F07' },
  { part: 'F09-CLIP5 · C形卡圈 Ø5', qty: 5, scope: 'F09+F07' },
]

export const PETG_SCZ = [
  { part: 'SCZ-ARM · 剪叉臂', qty: 4 },
  { part: 'SCZ-SLB / SLT · 底/顶滑块', qty: 4 },
  { part: 'SCZ-SHB / SHT · 底/顶横轴', qty: 2 },
  { part: 'SCZ 销轴 / 卡圈（Ø4/Ø3/Ø2.5）', qty: 34 },
]
