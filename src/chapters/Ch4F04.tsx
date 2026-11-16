import { F04_TIMELINE } from '../data/analysis'
import { useApp } from '../state'

export function Ch4F04() {
  const { f04View, setF04View, openEvidence } = useApp()
  const v = f04View

  return (
    <section className="chapter" id="ch4">
      <div className="container">
        <div className="ch-kicker">CHAPTER 04 · 第一次关键逆转</div>
        <h2 className="ch-title">F04 曾经被考虑推荐。后来，我们发现模型本身不成立。</h2>
        <p className="ch-lead">
          V1 初始权重一度给出 <strong>F07 + F04</strong> 推荐：F04 名义轨迹有穿透，但优化器在抽象"抬升 + 平移 + 转轴"路径中找到了无穿透解。
          独立审查发现：这个被称为"槽轨复合避让"的模型，<strong>没有槽轨实体、滚轮或导向约束</strong>。
        </p>

        <div className="f04-grid">
          <div className="f04-stage">
            <svg viewBox="0 0 640 400" role="img" aria-label="F04 抽象模型与补全槽轨模型对比示意">
              {/* 共同背景 */}
              <rect x="50" y="330" width="540" height="26" fill="none" stroke="var(--text3)" strokeWidth="2" />
              <text x="56" y="374" fill="var(--text3)" fontSize="13">底座</text>
              <rect x="260" y="300" width="210" height="22" fill="none" stroke="var(--text2)" strokeWidth="2" />
              <text x="478" y="316" fill="var(--text2)" fontSize="13">热床</text>

              {/* Before：抽象运动模型 */}
              <g opacity={1 - v}>
                <rect x="170" y="100" width="24" height="230" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
                <line x1="182" y1="100" x2="420" y2="100" stroke="var(--accent)" strokeWidth="2.5" />
                <rect x="400" y="100" width="26" height="30" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
                <circle cx="182" cy="330" r="6" fill="var(--accent)" />
                <path d="M 150 320 L 150 220 L 235 220" fill="none" stroke="var(--st-conditional)" strokeWidth="2" strokeDasharray="7 5" />
                <path d="M 228 212 L 238 220 L 228 228" fill="none" stroke="var(--st-conditional)" strokeWidth="2" />
                <path d="M 250 205 A 60 60 0 0 1 300 250" fill="none" stroke="var(--st-conditional)" strokeWidth="2" strokeDasharray="7 5" />
                <rect x="240" y="120" width="24" height="200" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.5" transform="rotate(35 252 320)" />
                <text x="120" y="60" fill="var(--accent)" fontSize="15" fontWeight="700">Before · 抽象运动模型</text>
                <text x="120" y="80" fill="var(--text3)" fontSize="12">只有枢轴路径：抬升 → 平移 → 转轴；guided 参数从未被使用</text>
                <text x="330" y="180" fill="var(--st-conditional)" fontSize="12">优化解 lift=70 / shift=20：0 穿透（仅此抽象模型）</text>
              </g>

              {/* After：补全机构后的模型 */}
              <g opacity={v}>
                <rect x="170" y="100" width="24" height="230" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
                <line x1="182" y1="100" x2="420" y2="100" stroke="var(--accent)" strokeWidth="2.5" />
                <rect x="400" y="100" width="26" height="30" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
                {/* 槽轨实体 */}
                <path d="M 150 330 C 150 250 175 200 250 165" fill="none" stroke="var(--text)" strokeWidth="14" opacity="0.85" />
                <path d="M 150 330 C 150 250 175 200 250 165" fill="none" stroke="var(--bg)" strokeWidth="7" />
                <path d="M 150 330 C 150 250 175 200 250 165" fill="none" stroke="var(--text3)" strokeWidth="1" strokeDasharray="3 3" />
                {/* 滚轮 */}
                <circle cx="158" cy="292" r="8" fill="var(--bg)" stroke="var(--st-conditional)" strokeWidth="2.5" />
                <circle cx="176" cy="240" r="8" fill="var(--bg)" stroke="var(--st-conditional)" strokeWidth="2.5" />
                <text x="60" y="270" fill="var(--st-conditional)" fontSize="12">滚轮 Ø8</text>
                <text x="60" y="288" fill="var(--text3)" fontSize="12">槽宽 12 · 导向间隙</text>
                {/* 干涉区域：槽轨与热床 */}
                <g>
                  <rect x="262" y="296" width="70" height="28" fill="rgba(239,95,95,0.35)" stroke="var(--st-nogo)" strokeWidth="2" />
                  <path d="M 262 324 L 282 296 M 277 324 L 297 296 M 292 324 L 312 296 M 307 324 L 327 296" stroke="var(--st-nogo)" strokeWidth="1.5" />
                  <line x1="332" y1="310" x2="400" y2="270" stroke="var(--st-nogo)" strokeWidth="1.5" />
                  <text x="404" y="266" fill="var(--st-nogo)" fontSize="14" fontWeight="700">槽轨 ↔ 热床穿透</text>
                  <text x="404" y="284" fill="var(--st-nogo)" fontSize="13" className="mono">45.338 mm²</text>
                </g>
                <text x="120" y="60" fill="var(--st-nogo)" fontSize="15" fontWeight="700">After · 补全机构后的模型</text>
                <text x="120" y="80" fill="var(--text3)" fontSize="12">槽轨中心线、槽宽、滚轮、导向间隙实例化；槽轨与热床参与碰撞</text>
              </g>
            </svg>
            <div className="f04-labels">
              <span className={v < 0.5 ? 'on' : ''}>Before · 抽象运动模型</span>
              <span className={v >= 0.5 ? 'on' : ''}>After · 补全机构后的模型</span>
            </div>
            <div className="f04-slider">
              <span className="tiny muted">Before</span>
              <input type="range" min={0} max={1} step={0.01} value={v} onChange={e => setF04View(Number(e.target.value))} aria-label="F04 模型修正前后对比" />
              <span className="tiny muted">After</span>
            </div>
            <p className="tiny muted" style={{ margin: '10px 0 0' }}>
              根据独立审查记录绘制的二维原理示意，不是真实 CAD。两个状态都不是完整三维模型；确切证据见右侧审查文件。
            </p>
          </div>

          <div className="panel">
            <h3>证据时间线</h3>
            <div className="timeline">
              {F04_TIMELINE.map((t, i) => (
                <div className={`tl-item ${i >= 4 ? 'bad' : i === 2 ? 'good' : ''}`} key={i}>
                  <span className="s">{t.step}</span>
                  <span>
                    <span className="v mono">{t.value}</span>
                    <button className="ev-link" style={{ marginLeft: 8 }} onClick={() => openEvidence(t.source)}>证据</button>
                    <div className="tiny muted">{t.detail}</div>
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn sm" onClick={() => openEvidence('review1')}>独立审查原文（critical-1）</button>
              <button className="btn sm ghost" onClick={() => openEvidence('final31')}>V3.1 冻结：0/238 可行</button>
            </div>
          </div>
        </div>

        <div className="conclusion-banner">
          优化器找到可行路径，不等于被优化的机械结构真实可行。
        </div>
      </div>
    </section>
  )
}
