import { useState } from 'react'
import { motion } from 'framer-motion'
import { F12_SIM, F12_ENG } from '../data/analysis'
import { useApp } from '../state'
import { StatusBadge } from '../components/StatusBadge'

export function Ch5F12() {
  const { openEvidence, reduced } = useApp()
  const [moved, setMoved] = useState(false)

  return (
    <section className="chapter" id="ch5">
      <div className="container">
        <div className="ch-kicker">CHAPTER 05 · 第二次关键逆转</div>
        <h2 className="ch-title">通过仿真筛选，为什么还是不做？</h2>
        <p className="ch-lead">
          F12 三级伸缩立柱在 V1 曾与 F07 一起被推荐，V3.2.1 复核仍然<strong>连续碰撞 PASS、整体筛选 PASS、刚度最优</strong>。
          但研发时间被限定为约六周：精密多级套筒的加工、导向配合与卡滞风险，在这个窗口内不可控。
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
                <StatusBadge status={moved ? 'nogo' : 'pass'} label={moved ? 'No-Go' : '仿真 PASS'} />
              </div>
            </motion.div>
          </div>
        </div>

        <div className="f12-grid">
          <div className="f12-col sim">
            <h3>仿真层面 <span className="tiny muted">数值均带版本口径</span></h3>
            {F12_SIM.map((r, i) => (
              <div className="f12-row" key={i}>
                <div className="m">{r.metric}<span className="vtag">{r.version}</span></div>
                <div className="v mono">{r.value}</div>
                <div className="n">{r.note}</div>
              </div>
            ))}
          </div>
          <div className="f12-arrow">→</div>
          <div className="f12-col eng">
            <h3>实际制造条件 <span className="tiny muted">六周课程窗口</span></h3>
            {F12_ENG.map((r, i) => (
              <div className="f12-row" key={i}>
                <div className="m">{r.metric}<span className="vtag">{r.version}</span></div>
                <div className="v mono">{r.value}</div>
                <div className="n">{r.note}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          <button className="ev-link" onClick={() => openEvidence('selection')}>V1 推荐数据</button>
          <button className="ev-link" onClick={() => openEvidence('sum321')}>V3.2.1 复核数据</button>
          <button className="ev-link" onClick={() => openEvidence('lineup32')}>V3.2 晃动评估</button>
          <button className="ev-link" onClick={() => openEvidence('lineup321')}>V3.2.1 No-Go 决定</button>
        </div>

        <div className="conclusion-banner">
          数学和几何上可行的方案，不一定是现阶段最值得制造的方案。
        </div>
      </div>
    </section>
  )
}
