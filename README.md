# 可折叠3D打印机 · 方案筛选全过程交互式展示

**让机械自己解释机械。** 真实 R1-V6 CAD 装配在浏览器里连续折叠、分阶段爆炸、零件隔离；
15 种候选的筛选与两次关键逆转（F04 建模不成立 / F12 工程 No-Go）围绕机械画面展开，而不是围绕文字卡片。

- 在线演示：<https://codyning-desi.github.io/foldable-printer-showcase/>
- 仓库：<https://github.com/CodyNing-desi/foldable-printer-showcase>
- 回滚点：`git checkout v1-dashboard`（第一轮版本）

数据与素材来源（全部本地打包，可离线演示）：
[`CodyNing-desi/foldable-3d-printer`](https://github.com/CodyNing-desi/foldable-3d-printer)
分支 `sync/v2-to-v3_2_1`（仿真冻结数据）+ `round1-demo-cad` @ `d35cbd1`（R1-V6 CAD/运动学）。

## 快速开始

```bash
bun install          # 或 npm install（云盘目录 npm 可能 EBADF，推荐 bun；镜像可用 --registry https://registry.npmmirror.com）
bun run dev          # 开发 http://localhost:5173
bun run build        # tsc + vite → dist/
bun run preview      # 课堂演示 http://localhost:4173（纯本地，无需外网）
```

`dist/` 为纯静态文件，任意静态服务器可托管（含 GLB/轨道/证据文档/渲染帧）。

## 测试与验收

```bash
bunx playwright install chromium   # 首次（npm 用户：npx playwright install chromium）
bun run test:e2e                   # 35 项端到端断言（真实 WebGL，离线阻断外部请求）
bun run test:visual                # 重叠审计 + 动画状态截图 + 交互录屏（docs/media/）
bun run test:visual3d              # 3D 视觉验收：28 状态×2 分辨率，读绘图缓冲判定模型可见/完整/不裁切
bun run test                       # e2e + 布局审计
```

浏览器解析（`e2e/browser.mjs`，无个人绝对路径）：Playwright 自带浏览器 → `CHROME_PATH` 环境变量 → 本机 Playwright 缓存。
headless 环境自动启用 SwiftShader 软件 WebGL。

3D 视觉验收（`e2e/visual3d.mjs`）以 `?pdb` 开启 preserveDrawingBuffer，直接回读 WebGL 绘图缓冲统计模型像素覆盖率/包围盒/贴边数，**不以 canvas 存在或 E2E 全绿代替视觉验收**；生产 URL 不带该参数、无额外开销。环境变量 `VP/VPH/OUTDIR/HIDE` 控制分辨率与输出。

验收记录与旧版"卡片重叠"判定见 [`docs/ACCEPTANCE.md`](docs/ACCEPTANCE.md)；
Before/After 截图见 `docs/screenshots/before|after/`。

## 这一轮删掉了什么

- 深色仪表盘范式：多列小卡片、12px 小字堆叠、彩色 Badge 泛滥 → 亮色工程图册大画布，正文 20px / 关键说明 24px+ / 控件 16px+。
- 8 张淘汰证据卡画廊、阶段摘要密集面板、双栏相位卡、CSS 假放大镜、决策板卡片堆、制造问题密集面板 → 全部删除或降为"查看证据"展开层。
- 每章只留：**一个核心问题 → 一个主要机械画面 → 一个可观察变化 → 一个明确结论**。

## 真正改进的机构展示

- **Ch7 机构解释器**：逐件 STL→GLB（零件树保留），运动由原仓库 `validate_r1.placements()` 权威运动学采样驱动（161 步轨道，浏览器仅插值）。
  自由旋转 + 5 相机预设、零件点选/隔离/X 光、按真实装配关系的分阶段爆炸、运动轨迹线、关节标注、相位目的/风险字幕。WebGL 失败自动回退原始 CAD 帧。
- **Ch4 F04**：参数化 3D 原理示意（标注），Before/After/Why Failed 三态 + 干涉高亮 + 镜头推近。
- **Ch5 F12**：三级套筒伸缩 + 晃动夸大示意（×20，标注）+ SIM PASS / ENG NO-GO 双印章。
- **Ch1/Ch2**：首页与筛选阶段都以真实 F09/F07 装配为主体，15 候选降为索引条。

转换脚本与运动映射：[`scripts/export_cad.py`](scripts/export_cad.py) · [`docs/MOTION_MAPPING.md`](docs/MOTION_MAPPING.md)。

## 页面结构（8 章）

01 问题（可折叠 F09 主体）· 02 候选与筛选（7 阶段 scrolly + 15 索引）· 03 统一标准（采样反例交互 + 矩阵展开层）
04 F04 逆转 · 05 F12 逆转 · 06 最终决策（四路线 + 证据展开）· 07 机构解释器 · 08 走向实物（时间线 + PETG 问题 + 边界）

自动演示约 98 秒，围绕视觉变化编排（折叠/爆炸/隔离/晃动/阶段切换），可暂停/跳段/退出。

## 真实性约束

- 不虚构 CAD、测试成绩或制造验证。F04/F12 无零件级 CAD → 明确标注的参数化原理示意。
- 缩比 1:2 原理演示边界在决策/动画/实物三处重复声明：F09 刚性同步杆 ≠ 原同步传动性能；SCZ 手动剪叉 ≠ 丝杆推力验证。
- 实物状态：打印任务已执行完毕；PETG 缺件，齐套/装配/实测未完成；缺口数字待回填，不编造。
- 跨版本指标带版本标签，冻结比较基准 V3.2.1；事实核查见 `docs/FACT_CHECK.md`。

## 参考作品（研究演示与源码后选择性实现，未拼接源码）

| 项目 | 采纳 |
|---|---|
| [Glassbox CycleClear](https://github.com/bdeeps/cycleclear) | 一章一机械主体的 3D 科普叙事、自托管离线 |
| [Nicky Case — Evolution of Trust](https://github.com/ncase/trust) | 叙事节拍驱动交互状态、文字退居旁白 |
| [React Three Fiber](https://github.com/pmndrs/react-three-fiber) | 声明式 three.js 场景与组件化 3D |
| [Scrollama](https://github.com/russellsamora/scrollama) | offset 0.5 的滚动步骤进入/退出驱动状态 |
| [CADScope](https://github.com/erikbuild/CADScope) | GLB 零件树、隔离/高亮、相机预设、亮色主题 |
| [Exploded Lens](https://github.com/wonjyou/exploded-lens) | 滚动/进度控制逐部件时间窗爆炸、按结构设计分解方向 |
| [CAD Power Animations](https://github.com/GordenSun/cad-power-animations) | 参数→零件变换的 sidecar 驱动模式（本项目用权威运动学采样轨道实现） |

许可证：本项目代码 MIT 风格自用；参考项目均 MIT/CC，未复制其源码或模型。
第三方 CAD 素材来自团队自有仓库（R1-V6），无外部模型授权问题。

## 已知限制

- F04/F12 为原理示意（无 CAD 零件）；干涉/晃动为 documented 口径示意，非真实三维实验。
- 销/卡圈紧固件不进入运行时网格（与原渲染器口径一致）。
- 软件 WebGL（无 GPU 环境）帧率较低但可演示；真实 GPU 浏览器流畅。
- 自动演示时长在 `src/autoplay.ts` 可调。
