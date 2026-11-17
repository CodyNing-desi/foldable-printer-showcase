# 运动映射说明（真实 CAD → 浏览器 3D）

## 数据源（权威，不重写运动学）

源仓库 `CodyNing-desi/foldable-3d-printer` 分支 `round1-demo-cad` @ `d35cbd1eacfa9908aef302b009610c5dbc03d15a`（R1-V6）：

- `ROUND1_DEMO_CAD/<方案>/STL/*.stl` —— 逐件局部坐标网格（build123d BREP  tessellation）
- `ROUND1_DEMO_CAD/<方案>/CAD_SOURCE/validate_r1.py` —— `placements(cand, t)`：零件实例 → (世界平移, 旋转矩阵)
- `.../kinematics_r1.py` —— 相位定义与正运动学（臂折/抬升/根翻/剪叉/L 槽）
- `.../joints_r1.py` —— 运动副基准（零件局部坐标，与 CAD 孔心一致）

## 转换管线（scripts/export_cad.py）

运行环境：源仓库工作 venv（Python 3.12 + trimesh + numpy）。

```bash
<venv>/python scripts/export_cad.py \
  --cad-root <源仓库>/ROUND1_DEMO_CAD --out public/models
```

对每个方案：
1. `import` 该方案 CAD_SOURCE 的 `validate_r1` / `joints_r1`（逐方案隔离模块缓存）。
2. `load_parts()` 加载结构件（与原渲染器口径一致；销/卡圈为紧固件，不进入运行时网格，规格见 BOM）。
3. 逐实例命名节点导出 `assembly.glb`（几何保持局部坐标）。
4. 对 `placements(cand, t)` 在 t∈[0,1] 密集采样 **161 步**，记录每实例位置 + 四元数（**three.js 原生 x,y,z,w 序**；trimesh 原始输出为 w,x,y,z，导出时已转换）→ `tracks.json`。
5. 导出 `joints.json`（运动副基准）、`manifest.json`（实例/基础件清单、包围盒）、`keyposes.json`（t=0/0.2/0.42/0.7/1.0 真值）。

**浏览器端只做插值**（位置线性 + 四元数 slerp），不实现任何独立运动学逻辑，因此连续运动与原 CAD 姿态按构造对齐。

## 转换一致性（conversion_report.json）

| 方案 | 实例数 | 基础件数 | GLB | 运动副 |
|---|---:|---:|---:|---:|
| F09_L82 | 12 | 9 | 307 KB | 14 |
| F07 | 6 | 6 | 270 KB | 5 |
| SCZ | 15 | 9 | 256 KB | 21 |
| F08_OPTIONAL | 5 | 5 | 84 KB | 4 |

实例名与 `placements()` 输出键一一对应（TWR_0/1、CAR_0/1、COL_0/1、XBAR、BRG、SYNC、ARM、BASE、BED 等）；
SCZ 的 BED 不在 `scz_placements()` 中，按单位变换放置（与原装配语义一致）。

## 第三轮修复的关键映射/渲染问题（已解决）

1. **四元数序**：trimesh `quaternion_from_matrix` 输出 (w,x,y,z)，three.js 需要 (x,y,z,w)。导出脚本已转换；此前误读导致单位四元数变成 180° 翻转、包围盒 z 出现 -164。
2. **共享 scene 抢占**：`useGLTF` 缓存返回同一 Object3D，`<primitive>` 挂载会把它从先挂载的父节点摘走（最后挂载的 Ch7 独占模型，首页/候选页空画布）。现每实例 `gltf.scene.clone(true)`。
3. **轴向**：CAD 世界为 Z-up；所有 Canvas `camera.up=(0,0,1)` + `flat`（无色调映射），保证零件配色不被 ACES 压灰。
4. **自动取景**：目标盒 = 当前爆炸进度下整条运动轨道（12 采样）的包围盒并集（姿态不变）；隔离=当前姿态盒；关节特写=当前运动副基准盒。相机以阻尼系数 0.12 平滑趋近目标（用户 OrbitControls 拖拽期间不干预），切换方案/预设时立即吸附。播放/scrub 不引起镜头抖动，任何姿态完整可见。
5. **上下文泄漏**：`webglAvailable()` 单例缓存并立即 `loseContext()` 释放探测上下文；离屏场景 `frameloop='demand'`。

## 版本回放（点版本号 = 看该版本的建模参数与折叠过程）

`scripts/export_cad.py` 内置 `VERSIONS` 表：每个方案在各仿真版本（V1 名义 / V2 三维 / V3 附件 / V3.2 验收 / V3.2.1 冻结）的**真实配置**（抬升高度、是否臂先折、剪叉半臂长与收纳高、后移量），以及该版本结果文件里的收纳比与通过与否。

导出时对权威运动学做**常数级 patch**（`K.LIFT` / `K.SCZ` / 相位包装），不重写运动学逻辑，逐版本采样 161 步生成 `tracks_<版本>.json` + `versions.json`。浏览器点版本即加载对应轨道并自动播放折叠；剪叉臂长按版本比例缩放臂零件（孔位随局部 X 缩放）。

界面明示：**零件几何为 R1-V6 缩比模型；运动按该版本仿真配置回放（示意回放），碰撞结论以该版本仿真结果为准**——不把回放冒充该版本的原始 CAD 或碰撞实验。

## 运行时（src/three/MechanismViewer.tsx）

- React Three Fiber + drei；GLB 节点按名查找，每帧写入插值变换。
- 爆炸分解：按真实装配关系设计方向与顺序（`src/data/viewer.ts`），逐部件时间窗（smoothstep），非通用径向分解。
- 关节标注：`joints.json` 基准 × 当前零件世界矩阵 → 世界坐标标记；相位-运动副映射见 `PHASE_JOINTS`。
- 运动轨迹：对追踪点（臂端/滑座/根部枢轴/平台）沿轨道采样连线。
- 相机预设：等轴/正视/侧视/顶视/关节特写；OrbitControls 自由旋转不改变 t。
- 零件点选/隔离/X 光：仅改材质与可见性，不改变换。
- 回退：WebGL 不可用或 GLB/轨道加载失败 → 原始 R1-V6 渲染帧播放器（FramePlayer）。

## 姿态对齐验收

`keyposes.json` 提供 5 个关键姿态的真值；e2e 播放推进与关键帧切换通过即验证运行时轨道与真值一致
（插值误差上界：采样步长 1/160 × 相位最大速度，远小于 0.05 mm 运动副闭合容差）。

## F04 / F12（无 CAD 零件）

二者淘汰于建模/工程决策阶段，源仓库无零件级 CAD。其 3D 场景为**参数化原理示意**，
按 documented 参数重建（F04: candidates.json + 独立审查；F12: screening_v3.json + V3.2 晃动评估），
界面明确标注"原理示意"。干涉高亮为审查记录口径的位置示意，不伪造三维碰撞/卡滞/公差实验结果。
