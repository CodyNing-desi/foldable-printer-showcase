import { useState } from 'react'
import { F04_TIMELINE } from '../data/analysis'
import { useApp, useInView } from '../state'
import { F04Scene } from '../three/SchematicScenes'
import type { F04Mode, ViewMode } from '../three/SchematicScenes'

const MODES: { id: F04Mode; label: string; cap: string; detail: string }[] = [
  { id: 'before', label: 'Before · 抽象模型', cap: '优化器优化的，是一条没有槽轨的抽象路径', detail: '模型里只有一条理想路径：先抬、再移、再转。真实槽轨、滚轮、导向约束一个都没有，"槽轨"参数从未被使用。优化器在这条假路径上找到了"不撞"的解。' },
  { id: 'after', label: 'After · 补全机构', cap: '补上真实槽轨、滚轮与导向约束', detail: '把真实机构补进模型：槽轨实体、12 毫米槽宽、8 毫米滚轮、导向间隙，并让槽轨参与碰撞检查。模型的名字终于等于模型的内容。' },
  { id: 'why', label: 'Why Failed · 失败机制', cap: '翻折段槽轨扫过热床：穿透 45.338 mm²', detail: '折叠到后半程，槽轨实体扫过热床区域，重叠截面 45.338 平方毫米（平面投影口径）；搜遍 238 组参数也找不到不撞的解。原推荐因此撤回。镜头已推近撞击位置。' },
]

export function Ch4F04() {
  const { f04Mode, setF04Mode, f04T, setF04T, openEvidence } = useApp()
  const [view, setView] = useState<ViewMode>('full')
  const [sceneRef, inView] = useInView<HTMLDivElement>()
  const mode = MODES.find(m => m.id === f04Mode)!

  return (
    <section className="chapter" id="ch4">
      <div className="wrap">
        <div className="kicker">CHAPTER 04 · 第一次关键逆转</div>
        <h2 className="question">F04 曾被推荐。后来发现，模型本身不成立。</h2>
        <p className="lede">拖动进度看它"运动"，切换三个状态看它<b>为什么失败</b>。这不是优化器不够努力——是被优化的对象从一开始就缺了真实机构。</p>

        <div className="seg" style={{ marginBottom: 18 }}>
          {MODES.map(m => (
            <button key={m.id} className={`${f04Mode === m.id ? 'on' : ''} ${m.id === 'why' ? 'danger' : ''}`} onClick={() => setF04Mode(m.id)}>{m.label}</button>
          ))}
        </div>

        <div className="scene">
          <div className="scene-canvas" ref={sceneRef}>
            <span className="scene-badge">原理示意 · 按 candidates.json 与审查记录参数重建（F04 无 CAD 零件）</span>
            <F04Scene t={f04T} mode={f04Mode} view={view} active={inView} />
            <div className="scene-caption">
              <div className="cap-t">{mode.cap}</div>
              <div className="cap-d">{mode.detail}</div>
            </div>
          </div>
          <div className="vbar">
            <div className="seg">
              <button className={view === 'full' ? 'on' : ''} onClick={() => setView('full')}>整体视角</button>
              <button className={view === 'close' ? 'on danger' : ''} onClick={() => setView('close')}>干涉特写</button>
            </div>
            <span className="meta">运动进度</span>
            <input type="range" min={0} max={1} step={0.005} value={f04T} onChange={e => setF04T(Number(e.target.value))} aria-label="F04 运动进度" />
            <span className="meta mono">{Math.round(f04T * 100)}%</span>
          </div>
        </div>

        <p className="verdict-line">不是优化失败，而是建模对象错了。</p>

        <details className="expand">
          <summary>查看证据：缺失结构清单 · 审查时间线 · 独立审查原文</summary>
          <div className="expand-body">
            <table style={{ marginBottom: 16 }}>
              <thead><tr><th>真实结构</th><th>Before 抽象模型</th><th>After 补全后</th></tr></thead>
              <tbody>
                {['槽轨中心线（实体）', '槽宽 12 mm', '滚轮 Ø8 + 导向间隙', '槽轨 ↔ 热床碰撞对', '装配可达性约束'].map(n => (
                  <tr key={n}><td>{n}</td><td style={{ color: 'var(--red)', fontWeight: 700 }}>缺失</td><td style={{ color: 'var(--green)', fontWeight: 700 }}>已实例化</td></tr>
                ))}
              </tbody>
            </table>
            {F04_TIMELINE.map((t, i) => (
              <p key={i} style={{ margin: '6px 0' }}>
                <b style={{ color: i >= 4 ? 'var(--red)' : 'var(--ink)' }}>{t.step}：{t.value}</b>
                <span className="muted"> — {t.detail}</span>
                <button className="btn sm ghost" style={{ marginLeft: 10 }} onClick={() => openEvidence(t.source)}>证据</button>
              </p>
            ))}
          </div>
        </details>
      </div>
    </section>
  )
}
