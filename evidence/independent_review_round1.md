## 审查结论

**建议修改后再交付。** 当前结果确实是代码运行产生的，关键数值也能复算，未发现伪造蒙特卡洛结果或强行凑满三套方案。但 **F04 并没有真实槽轨机构证据，四目标优化中的误差与挠度目标也已退化**，因此现有证据只能支持抽象枢轴轨迹比较，不能支持真实机构的多目标工程推荐。

基线为 `9191ba9`，但整个 `simulation/` 当前未跟踪，无法通过普通 Git diff 与基线逐行比较。本次仅做只读审查，未修改文件。

## critical

### 1. F04 的“槽轨复合避让”未建模，入围证据实际只属于抽象平移枢轴

- `simulation/src/foldsim/mechanisms.py:40-43` 仅定义前 20% 行程同时抬升、平移，随后旋转。
- `simulation/src/foldsim/mechanisms.py:68-95` 的 `guided` 参数从未使用；`simulation/src/foldsim/mechanisms.py:216-219` 中 F04/F10 与根部翻折共用同一轨迹函数。
- 模型没有槽轨中心线、槽宽、滚轮/销轴、槽轨实体、导向约束或相应碰撞。`_phase` 形成的还是分段线性路径，并非报告所称的“参数化光顺路径”。
- 因此 `simulation/results/selection.json:107-115` 的 `passed_screen=true` 只证明“立柱经该平移和旋转后不碰底座/热床”，不能证明真实槽轨能实现该运动。
- `simulation/REPORT.md:77` 的“通过全部 L1 硬约束”和 `simulation/REPORT.md:82` 的“槽轨中心线为参数化光顺路径”超出了实际模型。

我复算了 F04 优化解 `lift=70, shift=20`：31 和 1001 姿态下相交面积均为 0，名义解在 1001 姿态下仍为失败。所以**数值不是伪造的，问题是所通过的模型不是所命名的槽轨机构**。在补齐槽轨几何、装配可达性和连续碰撞检查前，F04 不应作为真实槽轨方案推荐。

## high

### 2. 误差与挠度目标在优化变量变化时为常数，四目标优化名不副实

- `simulation/src/foldsim/optimize.py:22-35` 的 `error_surrogate` 只读取固定 `spec`，不包含任何优化变量。
- `simulation/src/foldsim/metrics.py:37-51` 和 `simulation/src/foldsim/metrics.py:88-107` 调用 `_effective_length_mm(spec)` 时没有合并 `parameters`，导致参数覆盖被忽略。
- 对 `optimization_raw.json` 的全部非空结果逐候选检查，误差目标和挠度目标各自都只有一个唯一值。F02 的 `arm_length=180` 与 `260` 甚至得到完全相同的四项目标及蒙特卡洛 P95。
- `simulation/scripts/select_recommendations.py:54-58` 选择时使用的是这个常数代理；真正的 20,000 次蒙特卡洛直到推荐产生后才在 `simulation/scripts/select_recommendations.py:101-109` 补算，不能回溯修正 Pareto 搜索。

这与 `simulation/REPORT.md:19` 所暗示的“收纳、重复定位、挠度、成本均被优化”不符。应让目标真实依赖设计变量，或删除常数目标并明确实际只优化了哪些量。

### 3. 非剪刀方案的“峰值驱动力”没有统一物理意义，却还参与约束

- `simulation/src/foldsim/metrics.py:52-56` 对全部非剪刀方案统一使用 `peak_torque / 50.0`，50 mm 驱动臂既不是配置参数，也没有实测或机构对应关系。
- 伸缩方案枢轴和质心水平位置重合，重力矩为零，于是 F05/F12 驱动力为 0；但其重力分别约为 **25.506 N、29.43 N**，竖直伸缩驱动不可能为零。
- 抽屉方案是水平移动，却同样从重力矩除以 50 mm 得到 0.9156 N，未表示导轨摩擦、加速或驱动传动。
- 该值还进入 `simulation/src/foldsim/optimize.py:37-51` 的 500 N 约束，并展示于 `simulation/REPORT.md:23-39`、`simulation/REPORT.md:69` 和 `simulation/REPORT.md:80`。

重力矩公式本身单位正确，但 F04/F07 的 81.2/84.6 N 只能称为“假定 50 mm 力臂的换算值”，不能作为执行器选型或跨机构比较证据。

### 4. F14 的组合运动和 F11 的联动同样没有完整实例化

- `simulation/src/foldsim/mechanisms.py:68-95` 中 `external_combo` 只在最后一个姿态添加柜体包络；没有“龙门预折后再收入外托架”的第二阶段运动。
- `simulation/src/foldsim/mechanisms.py:220-223` 调用该函数时没有 `double=True`，因此 F14 的“龙门”几何实际上仍是单根立柱。
- F11 的箱体联动也只生成 `case_envelope`，没有箱盖或联动件运动。
- 因而 `simulation/REPORT.md:35-38` 所示 F11/F14 名义通过，不能视为其完整机构已经通过碰撞和可达性筛选。

## medium

### 5. “轨迹无穿透”仅是离散姿态、部分对象对的检查

- `simulation/src/foldsim/evaluate.py:29-38` 只检查 `moving` 与 `fixed` 的相交；附件、线缆链、柜体等 `extra` 不参与碰撞，移动件之间也不检查。
- `simulation/src/foldsim/evaluate.py:41-58` 默认只取 31 个状态，`simulation/src/foldsim/evaluate.py:75-84` 用这些离散样本最大值判定整条轨迹。
- 加密到 1001 姿态后，所有名义方案的通过/失败状态虽未改变，但 F04 名义最大穿透从 **22.222 增至 22.825 mm²**，F09/F10 的最大穿透也明显增加，证明 31 点会漏掉真实极值。

建议将报告措辞限定为“所列对象在采样姿态下未穿透”，并使用连续扫掠或自适应细分证明最终解。

### 6. NSGA-II 遗漏了显式装配可达性约束

- 初筛在 `simulation/src/foldsim/evaluate.py:66-80` 检查 `reachable_fraction`。
- 但 `simulation/src/foldsim/optimize.py:17` 和 `simulation/src/foldsim/optimize.py:46-51` 的四项约束没有可达性；选择脚本 `simulation/scripts/select_recommendations.py:46-49` 也只过滤这四项约束，而不检查 `passed_screen`。
- 当前 SCZ 不可达解会因驱动力为 `inf` 被间接拒绝，所以未发现已入库的不可达推荐；但这是偶然替代约束，契约仍不完整。

### 7. 挠度/锁点刚度是机构无关的启发式，跨族排序依据有限

`simulation/src/foldsim/metrics.py:40-51` 对伸缩、剪刀、翻折等方案都使用同一个悬臂梁与锁点串联公式。伸缩重叠量不进入刚度，剪刀臂长、铰点布置和低位几何增益也不进入梁刚度。报告已在 `simulation/REPORT.md:18` 声明“降阶、未标定”，这是恰当的；但这些值仍参与权重排序，不能解释成不同机构真实刚度已被公平优化或验证。

## low

### 8. 报告称保存了“最小不可行解”，实际失败候选为空

`simulation/REPORT.md:46` 称 `optimization_raw.json` 保存“末代非支配/最小不可行解”。但 `simulation/src/foldsim/optimize.py:72-81` 在 `result.X is None` 时直接产生空列表，例如 `simulation/results/optimization_raw.json:3-9` 的 F02 没有任何最小不可行设计或约束详情。应保存最小违反度解，或修正报告表述。

## F04 与选择逻辑的正面核对

- F04 名义失败、优化后抽象几何通过：**数值上成立**，但不构成真实槽轨证据，见 critical 1。
- 100 次权重扰动的前三确实均为 F04、F07、F08。
- F07/F08 同属 `root`，去重后选 F07，再选不同族的 F04，最终两套；没有为凑第三套降低 80% 阈值。
- F04/F07 的收纳比、挠度和 20,000 次最终蒙特卡洛结果均可精确复算。
- 报告明确声明“不是实机验证”、2.5D 包络、未标定刚度和无恢复打印数据，没有把 P95/P99 直接承诺为量产打印精度。

## 已执行验证

- `bash uv_run.sh -m unittest discover -s tests -v`：**15/15 通过**，包含一个 6 个体、2 代的微型 NSGA-II 冒烟测试；未运行完整 32×20 优化。
- 对全部名义方案和 `candidate_front` 做了 1001 姿态轻量复算：通过状态未改变，F04/F07 优化解仍为零相交。
- 独立复算 F02 参数覆盖、F05/F12/F13 驱动力、100 次权重频率和推荐方案最终指标，结果如上。
- `git diff --name-only 9191ba9 -- external` 与当前工作树 `external/` diff 均为空，**未发现 `external/` 被修改**。
- 未重新导出或测量 STEP，未运行三维 FEA、完整三维装配碰撞或任何实机测试；这些仍属无法验证事项。

---

## 复核后的处置记录（主代理）

- critical 1：已实例化槽轨中心线、槽宽、滚轮、导向间隙及槽轨—热床碰撞；F04 在修正模型下无可行优化解，不再推荐。
- high 2：误差代理与刚度已合并设计变量；臂长、伸缩重叠和槽宽会实际改变误差/挠度。
- high 3：驱动力改为按机构分族模型，报告增加口径说明，禁止用于执行器选型。
- high 4：F11 加入运动箱盖与自碰撞；F14 改为双柱、预折后第二阶段翻转。
- medium 5：名义初筛改为 201 姿态，推荐解用 1001 姿态复验；附件/柜体仍只作包络，不作为穿透证据。
- medium 6：优化新增装配可达性约束，选择阶段同时要求 `passed_screen`。
- medium 7：承认跨机构刚度仍是启发式；报告明确其证据强度低于几何与误差结果，不作为实机刚度证明。
- low 8：优化结果保存末代最小不可行参数、约束违反度和最大/最小违反度。

修正后 22 项测试通过，推荐变为 F07/F12，均通过 1001 姿态复验；第二轮独立复核因外部模型周配额中断，未把它当作已完成的复核证据。
