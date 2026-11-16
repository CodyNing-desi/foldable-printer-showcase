import { useState } from 'react'
import { useApp, assetUrl } from '../state'
import { AUTO_TOTAL } from '../autoplay'

export function Ch1Hero() {
  const { scrollTo, startAuto } = useApp()
  const [fold, setFold] = useState(0)

  return (
    <section className="chapter hero" id="ch1">
      <div className="container hero-grid">
        <div>
          <div className="ch-kicker">CHAPTER 01 · 问题提出</div>
          <h1>一台3D打印机，<br />可以怎样折叠？</h1>
          <p className="hero-sub">15种机构构想，数轮仿真与审查，三条实物验证路线。</p>
          <ul className="hero-points">
            <li><strong>展开时</strong>需要足够工作空间：180 mm 打印高度，参考 347×315×365 mm 外形。</li>
            <li><strong>收纳时</strong>希望减小运输包络：系统收纳比 ≤ 0.800，且必须包含料盘、电源、工具等附件。</li>
            <li><strong>折叠全程</strong>必须满足运动避让：无穿透、可达，离散采样还要升级为连续认证。</li>
            <li><strong>展开之后</strong>仍要可用：刚度、重复定位、装配可行性，以及六周内造得出来。</li>
          </ul>
          <div className="hero-cta">
            <button className="btn primary" onClick={() => scrollTo('ch2')}>开始查看 ↓</button>
            <button className="btn" onClick={startAuto}>▶ 自动演示（约 {AUTO_TOTAL} 秒）</button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><b>15</b><span>候选机构</span></div>
            <div className="hero-stat"><b>7</b><span>筛选与决策阶段</span></div>
            <div className="hero-stat"><b>2</b><span>次关键逆转（F04 / F12）</span></div>
            <div className="hero-stat"><b>3+1</b><span>实物验证路线 + 备选</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="frame">
            <img src={assetUrl('assets/F09_L82/view_open.png')} alt="F09_L82 展开状态（R1-V6 真实 CAD 渲染）" />
            <img
              className="img-top"
              src={assetUrl('assets/F09_L82/view_folded.png')}
              alt="F09_L82 折叠状态（R1-V6 真实 CAD 渲染）"
              style={{ opacity: fold }}
            />
          </div>
          <div className="hero-slider-row">
            <span>展开</span>
            <input
              type="range" min={0} max={1} step={0.01} value={fold}
              onChange={e => setFold(Number(e.target.value))}
              aria-label="展开与折叠状态切换"
            />
            <span>收纳</span>
          </div>
          <div className="hero-note">
            真实素材：F09_L82 · R1-V6 缩比 1:2 机械原理演示模型（round1-demo-cad @ d35cbd1）。
            拖动滑块对比两种姿态；完整运动见 Chapter 07。
          </div>
        </div>
      </div>
    </section>
  )
}
