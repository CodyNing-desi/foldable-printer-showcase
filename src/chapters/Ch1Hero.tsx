import { useState } from 'react'
import { useApp, assetUrl, useInView } from '../state'
import { MechanismViewer, webglAvailable } from '../three/MechanismViewer'
import { AUTO_TOTAL } from '../autoplay'

export function Ch1Hero() {
  const { scrollTo, startAuto } = useApp()
  const [fold, setFold] = useState(0)
  const [hasGL] = useState(webglAvailable)
  const [sceneRef, inView] = useInView<HTMLDivElement>()

  return (
    <section className="chapter" id="ch1">
      <div className="wrap hero">
      <div>
        <div className="kicker">CHAPTER 01 · 问题提出</div>
        <h1>一台3D打印机，<br />可以怎样折叠？</h1>
        <p className="hero-sub">15种机构构想，数轮仿真与审查，三条实物验证路线。</p>
        <ul className="hero-points">
          <li><b>展开</b>要能打印：180 mm 打印高度。</li>
          <li><b>收纳</b>要能运输：系统收纳比 ≤ 0.800，含全部附件。</li>
          <li><b>折叠全程</b>不干涉：从离散采样升级到连续认证。</li>
          <li><b>展开之后</b>还要够刚、够准、六周内装得起来。</li>
        </ul>
        <div className="hero-cta">
          <button className="btn primary" onClick={() => scrollTo('ch2')}>开始查看 ↓</button>
          <button className="btn" onClick={startAuto}>▶ 自动演示（约 {AUTO_TOTAL} 秒）</button>
        </div>
        <details className="expand" style={{ maxWidth: 640 }}>
          <summary>术语速览（给第一次看的观众）</summary>
          <div className="expand-body">
            <p><b>收纳比</b>：折起来后的总体积 ÷ 展开时的总体积。越小越省地方；我们要求 ≤0.8，且必须把料盘、电源、工具一起算进去。</p>
            <p><b>穿透面积</b>：折叠过程中零件互相重叠的截面大小。大于 0 就是"自己撞自己"。</p>
            <p><b>名义筛选 / 优化 / 工程入围</b>：默认尺寸下及格 ≠ 存在一组尺寸能及格 ≠ 值得在六周内造出来。三层结论不能混。</p>
            <p><b>连续碰撞认证</b>：不是抽查几个瞬间没撞，而是用数学边界证明整段运动都不撞。</p>
            <p><b>挠度 / P95</b>：侧向推 10 牛时末端弯多少毫米；P95 是重复展开定位误差的 95 分位（模型估计，非实测）。</p>
            <p><b>运动副</b>：零件之间允许某种相对运动的连接，如转轴（铰链）、滑轨（移动副）。</p>
            <p><b>缩比 1:2</b>：屏幕上的演示模型是原设计的一半尺寸，只验证"动得对、装得上"，不验证承载与寿命。</p>
            <p><b>齐套</b>：逐件点数确认所有零件到齐。打印执行完 ≠ 齐套 ≠ 装配完 ≠ 测试完。</p>
          </div>
        </details>
      </div>
      <div className="scene">
        <div className="scene-canvas" ref={sceneRef}>
          <span className="scene-badge">F09_L82 · R1-V6 真实 CAD 装配 · 缩比 1:2</span>
          {hasGL ? (
            <MechanismViewer
              cand="F09_L82"
              ctrl={{ t: fold, explode: 0, xray: false, isolate: null, selected: null, traces: false, labels: false, preset: 'iso', presetToken: 0, frameToken: 0, version: 'v321' }}
              onSelect={() => {}} onFallback={() => {}} className="viewer-fill"
            />
          ) : (
            <div style={{ position: 'relative', height: '100%' }}>
              <img src={assetUrl('assets/F09_L82/view_open.png')} alt="F09 展开" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              <img src={assetUrl('assets/F09_L82/view_folded.png')} alt="F09 折叠" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: fold }} />
            </div>
          )}
          <div className="scene-caption">
            <div className="cap-t">拖动滑块，看它折叠</div>
            <div className="cap-d">X 臂下折 → 双柱抬升 → 根部翻折。这是后面所有筛选故事的物理对象。</div>
          </div>
        </div>
        <div className="vbar">
          <span className="meta">展开</span>
          <input type="range" min={0} max={1} step={0.005} value={fold} onChange={e => setFold(Number(e.target.value))} aria-label="展开与折叠" />
          <span className="meta">收纳</span>
        </div>
      </div>
      </div>
    </section>
  )
}
