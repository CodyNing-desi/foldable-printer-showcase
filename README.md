# 可折叠3D打印机 · 方案筛选全过程交互式展示网站

课程阶段汇报用单页叙事网站：**从 15 种候选机构，到多轮模型审查，再到三条差异化实物验证路线。**

在线演示（GitHub Pages）：<https://codyning-desi.github.io/foldable-printer-showcase/>

数据与素材来源（均为本团队仓库真实文件，已随本网站本地打包，可离线演示）：

- 仿真数据：[`CodyNing-desi/foldable-3d-printer`](https://github.com/CodyNing-desi/foldable-3d-printer) 分支 `sync/v2-to-v3_2_1`（HEAD 6229d60）
- CAD 与运动素材：同仓库分支 `round1-demo-cad` @ `d35cbd1eacfa9908aef302b009610c5dbc03d15a`（R1-V6）

## 快速开始

```bash
bun install        # 或 npm install
bun run dev        # 开发：http://localhost:5173
bun run build      # 类型检查 + 生产构建 → dist/
bun run preview    # 本地演示构建版：http://localhost:4173（无需外网）
```

课堂投影：`bun run preview` 后打开 `http://localhost:4173`，点首页"▶ 自动演示（约 99 秒）"。
`dist/` 为纯静态文件，也可用任意静态服务器托管（如在 dist 目录内 `python -m http.server`）。

## 测试

```bash
bun run test:e2e   # Playwright 端到端验收（34 项断言，含离线阻断外部请求）
node e2e/layout.mjs  # 布局几何审计（1920×1080 / 1366×768）
```

e2e 默认使用本机 Playwright 缓存的 chromium；可用环境变量 `CHROME_PATH` 指定任意 Chromium 可执行文件。
未安装浏览器时先执行 `bunx playwright install chromium`。

## 页面结构（8 章）

1. **问题提出**：真实 CAD 展开/收纳对比滑块 + 自动演示入口
2. **15 种候选**：滚动驱动 7 阶段状态叙事 + 阶段标签手动切换 + 最终名单重组动画 + 候选详情抽屉
3. **统一筛选**：15×6 指标矩阵（悬停显示数值/单位/判据/来源）+ 名义/优化双视图 + V3.2.1 正弦采样反例交互
4. **F04 逆转**：Before/After 模型对比滑块（标注"根据审查记录绘制"）+ 证据时间线
5. **F12 逆转**：仿真 vs 制造条件左右对比 + 决策转移动画
6. **最终决策**：权重扰动表、F08/SCZ 证据增益对比、定性决策矩阵（明确非定量）、V3.2.1 五状态板
7. **机构运动**：F09/F07/SCZ/F08 真实 GIF 帧播放器（播放/暂停/重播/逐帧拖动/关键帧/相位标签）
8. **走向实物**：项目流程（已完成/进行中/待执行）、V5→V6 修复、证据索引

两种使用模式共用同一数据源（`src/data/`）：

- **模式 A 自动演示**：99 秒、15 段，可暂停/上一段/下一段/退出；演示中点击候选自动暂停并打开详情。
- **模式 B 证据探索**：任意候选卡 → 详情抽屉（状态时间线、版本化指标、原因、证据文件）；证据模态可离线阅读原文。

## 数据真实性约定

- 跨版本指标（收纳比、挠度等）一律带版本标签，只在同一阶段内横向比较；冻结比较基准为 V3.2.1。
- F09 按"引入—修改—复评"呈现（V1 失败 → V2 通过 → V3.2 被 0.800 门槛拦截 → lift=82 入围）。
- F12 的 No-Go 标注为工程决策（仿真仍 PASS）。
- 15 候选示意图为标注清楚的二维原理图；F04 对比图标注"根据审查记录绘制，不是真实 CAD"。
- R1-V6 为 1:2 缩比原理演示：F09 刚性同步杆、SCZ 手动剪叉等简化逐方案声明；不宣称完成电机驱动/载荷/回差/寿命验证。
- 遵守 `prefers-reduced-motion`；状态编码颜色+文字双通道。
- 详细事实核查与版本冲突处理见 [`docs/FACT_CHECK.md`](docs/FACT_CHECK.md)。

## 目录

```
src/data/        候选、阶段、证据、运动相位、分析数据（全部来自仓库真实文件）
src/chapters/    8 个章节组件
src/components/  导航、卡片、抽屉、证据模态、自动演示控制条等
public/assets/   4×48 帧 WebP + 关键帧 PNG + GIF + 运动简图（R1-V6 真实素材）
public/evidence/ 22 份证据文档本地副本（仿真分支 + CAD 分支）
e2e/             Playwright 验收与布局审计脚本
docs/            事实核查说明 + 验收截图（1920×1080 / 1366×768）
```

## 验收结果

- `bun run build`：tsc + vite 成功，无错误
- Playwright e2e：**34/34 通过**（首页/15卡/F04对比/F12解释/三方案动画/自动演示启停退出/证据模态/1366无横向溢出/控制台无阻断错误/离线）
- 布局审计：1920×1080 与 1366×768 逐章无横向溢出，sticky 候选网格整屏可见
- 截图见 [`docs/screenshots/`](docs/screenshots/)

## 已知限制

- GIF 为单向展开→折叠 48 帧真实渲染；播放器逐帧播放，不做连续参数化插值。
- 证据模态以纯文本展示 Markdown/JSON 原文（离线可读，不做富渲染）。
- L4 打印状态按团队当前口径标为"排产/执行中"；仓库 R1-V6 文档原文为"待现场确认"，装配/测试结果待回填。
- 自动演示段落时长在 `src/autoplay.ts` 可调（当前总计 99 秒）。

## 参考案例

交互设计参考（未照抄配色/排版/文案）：

- [Bartosz Ciechanowski — Gears](https://ciechanow.ski/gears/)：机械运动的播放/暂停/时间滑块与路径标注
- [The Pudding — Women's Pockets](https://pudding.cool/2018/08/pockets/)：滚动驱动的同一组对象状态变化与重组
- [Distill — Communicating with Interactive Articles](https://distill.pub/2020/communicating-with-interactive-articles/)：details-on-demand 证据面板与可操作示例
