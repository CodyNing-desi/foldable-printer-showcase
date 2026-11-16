# ROUND1_DEMO_CAD — 可折叠3D打印机 第一轮缩比机械原理演示模型

版本 **R1-V6** · 2026-11-15 · 连杆几何 1:2（V3.2.1 冻结参数 ×0.5）· 单位 mm

## 来源与版本
- 参数基准: GitHub CodyNing-desi/foldable-3d-printer **PR#1 (sync/v2-to-v3_2_1 @ 6229d60)**，
  `simulation_v3_2_1/config/candidates_v3_2_1.json` + `scripts/run_v3_2_1_verification.py` 冻结值。
  main 不是最新；旧 stageB 交付包为外购五金夹具体系，本轮已重建为纯打印可活动机构。
- 候选: M1 F09_L82 / M2 F07 / M3 SCZ / M4 F08_OPTIONAL（F12 No-Go 不制造）。
- V6 回应独立审查 P0-1/P0-2/P0-3/P1-1/P1-2/P1-3，逐项见 **CHANGELOG_V5_V6.md**。

## 目录
- `F09_L82/ F07/ SCZ/ F08_OPTIONAL/`: 各含 CAD_SOURCE(自包含参数化 build123d 源) / STEP(逐件+装配) /
  STL(逐件打印) / 3MF(排版工程, 无切片参数) / ASSEMBLY(姿态图+动画+运动简图+装配STL) /
  VALIDATION(L1/L2/L2b/L3 JSON+清单, HISTORY/ 归档旧版) / BOM.csv。
- `COUPONS_L4/`: 接口试件 STL + TEST_PLAN.md（待现场确认）。
- 根级: MASTER_PARTS_BOM.csv / MOTION_VALIDATION_REPORT.md / PRINT_PLAN_5_MACHINES.md /
  ASSEMBLY_GUIDE.md / MODEL_LIMITATIONS.md / SCALE_JUSTIFICATION.md / CHANGELOG_V5_V6.md /
  PURCHASE_INTERFACE.md / REPRODUCTION_REPORT.md / SHA256SUMS.txt。

## 再生成（CAD_SOURCE 自包含，可在干净目录运行）
项目 venv (Python 3.12 + build123d 0.13 + cadquery-ocp-novtk + trimesh + manifold3d + networkx)：
```
python build_all.py            # 逐件 STL/STEP + 装配
python validate_r1.py          # L1/L2/L2b(装配闭合+孔轴审计)/L3
python render_r1.py --gif      # 快照/动画
python joint_diagrams.py       # 运动简图
python build_coupons.py        # L4 试件
python make_3mf.py             # 3MF 排版
python make_docs.py            # BOM/文档
python package.py              # 归档历史 + SHA256 + ZIP
```
输出目录由 common_r1.deliverable_root() 自动定位（或设环境变量 ROUND1_OUT）。复现核查见 REPRODUCTION_REPORT.md。

## 耗材（CAD 估算，非真实切片）
- 实际打印总量（MASTER 去重）≈ **1059 g**；含 20% 余量 ≈ 1271 g。备料以 MASTER_PARTS_BOM.csv 为准。
- 各方案 BOM 求和含共享件重复计；口径统一见 PRINT_PLAN / SCALE_JUSTIFICATION。机时按 15–25 g/h 估算。

## 关键声明（详见 MODEL_LIMITATIONS.md）
- 纯 PLA/PETG 打印机构，零新增采购目标；可活动，非静态姿态轮廓。
- F09 中央 X 臂物理铰接于中横梁中央叉耳（V6 修复）；双柱同步为刚性杆被动耦合，不验证原双丝杆+同步带传动。
- SCZ 为经典固定端+滑动端剪叉（1 DOF 可证），顶横轴随顶滑块移动（V6 修复）；与仿真对称丝杆驱动差异已声明。
- 验证: L1 水密/单实体；L2 密集采样+凸包保守检查（非连续碰撞认证）；**L2b 装配约束闭合+CAD 孔轴审计**；
  L4 无打印机权限，待现场确认。"2001 步无穿透"不单独作为可装配判据。
