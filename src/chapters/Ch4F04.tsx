import { motion } from 'framer-motion'
import { F04_TIMELINE } from '../data/analysis'
import { ELIM_BY_ID } from '../data/eliminations'
import { useApp } from '../state'
import { EliminationCard } from '../components/EliminationCard'
import { Icon } from '../components/Icons'

type Mode = 0 | 1 | 2 // Before / After / Why Failed

const MODES = [
  { label: 'Before · 抽象优化模型', sub: '被过度简化的版本' },
  { label: 'After · 补全真实机构', sub: '槽轨 / 滚轮 / 导向约束' },
  { label: 'Why Failed · 失败机制', sub: '穿透位置与无可行解' },
]

const MISSING = [
  { name: '槽轨中心线（实体）', before: false, after: true },
  { name: '槽宽 12 mm', before: false, after: true },
  { name: '滚轮 Ø8 + 导向间隙', before: false, after: true },
  { name: '槽轨 ↔ 热床碰撞对', before: false, after: true },
  { name: '装配可达性约束', before: false, after: true },
]

export function Ch4F04() {
  const { f04View, setF04View, openEvidence, reduced } = useApp()
  const mode: Mode = f04View < 0.33 ? 0 : f04View < 0.83 ? 1 : 2
  const setMode = (m: Mode) => setF04View(m === 0 ? 0 : m === 1 ? 0.5 : 1)
  const op = (m: Mode) => (mode === m ? 1 : 0)

  return (
    <section className="chapter" id="ch4">
      <div className="container">
        <div className="ch-kicker">CHAPTER 04 · 第一次关键逆转</div>
        <h2 className="ch-title">F04 曾经被考虑推荐。后来，我们发现模型本身不成立。</h2>
        <p className="ch-lead">
          V1 初始权重一度给出 <strong>F07 + F04</strong> 推荐。独立审查发现：这个"槽轨复合避让"模型
          <strong>没有槽轨实体、滚轮或导向约束</strong>。下面三联视图展示：优化器当初优化的是什么、补全后变成了什么、以及它到底在哪里失败。
        </p>

        <div className="f04-grid">
          <div className="f04-stage">
            <div className="tri-tabs" role="tablist" aria-label="F04 三联对照">
              {MODES.map((m, i) => (
                <button key={i} role="tab" aria-selected={mode === i}
                  className={`tri-tab ${mode === i ? 'active' : ''} ${i === 2 ? 'danger' : ''}`}
                  onClick={() => setMode(i as Mode)}>
                  <b>{m.label}</b><span>{m.sub}</span>
                </button>
              ))}
            </div>

            <div className="tri-view">
              <svg viewBox="0 0 640 400" role="img" aria-label="F04 三联对照：抽象模型 / 补全机构 / 失败机制">
                <rect x="50" y="330" width="540" height="26" fill="none" stroke="var(--text3)" strokeWidth="2" />
                <text x="56" y="374" fill="var(--text3)" fontSize="13">底座</text>
                <rect x="260" y="300" width="210" height="22" fill="none" stroke="var(--text2)" strokeWidth="2" />
                <text x="478" y="316" fill="var(--text2)" fontSize="13">热床</text>

                {/* Before */}
                <g style={{ opacity: op(0), transition: reduced ? 'none' : 'opacity .45s' }}>
                  <rect x="170" y="100" width="24" height="230" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
                  <line x1="182" y1="100" x2="420" y2="100" stroke="var(--accent)" strokeWidth="2.5" />
                  <rect x="400" y="100" width="26" height="30" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
                  <circle cx="182" cy="330" r="6" fill="var(--accent)" />
                  <path d="M 150 320 L 150 220 L 235 220" fill="none" stroke="var(--st-conditional)" strokeWidth="2" strokeDasharray="7 5" />
                  <path d="M 228 212 L 238 220 L 228 228" fill="none" stroke="var(--st-conditional)" strokeWidth="2" />
                  <path d="M 250 205 A 60 60 0 0 1 300 250" fill="none" stroke="var(--st-conditional)" strokeWidth="2" strokeDasharray="7 5" />
                  <rect x="240" y="120" width="24" height="200" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.5" transform="rotate(35 252 320)" />
                  <rect x="120" y="42" width="400" height="46" rx="8" fill="rgba(232,177,63,0.08)" stroke="var(--st-conditional)" strokeWidth="1" />
                  <text x="132" y="62" fill="var(--st-conditional)" fontSize="14" fontWeight="700">优化器优化的对象：一条抽象枢轴路径</text>
                  <text x="132" y="80" fill="var(--text3)" fontSize="12">抬升 → 平移 → 转轴；guided 参数从未被使用，与根部翻折共用轨迹函数</text>
                  <text x="330" y="180" fill="var(--st-conditional)" fontSize="12">优化解 lift=70 / shift=20：0 穿透（仅此抽象模型）</text>
                </g>

                {/* After */}
                <g style={{ opacity: op(1), transition: reduced ? 'none' : 'opacity .45s' }}>
                  <rect x="170" y="100" width="24" height="230" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
                  <line x1="182" y1="100" x2="420" y2="100" stroke="var(--accent)" strokeWidth="2.5" />
                  <rect x="400" y="100" width="26" height="30" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
                  <path d="M 150 330 C 150 250 175 200 250 165" fill="none" stroke="var(--text)" strokeWidth="14" opacity="0.85" />
                  <path d="M 150 330 C 150 250 175 200 250 165" fill="none" stroke="var(--bg)" strokeWidth="7" />
                  <path d="M 150 330 C 150 250 175 200 250 165" fill="none" stroke="var(--text3)" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="158" cy="292" r="8" fill="var(--bg)" stroke="var(--st-conditional)" strokeWidth="2.5" />
                  <circle cx="176" cy="240" r="8" fill="var(--bg)" stroke="var(--st-conditional)" strokeWidth="2.5" />
                  <text x="60" y="270" fill="var(--st-conditional)" fontSize="12">滚轮 Ø8</text>
                  <text x="60" y="288" fill="var(--text3)" fontSize="12">槽宽 12 · 导向间隙</text>
                  <rect x="120" y="42" width="400" height="46" rx="8" fill="rgba(90,162,247,0.08)" stroke="var(--accent)" strokeWidth="1" />
                  <text x="132" y="62" fill="var(--accent)" fontSize="14" fontWeight="700">补全后的真实机构：槽轨参与碰撞</text>
                  <text x="132" y="80" fill="var(--text3)" fontSize="12">槽轨中心线、槽宽、滚轮、导向间隙实例化；槽轨与热床成为碰撞对</text>
                </g>

                {/* Why Failed */}
                <g style={{ opacity: op(2), transition: reduced ? 'none' : 'opacity .45s' }}>
                  <rect x="170" y="100" width="24" height="230" fill="none" stroke="var(--text3)" strokeWidth="2" />
                  <line x1="182" y1="100" x2="420" y2="100" stroke="var(--text3)" strokeWidth="2" />
                  <rect x="400" y="100" width="26" height="30" fill="none" stroke="var(--text3)" strokeWidth="2" />
                  <path d="M 150 330 C 150 250 175 200 250 165" fill="none" stroke="var(--text3)" strokeWidth="14" opacity="0.6" />
                  <path d="M 150 330 C 150 250 175 200 250 165" fill="none" stroke="var(--bg)" strokeWidth="7" />
                  <circle cx="158" cy="292" r="8" fill="var(--bg)" stroke="var(--text3)" strokeWidth="2" />
                  <circle cx="176" cy="240" r="8" fill="var(--bg)" stroke="var(--text3)" strokeWidth="2" />
                  {/* 冲突区域高亮 */}
                  <rect x="256" y="290" width="84" height="38" fill="rgba(248,81,73,0.32)" stroke="var(--st-nogo)" strokeWidth="2.5" />
                  <path d="M 256 328 L 280 290 M 274 328 L 298 290 M 292 328 L 316 290 M 310 328 L 334 290" stroke="var(--st-nogo)" strokeWidth="1.5" />
                  <circle cx="298" cy="309" r="30" fill="none" stroke="var(--st-nogo)" strokeWidth="1.5" strokeDasharray="4 4" />
                  <line x1="328" y1="296" x2="400" y2="248" stroke="var(--st-nogo)" strokeWidth="1.5" />
                  <rect x="400" y="214" width="220" height="66" rx="8" fill="rgba(248,81,73,0.1)" stroke="var(--st-nogo)" strokeWidth="1.5" />
                  <text x="412" y="236" fill="var(--st-nogo)" fontSize="14" fontWeight="700">失败位置：槽轨 ↔ 热床</text>
                  <text x="412" y="256" fill="var(--st-nogo)" fontSize="13" className="mono">名义穿透 45.338 mm²</text>
                  <text x="412" y="272" fill="var(--text3)" fontSize="12">翻折段槽轨实体扫过热床包络</text>
                  {/* 无可行解印章 */}
                  <g transform="rotate(-8 180 210)">
                    <rect x="96" y="188" width="180" height="44" rx="6" fill="none" stroke="var(--st-nogo)" strokeWidth="2.5" />
                    <text x="186" y="216" fill="var(--st-nogo)" fontSize="16" fontWeight="800" textAnchor="middle">优化无可行解 · 0/238</text>
                  </g>
                  <rect x="120" y="42" width="430" height="46" rx="8" fill="rgba(248,81,73,0.08)" stroke="var(--st-nogo)" strokeWidth="1" />
                  <text x="132" y="62" fill="var(--st-nogo)" fontSize="14" fontWeight="700">失败机制：真实结构补全后，原优化解失效</text>
                  <text x="132" y="80" fill="var(--text3)" fontSize="12">不是优化器不够努力——是被优化的对象从一开始就缺了真实机构</text>
                </g>
              </svg>
            </div>

            <div className="tri-caption">
              <Icon name="alert" size={13} />
              <span>根据独立审查记录绘制的二维原理示意，不是真实 CAD。红色区域为审查复算的穿透位置口径。</span>
            </div>
          </div>

          <div className="f04-side">
            <div className="panel missing-panel">
              <h3>真实缺失了什么？</h3>
              <div className="missing-list">
                {MISSING.map(m => {
                  const present = mode >= 1 && m.after
                  return (
                    <div key={m.name} className={`missing-item ${present ? 'ok' : 'bad'}`}>
                      <Icon name={present ? 'check' : 'cross'} size={13} />
                      <span>{m.name}</span>
                      <span className="tiny muted">{mode === 0 ? '抽象模型中不存在' : mode === 1 ? '已实例化' : '已实例化 → 参与碰撞'}</span>
                    </div>
                  )
                })}
              </div>
              {mode === 2 && (
                <motion.div className="missing-verdict" initial={reduced ? false : { scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  补全这些结构后：名义穿透 45.338 mm²，全域搜索 0/238 可行，推荐撤回。
                </motion.div>
              )}
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
        </div>

        <EliminationCard e={ELIM_BY_ID['F04']} />

        <div className="conclusion-banner">
          <Icon name="flag" size={20} />
          优化器找到可行路径，不等于被优化的机械结构真实可行。
        </div>
      </div>
    </section>
  )
}
