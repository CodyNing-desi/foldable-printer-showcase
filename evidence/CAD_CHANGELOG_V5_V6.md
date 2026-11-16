# R1-V5 → R1-V6 变更对照表

针对独立审查反馈（P0-1/P0-2/P0-3/P1-1/P1-2/P1-3）的逐项修复。V5 问题记录保留于
各方案 VALIDATION/HISTORY/ 与本表，不删除。

| 编号 | 审查问题 | V5 状态 | V6 修复 | 证据 |
|---|---|---|---|---|
| P0-1 | F09 中央 X 臂(y=0)未与龙门(y=±65)形成机械连接 | 臂叉耳在立柱上，臂悬空于 y=0，仅动画对齐 | **零件级 CAD**：立柱叉耳移除(F09)，中横梁 BRG 抬高至 world z142.5–157.5 并加中央叉耳，X 臂真实铰接于 BRG；F07 单柱仍由柱顶叉耳承臂 | L2b 闭合 arm 副径向/轴线误差~0；CAD 孔轴审计 BRG/ARM 孔存在 |
| P0-2 | SCZ 顶横轴 SHT 置于固定 fix_x，顶滑块 SLT 在变化 sx | SHT 不穿过顶滑块 | SHT 改随 sx 移动，始终穿过两顶滑块；复审整条剪叉运动链/左右镜像耦合/平台约束 | L2b sht_slt 刚体相对位姿不变、slide_top 导路偏移~0 |
| P0-3 | 验证缺装配约束闭合检查，仅"2001步无穿透" | 无连接闭合/共线/接口/约束保持检查 | 新增 **L2b**：①连接位置一致②铰链轴线共线③销孔接口④滑块导路保持⑤刚体相对位姿不变⑥全行程闭合误差；并加 **CAD 孔轴审计**(BRepAdaptor 圆柱面) | 各方案 L2b_closure.json：闭合失败 0、孔缺失 0、销孔合格 |
| P1-1 | 源码相对路径错误，不可干净复现 | CAD_SOURCE 内 ROOT 多算一层 | common_r1.deliverable_root() 自动定位(支持 ROUND1_OUT 环境变量)；干净目录复现并比对哈希 | REPRODUCTION_REPORT.md |
| P1-2 | L1 含 4 个不在最新 BOM 的旧销 STL | F09/F07-PIN3-L20, SCZ-PIN3-L20/L26 残留于 L1 | 删除旧销文件；历史 JSON 归档至 VALIDATION/HISTORY/；L1 由当前 STL 重新生成 | L1 与 manifest/STL/3MF/BOM 完全一致 |
| P1-3 | 1:2 依据缺失；耗材口径不一(1059 vs 各方案和) | 无缩比论证；README/PR/BOM 数字口径混用 | SCALE_JUSTIFICATION.md 给出 1:2/1:3/1:5 对比与关节下限论证；统一以 MASTER 去重总量为准，明确**非真实切片** | SCALE_JUSTIFICATION.md / PRINT_PLAN 耗材口径节 |
| 附加 | F08 L 槽抬升/后移相位重叠致根销对角卡滞 | lift(0.20–0.40)与shift(0.28–0.45)重叠 | F08 相位改顺序：抬升0.20–0.40→后移0.40–0.55→后翻0.55–0.95 | L2b root_slot 路径偏移~0 |

## 机构零件变更明细
- **F09 COL**：移除臂叉耳/臂让位槽；bridge 榫孔/让位槽由 z117.5 移至 z132。
- **F09 BRG**：本体抬高至 z129.5–144.5(local)，新增中央臂叉耳(枢轴 16,0,137)+臂锁孔+全高中央让位槽；端榫 z132。
- **F07 COL**：保留柱顶臂叉耳（with_arm_clevis=True）。
- **SCZ kinematics**：SHT 位置 (fix_x→sx, hz+9)。
- **F08 kinematics**：shift/root 相位顺序化。
- 销轴表、BOM、3MF、装配指南、验证报告同步更新。

## 未变事项
- 缩比仍 1:2；纯 PLA/PETG、零新增采购目标；F12 不制造。
- 不做第二轮工程性能验证；不代替采购 Agent 下单。
- L4 试件仍待现场确认（无打印机权限）。
