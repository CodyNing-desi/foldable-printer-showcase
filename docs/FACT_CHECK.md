# 事实核查说明（网站数据底稿）

核查日期：2026-11-16
数据来源：本地仓库副本 `foldable-printer-round1-demo-work/repo`
- 仿真分支 `sync/v2-to-v3_2_1`（HEAD 6229d60，与 PR#1 一致）
- CAD 分支 `round1-demo-cad`（HEAD d35cbd1eacfa9908aef302b009610c5dbc03d15a，R1-V6，与任务基准提交一致）

## 真实时间线（网站阶段模型）

| 阶段 | 版本/文件 | 关键事实 |
|---|---|---|
| S0 候选定义 | simulation/config/candidates.json（seed 20261113） | F01–F14 + SCZ 共 15 套；统一硬约束：无穿透、可达、工作空间、系统收纳比 ≤0.800 |
| S1 V1 初筛+优化（返工前） | PROCESS_REVIEW.md §2；independent_review_round1.md | 31 姿态；名义通过 F07/F08/F11/F12/F14/SCZ；初始权重推荐 **F07+F04**（F04 名义失败但抽象优化解通过） |
| S2 V1 独立审查+返工 | independent_review_round1.md；PROCESS_REVIEW.md §3–4 | F04 补全槽轨后名义穿透 **45.338 mm²**、优化无可行解，推荐撤回；F11/F14 补全联动后名义失败；返工后名义通过 F07/F08/F12/SCZ；推荐 **F07+F12**；SCZ 探索第三项、F08 工程备选（THIRD_OPTION_DECISION.md） |
| S3 V2 三维筛选 | simulation_v2/results/screening_v2.json（L2_3D_OBB_SAT） | 通过：F07(0.659)/F08(0.791)/**F09(0.784, lift=140)**/SCZ(0.495)；F12 失败(0.856)；F04 槽轨-热床穿透 46 mm |
| S4 V3 扫掠+附件 | simulation_v3/results/screening_v3.json | 通过：F05/F08/**F09(0.529, lift=110)**/F12(优化预紧侧置版 0.735)/F13/SCZ；**F07 含附件 0.910 失败**（后重新优化） |
| S5 V3.1 实物决选 | simulation_v3_1/DECISION.md；simulation_v3_1_final/FINAL_DECISION.md | F09/F07/SCZ Conditional Go，F08 Backup；**F12/F04 No-Go**（F12 六周精密套筒风险；F04 全域 0/238 可行） |
| S6 V3.2 验收纠错 | simulation_v3_2/LINEUP_DECISION.md；FINAL_REPORT_V3_2_1.md §2 | 发现离散采样推断连续上界的漏洞（正弦反例 x=50sin2πt 在 t=0.25 穿透 2 mm 被误判 PASS）；F09(lift=85) 收纳比 0.802>0.800 未过整体筛选 |
| S7 V3.2.1 冻结名单 | simulation_v3_2_1/LINEUP_DECISION_V3_2_1.md + verification_summary.json | **F09_L82**(lift=82, 0.786, Y挠度0.1252) Conditional Go；**F07**(lift=75, 0.751, Y挠度0.8166, 净距0.021) Conditional Go；**SCZ**(arm=154, 0.503) Bench-only；**F08**(0.616, 最长边897) Fallback；**F12**(0.735, 仿真PASS) No-Go |
| S8 R1-V5→V6 CAD | ROUND1_DEMO_CAD/CHANGELOG_V5_V6.md（d35cbd1） | V5 独立审查 P0-1/P0-2/P0-3；V6 修复 F09 中央X臂铰接于中横梁BRG、SCZ 顶横轴随顶滑块、新增 L2b 装配约束闭合+孔轴审计；F08 L槽相位顺序化 |
| S9 实物打印 | PRINT_PLAN_5_MACHINES.md；COUPONS_L4/TEST_PLAN.md | L4 试件与正式零件已生成并进入打印排产/执行（团队当前状态）；仓库 R1-V6 文档口径为"待现场确认"；装配/测试结果待回填 |

## 版本冲突与处理（重要）

1. **screening_summary.json 是返工后的 V1 结果**（F04=45.338 mm²、F11/F14 失败）。返工前的名义通过名单与 F07+F04 推荐只存在于 PROCESS_REVIEW.md 与独立审查记录。网站把"V1 初筛（返工前）"与"V1 审查修正"分为两个阶段，不混用。
2. **F09 不是早期入围者**：V1 失败（穿透 848.292 mm²、收纳比 1.187）→ V2 起通过 → V3.2 因 0.802 超门槛被拦 → V3.2.1 改 lift=82 后入围。网站按"引入—修改—复评"呈现。
3. **F07 在 V3 一度失败**（含附件收纳比 0.910），V3.1 起以 lift=75 重新优化后通过。不能画成单向淘汰。
4. **F12 的 No-Go 是工程决策**：V1 曾被推荐（0.7998 边界）、V3.2.1 仿真仍 PASS（0.735、Y挠度 0.0612 最优），因六周精密三级伸缩导轨晃动（0.203–0.229 mm）与卡滞风险被停止。
5. **收纳比/挠度跨版本不可直接排序**：F07 收纳比在 V1 名义 0.672 / V1 优化 0.4927 / V2 0.659 / V3 0.910 / V3.1 0.783（DECISION）与 0.689（FINAL_DECISION，附件口径不同）/ V3.2.1 0.751 各不相同。网站仅在同一阶段内横向比较，跨阶段数值一律带版本标签。V3.1 DECISION 与 FINAL_DECISION 的 F09/F07 数值差异（0.445 vs 0.740；0.783 vs 0.689）源于附件包络口径修订，网站以 V3.2.1 为冻结比较基准并注明。
6. **SCZ 最小净距**：V3.2 报 0.006 mm，V3.2.1 认证值 0.010 mm；采用 V3.2.1 并保留风险注记。
7. **R1-V6 是 1:2 缩比原理演示**：F09 用刚性 SYNC 杆替代双丝杆+同步带；SCZ 为手动固定端+滑动端剪叉（与仿真对称丝杆驱动不同）；L2 为 2001 步密集采样+凸包保守检查，非连续碰撞认证；L4 无打印机权限记录为待现场确认。网站不得宣称完成电机驱动/载荷/回差/寿命验证。
8. **GIF 运动素材**：48 帧、640×500、120 ms/帧，t=i/47 单向展开→折叠（render_r1.py）。相位映射来自 CAD_SOURCE/kinematics_r1.py：F09/F07 臂折[0,0.20]、抬升[0.20,0.40]、根翻[0.45,0.95]、保持[0.95,1]；F08 抬升[0.20,0.40]、后移[0.40,0.55]、后翻[0.55,0.95]；SCZ 工具头停靠[0,0.15]、H 135→22.5 线性[0.15,1]。关键帧 view_open/armfold/lifted/midfold/folded 对应 t=0/0.20/0.42/0.70/1.0。

## 素材清单（本地打包）

- 4× motion.gif、4×5 view_*.png、4× joint_schematic.png、4× contact_sheet.png（round1-demo-cad @ d35cbd1）
- 48×4 帧 WebP（由 motion.gif 无损时序提取，用于可拖动播放）
- 证据文档本地副本：PROCESS_REVIEW / independent_review_round1 / screening_summary / selection / screening_v2 / screening_v3 / DECISION / FINAL_DECISION / LINEUP_DECISION / LINEUP_DECISION_V3_2_1 / FINAL_REPORT_V3_2_1 / v3_2_1_verification_summary / THIRD_OPTION_DECISION / CURRENT_DECISION / CAD README / MOTION_VALIDATION_REPORT / MODEL_LIMITATIONS / CHANGELOG_V5_V6 / PRINT_PLAN_5_MACHINES
