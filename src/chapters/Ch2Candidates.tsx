import { useEffect, useRef, useState } from 'react'
import { CANDIDATES } from '../data/candidates'
import { STAGES, STAGE_BY_ID, stageStatus } from '../data/stages'
import { STATUS_META } from '../data/types'
import type { StageId } from '../data/types'
import { useApp } from '../state'
import { MechanismViewer, webglAvailable } from '../three/MechanismViewer'
import { FramePlayer } from '../components/FramePlayer'

const FOCUS: Record<StageId, string> = {
  s0: 'F09_L82', v1pre: 'F07', v1fix: 'F07', v2: 'F09_L82', v3: 'F07', v31: 'F09_L82', v321: 'F09_L82',
}

const STEP_TEXT: Record<StageId, { title: string; body: string }> = {
  s0: { title: '15 种机构构想', body: '根部翻折、横臂、伸缩、槽轨、外部托架、箱体、抽屉、剪叉。未知尺寸显式写成假设。此时没有一套被验证。' },
  v1pre: { title: 'V1 统一初筛', body: '31 姿态名义筛选：6 套通过。F04 名义失败，却在抽象优化里"通过"，一度与 F07 并列推荐——这是第一个陷阱。' },
  v1fix: { title: '独立审查修正', body: 'F04 没有真实槽轨。补全后穿透 45.338 mm²、无可行解，推荐撤回。F11/F14 补全联动后也失败。' },
  v2: { title: 'V2 三维检查', body: 'F09 双柱龙门首次通过（0.784）。它是被后续设计引入名单的，不是早期入围者。F12 收纳比 0.856 失败。' },
  v3: { title: 'V3 附件包络', body: '计入料盘/电源/工具后：F07 一度出局（0.910），F12 优化版回归（0.735）。筛选不是单向删除卡片。' },
  v31: { title: 'V3.1 实物决选', body: '不再按分数排序。F09/F07/SCZ 获 Conditional Go；F12 因六周制造风险、F04 因全域 0/238 被 No-Go。' },
  v321: { title: 'V3.2.1 冻结', body: '认证连续碰撞复核。F09 抬升 85→82 才过 0.800 门槛。最终：两主候选 + 一台架 + 一备选。' },
}

export function Ch2Candidates() {
  const { stage, setStage, openCandidate, auto } = useApp()
  const stepsRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef(stage); stageRef.current = stage
  const autoRef = useRef(auto.active); autoRef.current = auto.active
  const [hasGL] = useState(webglAvailable)
  const [pose, setPose] = useState(0)

  useEffect(() => {
    const root = stepsRef.current
    if (!root) return
    const blocks = Array.from(root.querySelectorAll<HTMLElement>('.step'))
    const ob = new IntersectionObserver(es => {
      if (autoRef.current) return
      for (const en of es) if (en.isIntersecting) {
        const sid = (en.target as HTMLElement).dataset.stage as StageId
        if (sid && sid !== stageRef.current) setStage(sid)
      }
    }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 })
    blocks.forEach(b => ob.observe(b))
    return () => ob.disconnect()
  }, [setStage])

  const info = STAGE_BY_ID[stage]
  const focus = FOCUS[stage]

  return (
    <section className="chapter" id="ch2">
      <div className="wrap">
        <div className="kicker">CHAPTER 02 · 候选与筛选</div>
        <h2 className="question">15 进 4，不是一条直线</h2>
        <p className="lede">滚动看七个真实阶段。画面里的机构随阶段切换；<b>谁出局、谁进入、谁的推荐被撤回</b>，写在画面下方。点击底部任意编号查看完整证据链。</p>

        <div className="seg" style={{ marginBottom: 22, flexWrap: 'wrap' }}>
          {STAGES.map(s => (
            <button key={s.id} className={stage === s.id ? 'on' : ''} onClick={() => setStage(s.id)} style={{ fontSize: 16, padding: '8px 16px' }}>{s.label}</button>
          ))}
        </div>

        <div className="scrolly">
          <div className="scrolly-visual">
            <div className="scene">
              <div className="scene-canvas" style={{ height: 'min(58vh, 620px)' }}>
                <span className="scene-badge">{focus} · 当前阶段展示机构</span>
                {hasGL ? (
                  <MechanismViewer cand={focus} ctrl={{ t: pose, explode: 0, xray: false, isolate: null, selected: null, traces: false, labels: false, preset: 'iso', presetToken: 0 }} onSelect={() => {}} onFallback={() => {}} className="viewer-fill" />
                ) : <FramePlayer cand={focus} />}
                <div className="scene-caption">
                  <div className="cap-t">{info.label}：{info.lesson}</div>
                </div>
              </div>
              <div className="vbar">
                <span className="meta">姿态</span>
                <input type="range" min={0} max={1} step={0.005} value={pose} onChange={e => setPose(Number(e.target.value))} aria-label="机构姿态" />
              </div>
            </div>
            <div className="stage-line">
              {info.eliminated.length > 0 && <><span className="tag out">淘汰 {info.eliminated.join(' ')}</span></>}
              {info.entered.length > 0 && stage !== 's0' && <span className="tag in">进入 {info.entered.join(' ')}</span>}
              {info.revoked.length > 0 && <span className="tag rev">撤回 {info.revoked.join(' ')}</span>}
              {stage === 's0' && <span className="tag in">15 套全部进入统一评价</span>}
            </div>
          </div>
          <div className="steps" ref={stepsRef}>
            {STAGES.map(s => (
              <div className="step" data-stage={s.id} key={s.id}>
                <div className={`step-card ${stage === s.id ? 'on' : ''}`}>
                  <h3>{STEP_TEXT[s.id].title}</h3>
                  <p>{STEP_TEXT[s.id].body}</p>
                  <span className="meta">{s.version} · {s.resultType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="index-strip" aria-label="15 候选索引">
          {CANDIDATES.map(c => {
            const cell = stageStatus(stage, c.id)
            const dim = ['fail', 'archived', 'nogo'].includes(cell.status)
            return (
              <button key={c.id} className={`idx ${dim ? 'dim' : ''} ${focus === c.id || (c.id === 'F09' && focus === 'F09_L82') ? 'focus' : ''}`} onClick={() => openCandidate(c.id)} title={cell.note}>
                <b>{c.id}</b><span>{c.name}</span>
                <i className="st" style={{ background: STATUS_META[cell.status].color }} />
              </button>
            )
          })}
        </div>
        <p className="meta" style={{ marginTop: 10 }}>状态点颜色：绿=通过 · 琥珀=曾被推荐/有条件 · 紫=台架 · 蓝=备选 · 红=No-Go · 灰=归档/未验证。点击编号打开证据抽屉。</p>
      </div>
    </section>
  )
}
