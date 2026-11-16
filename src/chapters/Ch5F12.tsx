import { F12_SIM, F12_ENG } from '../data/analysis'
import { useState } from 'react'
import { useApp, useInView } from '../state'
import { F12Scene } from '../three/SchematicScenes'
import type { ViewMode } from '../three/SchematicScenes'

export function Ch5F12() {
  const { f12Extend, setF12Extend, f12Wobble, setF12Wobble, openEvidence } = useApp()
  const [view, setView] = useState<ViewMode>('full')
  const [sceneRef, inView] = useInView<HTMLDivElement>()

  return (
    <section className="chapter" id="ch5">
      <div className="wrap">
        <div className="kicker">CHAPTER 05 · 第二次关键逆转</div>
        <h2 className="question">仿真全场最优，为什么还是不做？</h2>
        <p className="lede">F12 三级伸缩：收纳比 0.735、Y 挠度 0.0612 mm 全场最优、连续碰撞 PASS。打开<b>晃动示意</b>，看六周课程窗口里真正的问题。</p>

        <div className="scene">
          <div className="scene-canvas" ref={sceneRef}>
            <span className="scene-badge">原理示意 · 按 screening_v3.json 参数重建（F12 无 CAD 零件，不制造）</span>
            <F12Scene extend={f12Extend} wobbleOn={f12Wobble} view={view} active={inView} />
            <div className="scene-caption">
              <div className="cap-t">{f12Wobble ? '导向晃动 0.203–0.229 mm（夸大 ×20 示意）' : '三级嵌套伸缩 · 外径 60 / 壁厚 3 / 重叠 52'}</div>
              <div className="cap-d">{f12Wobble ? '多级导向间隙累积 → 卡滞风险。设计径向间隙仅 0.015 mm，常规加工与打印难以稳定保证。' : '拖动滑块展开/收拢。几何上它完全可行——问题不在几何。'}</div>
            </div>
          </div>
          <div className="vbar">
            <div className="seg">
              <button className={view === 'full' ? 'on' : ''} onClick={() => setView('full')}>整体视角</button>
              <button className={view === 'close' ? 'on danger' : ''} onClick={() => setView('close')}>导向间隙特写</button>
            </div>
            <span className="meta">收拢</span>
            <input type="range" min={0} max={1} step={0.005} value={f12Extend} onChange={e => setF12Extend(Number(e.target.value))} aria-label="伸缩进度" />
            <span className="meta">展开</span>
            <button className={`btn sm ${f12Wobble ? 'on' : ''}`} style={f12Wobble ? { background: 'var(--red)', borderColor: 'var(--red)', color: '#fff' } : {}} onClick={() => setF12Wobble(!f12Wobble)}>
              {f12Wobble ? '关闭晃动示意' : '▶ 打开晃动示意'}
            </button>
          </div>
        </div>

        <div className="stamp-row">
          <div className="stamp pass"><span className="s1">SIM PASS</span><span className="s2">V3.2.1 连续碰撞 + 筛选通过</span></div>
          <div className="stamp nogo"><span className="s1">ENG NO-GO</span><span className="s2">六周精密套筒制造不可控</span></div>
        </div>

        <p className="verdict-line">不是弱，是现阶段不该做。数学和几何上可行的方案，不一定是六周内最值得制造的方案。</p>

        <details className="expand">
          <summary>查看证据：仿真优点 vs 工程条件（逐项带版本口径）</summary>
          <div className="expand-body">
            <div className="boundary-grid" style={{ margin: '8px 0 16px' }}>
              <div className="boundary-col ok">
                <h3>仿真层面：它确实强</h3>
                <ul>{F12_SIM.map((r, i) => <li key={i}><b>{r.metric} {r.value}</b>（{r.version}）— {r.note}</li>)}</ul>
              </div>
              <div className="boundary-col todo">
                <h3>工程层面：六周做不稳</h3>
                <ul>{F12_ENG.map((r, i) => <li key={i}><b>{r.metric} {r.value}</b>（{r.version}）— {r.note}</li>)}</ul>
              </div>
            </div>
            <div className="evidence-row">
              {['selection', 'sum321', 'lineup32', 'lineup321'].map(id => (
                <button key={id} className="btn sm ghost" onClick={() => openEvidence(id)}>{id === 'selection' ? 'V1 推荐数据' : id === 'sum321' ? 'V3.2.1 复核' : id === 'lineup32' ? 'V3.2 晃动评估' : 'No-Go 决定'}</button>
              ))}
            </div>
          </div>
        </details>
      </div>
    </section>
  )
}
