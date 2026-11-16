import { useState } from 'react'
import { motion } from 'framer-motion'
import { F12_SIM, F12_ENG } from '../data/analysis'
import { ELIM_BY_ID } from '../data/eliminations'
import { useApp } from '../state'
import { StatusBadge } from '../components/StatusBadge'
import { EliminationCard } from '../components/EliminationCard'
import { Icon } from '../components/Icons'

export function Ch5F12() {
  const { openEvidence, reduced } = useApp()
  const [moved, setMoved] = useState(false)

  return (
    <section className="chapter" id="ch5">
      <div className="container">
        <div className="ch-kicker">CHAPTER 05 · 第二次关键逆转</div>
        <h2 className="ch-title">通过仿真筛选，为什么还是不做？</h2>
        <p className="ch-lead">
          F12 三级伸缩立柱在 V1 曾与 F07 一起被推荐，V3.2.1 复核仍然<strong>连续碰撞 PASS、整体筛选 PASS、刚度全场最优</strong>。
          它被砍，不是因为弱——而是因为六周课程项目里，精密三级套筒<strong>太理想化、太不稳</strong>。
        </p>

        <div className="f12-move">
          <button className="btn sm" onClick={() => setMoved(m => !m)}>
            {moved ? '↺ 回到虚拟筛选入围' : '▶ 播放决策转移'}
          </button>
          <div className="f12-track">
            <span>虚拟筛选入围（V1 推荐 / V3.2.1 PASS）</span>
            <span>工程淘汰（No-Go / Archived）</span>
            <motion.div
              style={{ position: 'absolute', top: 9 }}
              animate={{ left: moved ? 'calc(100% - 190px)' : '12px' }}
              transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 60, damping: 16 }}
            >
              <div style={{ width: 178, background: 'var(--bg3)', border: `1px solid ${moved ? 'var(--st-nogo)' : 'var(--st-pass)'}`, borderRadius: 8, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <b style={{ fontSize: 14 }}>F12</b>
                <StatusBadge status={moved ? 'nogo' : 'pass'} label={moved ? 'No-Go' : '仿真 PASS'} size="sm" />
              </div>
            </motion.div>
          </div>
        </div>

        <div className="f12-tri">
          <div className="f12-col sim">
            <h3><Icon name="check" size={16} />仿真层面：它确实强</h3>
            {F12_SIM.map((r, i) => (
              <div className="f12-row" key={i}>
                <div className="m">{r.metric}<span className="vtag">{r.version}</span></div>
                <div className="v mono">{r.value}</div>
                <div className="n">{r.note}</div>
              </div>
            ))}
          </div>

          <div className="f12-col eng">
            <h3><Icon name="wrench" size={16} />工程层面：六周做不稳</h3>
            {F12_ENG.map((r, i) => (
              <div className="f12-row" key={i}>
                <div className="m">{r.metric}<span className="vtag">{r.version}</span></div>
                <div className="v mono">{r.value}</div>
                <div className="n">{r.note}</div>
              </div>
            ))}
            <div className="gap-fig">
              <svg viewBox="0 0 300 130" role="img" aria-label="三级伸缩导向间隙示意（夸大绘制）">
                <rect x="30" y="14" width="70" height="102" fill="none" stroke="var(--text2)" strokeWidth="2" />
                <rect x="42" y="26" width="46" height="90" fill="none" stroke="var(--text2)" strokeWidth="2" />
                <rect x="52" y="38" width="26" height="78" fill="none" stroke="var(--accent)" strokeWidth="2" />
                <line x1="98" y1="52" x2="150" y2="52" stroke="var(--st-conditional)" strokeWidth="1.5" />
                <text x="154" y="48" fill="var(--st-conditional)" fontSize="11">设计径向间隙 0.015 mm</text>
                <text x="154" y="62" fill="var(--text3)" fontSize="10">（V3 优化预紧版）</text>
                <line x1="78" y1="92" x2="150" y2="92" stroke="var(--st-nogo)" strokeWidth="1.5" />
                <text x="154" y="88" fill="var(--st-nogo)" fontSize="11">实测口径晃动 0.203–0.229 mm</text>
                <text x="154" y="102" fill="var(--text3)" fontSize="10">多级导向间隙累积 → 卡滞风险</text>
                <path d="M 60 70 l 6 -5 M 60 78 l 6 -5" stroke="var(--st-nogo)" strokeWidth="1.5" />
                <text x="30" y="128" fill="var(--text3)" fontSize="10">间隙夸大绘制 · 原理示意，非真实比例</text>
              </svg>
            </div>
          </div>

          <div className="f12-col verdict-col">
            <h3><Icon name="flag" size={16} />最终结论</h3>
            <div className={`stamp ${moved ? 'stamp-nogo' : 'stamp-pass'}`}>
              <span className="stamp-l1">{moved ? 'ENG NO-GO' : 'SIM PASS'}</span>
              <span className="stamp-l2">{moved ? '工程淘汰 · 不制造' : '仿真可行 · 曾入围'}</span>
            </div>
            <p className="verdict-text">
              不是"性能差"，而是<b>项目周期和制造条件下不该做</b>。
              收纳比 0.735、Y 挠度 0.0612 mm 的仿真优势，换不来六周内稳定可装配的精密三级导轨。
            </p>
            <div className="verdict-keep">
              <div className="tiny muted">保留什么</div>
              <p className="small">仿真结论与失败风险记录完整归档（No-Go / Archived），作为后续周期充裕时的复评依据。</p>
            </div>
            <div className="verdict-keep">
              <div className="tiny muted">资源转向</div>
              <p className="small">六周窗口集中给 F09/F07 抬升翻折台架与 SCZ 剪叉台架——它们的问题更适合用打印件快速回答。</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          <button className="ev-link" onClick={() => openEvidence('selection')}>V1 推荐数据</button>
          <button className="ev-link" onClick={() => openEvidence('sum321')}>V3.2.1 复核数据</button>
          <button className="ev-link" onClick={() => openEvidence('lineup32')}>V3.2 晃动评估</button>
          <button className="ev-link" onClick={() => openEvidence('lineup321')}>V3.2.1 No-Go 决定</button>
        </div>

        <EliminationCard e={ELIM_BY_ID['F12']} />

        <div className="conclusion-banner danger">
          <Icon name="stop" size={20} />
          数学和几何上可行的方案，不一定是现阶段最值得制造的方案。
        </div>
      </div>
    </section>
  )
}
