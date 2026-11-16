# 第三轮验收记录 · 三维展示质量修复（2026-11-17）

范围：只修 3D 展示质量与取景，不重构网站架构。真实 CAD 几何、运动轨道、工程事实与证据链保持不变。

## 修复的根因（均经实测定位）

| # | 根因 | 证据 | 修复 |
|---|---|---|---|
| 1 | 四元数序误读：trimesh 输出 (w,x,y,z)，按 (x,y,z,w) 解析 → 单位四元数变 180° 翻转 | 包围盒 z 出现 -164；模型倒置/取景错乱 | `scripts/export_cad.py` 导出时转 three 原生序并重新转换全部 GLB/轨道 |
| 2 | `useGLTF` 缓存共享同一 Object3D，`<primitive>` 挂载抢占父节点 → 最后挂载的 Ch7 独占模型，首页/候选页空画布 | 绘图缓冲回读：hero/ch2 opaqueFrac≈0.001，ch7=0.221 | 每实例 `gltf.scene.clone(true)` |
| 3 | Z-up CAD 世界 vs three 默认 Y-up；ACES 色调映射把零件配色压灰 | 主色分布 (221,220,218) 中性灰 | 全部 Canvas `camera.up=(0,0,1)` + `flat`；零件按功能分组配色 + Edges 轮廓 |
| 4 | 固定猜测相机距离 + 单姿态取景 → 姿态变化/爆炸后超出视口 | 缓冲度量 touch=3~4、span=1.0 | 平滑跟随取景：当前爆炸进度下整条轨道包围盒并集 + 投影半径精确拟合 + 阻尼趋近（拖拽时不干预） |
| 5 | 上下文泄漏与离屏全时渲染（第二轮诊断遗留） | 上下文创建数远超画布数、Chrome 杀旧上下文 | `webglAvailable()` 单例+立即 loseContext；离屏 `frameloop='demand'`；ctrl 独立 Context 避免全应用 60fps 重渲染 |
| 6 | F04/F12 过度放大裁切 | 缓冲度量 bh=1.0、touch≥2 | 整体视角改用运动包络盒；新增"整体/特写"镜头切换，特写才裁切 |

## 视觉验收（不以 E2E 全绿代替）

方法：`e2e/visual3d.mjs` 以 `?pdb` 开启 preserveDrawingBuffer，**直接回读 WebGL 绘图缓冲**统计模型像素覆盖率(cov)、包围盒跨度(bw×bh)、贴边数(touch)；判定规则见 `e2e/accept3d.py`（普通/爆炸/特写三类阈值）。截图同时留存供人工复核。

- **1920×1080：28/28 状态 PASS**
- **1366×768：28/28 状态 PASS**
- 状态覆盖：首页 展开/中/折叠；候选页 s0/v321；F09/F07/SCZ/F08 各 展开/运动中/完全折叠；F09 爆炸 50%/100%、零件隔离、X 光、关节特写；F04 before/after/why 整体 + why 特写；F12 整体 + 导向间隙特写(晃动)。
- 上下文：验收 tour 中场景上下文丢失 0（lost=1 为探测上下文主动释放）；生产模式复测见下。
- `bun run test:e2e`：**35/35 通过**；字号层级 body 20 / lede 25 / question 52 / 控件 16–17 保持达标。

## 交付截图

- 第二轮（修复前对照）：`docs/screenshots/round2/`
- 第三轮 1920×1080（含 UI）：`docs/screenshots/round3/`
- 第三轮 1366×768（含 UI）：`docs/screenshots/round3-1366/`
- 第一轮深色版：`docs/screenshots/before/`
- 交互录屏：`docs/media/interaction-tour.webm`

## 复现命令

```bash
bun run build
bun run test:e2e                      # 35 项功能断言
bun run test:visual3d                 # 1920：28 状态缓冲度量 + 截图
VP=1366 VPH=768 OUTDIR=shots3d-1366 bun run test:visual3d
python e2e/accept3d.py                # 判定两分辨率全部状态
HIDE=0 OUTDIR=shots-ui bun run test:visual3d     # 带 UI 交付截图
node e2e/probe.mjs                    # 上下文/帧率/长任务稳定性探针
```

## 仍受素材限制（不宣称解决）

- F04/F12 无零件级 CAD：仍为**标注清楚的参数化原理示意**；干涉/晃动为 documented 口径示意，非真实三维碰撞/卡滞/公差实验。
- 销/卡圈紧固件不进入运行时网格（与原渲染器口径一致）。
- 软件 WebGL（无 GPU）帧率低于独显；headless 探针帧率为最坏情况参考。
- 实物状态不变：打印任务已执行完毕；PETG 缺件，齐套/装配/实测未完成。
