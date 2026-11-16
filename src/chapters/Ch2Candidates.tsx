import { useEffect, useRef } from 'react'
import { LayoutGroup } from 'framer-motion'
import { CANDIDATES } from '../data/candidates'
import { STAGES, STAGE_BY_ID } from '../data/stages'
import { EV_BY_ID } from '../data/evidence'
import type { StageId } from '../data/types'
import { useApp } from '../state'
import { CandidateCard } from '../components/CandidateCard'

const STEP_TEXT: Record<StageId, { title: string; body: string }> = {
  s0: { title: '起点：15 种机构构想', body: '根部翻折、横臂、伸缩、槽轨、外部托架、箱体、抽屉、剪叉分别实例化。未知尺寸显式写成假设，不冒充实测。此时所有卡片都是"未验证"。' },
  v1pre: { title: 'V1 统一初筛（返工前）', body: '31 姿态 + 抽象优化。名义通过 6 套；F04 名义失败却在抽象模型里"通过"，一度与 F07 一起被推荐。注意：这个推荐后来被撤回。' },
  v1fix: { title: '独立审查 → 模型修正', body: 'F04 补全槽轨后穿透 45.338 mm²、优化无可行解；F11/F14 补全联动后失败。推荐变为 F07+F12；SCZ 为探索第三项，F08 为工程备选。' },
  v2: { title: 'V2：升级到三维检查', body: 'OBB/SAT 三维运动学。F09 双柱龙门首次通过（0.784）——它是被后续设计"引入"名单的，不是早期入围者。F12 收纳比 0.856 失败。' },
  v3: { title: 'V3：附件包络 + 扫掠', body: '计入料盘/电源/工具后格局再变：F07 一度失败（0.910），F05/F13 构型修订后通过，F12 优化预紧版重新通过。筛选不是单向删除卡片。' },
  v31: { title: 'V3.1：实物决选', body: '不再按单一分数排序。F09/F07/SCZ 获 Conditional Go，F08 备选；F12 因六周精密套筒风险、F04 因全域 0/238 可行被 No-Go。' },
  v321: { title: 'V3.2.1：冻结名单', body: '认证连续碰撞复核：F09 以 lift=82 降到 0.786 过门槛。卡片重组为：主候选 F09/F07、探索台架 SCZ、工程备选 F08、No-Go 及归档其余。点击任意卡片查看完整证据链。' },
}

const AUTO_HL: Record<number, string[]> = {
  2: ['F04', 'F07'], 3: ['F04', 'F11', 'F14'], 5: ['F09'], 6: ['F07', 'F12'],
  8: ['F09', 'F07', 'SCZ', 'F08', 'F12'], 9: ['F09', 'F07', 'SCZ', 'F08', 'F12'],
}

export function Ch2Candidates() {
  const { stage, setStage, auto, openEvidence } = useApp()
  const stepsRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef(stage)
  stageRef.current = stage
  const autoRef = useRef(auto.active)
  autoRef.current = auto.active

  useEffect(() => {
    const root = stepsRef.current
    if (!root) return
    const blocks = Array.from(root.querySelectorAll<HTMLElement>('.step-block'))
    const ob = new IntersectionObserver(entries => {
      if (autoRef.current) return
      for (const en of entries) {
        if (en.isIntersecting) {
          const sid = (en.target as HTMLElement).dataset.stage as StageId
          if (sid && sid !== stageRef.current) setStage(sid)
        }
      }
    }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 })
    blocks.forEach(b => ob.observe(b))
    return () => ob.disconnect()
  }, [setStage])

  const info = STAGE_BY_ID[stage]
  const hl = auto.active ? AUTO_HL[auto.index] ?? [] : []
  const isFinal = stage === 'v321'

  return (
    <section className="chapter" id="ch2">
      <div className="container">
        <div className="ch-kicker">CHAPTER 02 · 15种候选方案</div>
        <h2 className="ch-title">同一组候选，随真实筛选改变状态</h2>
        <p className="ch-lead">
          滚动右侧叙事步骤，或直接点击阶段标签。卡片状态全部来自仓库真实结果——
          <strong>淘汰发生在什么阶段、依据是什么</strong>，都写在卡片上；点击卡片打开证据面板。
        </p>

        <div className="stage-pills" role="tablist" aria-label="筛选阶段">
          {STAGES.map(s => (
            <button key={s.id} role="tab" aria-selected={stage === s.id}
              className={`stage-pill ${stage === s.id ? 'active' : ''}`}
              onClick={() => setStage(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="stage-info">
          <span className="ver mono">{info.version}</span>
          <span className="sum">{info.summary}</span>
          <span className="evs">
            {info.evidence.map(id => (
              <button key={id} className="ev-link" onClick={() => openEvidence(id)}>{EV_BY_ID[id]?.title ?? id}</button>
            ))}
          </span>
        </div>

        <div className="scrolly">
          <div className="scrolly-sticky">
            <LayoutGroup>
              {isFinal ? (
                <div className="final-groups">
                  <div>
                    <div className="fgroup-label">主候选 · Conditional Go</div>
                    <div className="fgroup-row" style={{ gridTemplateColumns: 'repeat(2, minmax(0,1fr))' }}>
                      <CandidateCard id="F09" highlight={hl.includes('F09')} />
                      <CandidateCard id="F07" highlight={hl.includes('F07')} />
                    </div>
                  </div>
                  <div>
                    <div className="fgroup-label">探索台架 · Bench-only ／ 工程备选 · Fallback</div>
                    <div className="fgroup-row" style={{ gridTemplateColumns: 'repeat(2, minmax(0,1fr))' }}>
                      <CandidateCard id="SCZ" highlight={hl.includes('SCZ')} />
                      <CandidateCard id="F08" highlight={hl.includes('F08')} />
                    </div>
                  </div>
                  <div>
                    <div className="fgroup-label">No-Go 及归档</div>
                    <div className="fgroup-archive">
                      {CANDIDATES.filter(c => !['F09', 'F07', 'SCZ', 'F08'].includes(c.id)).map(c => (
                        <CandidateCard key={c.id} id={c.id} compact highlight={hl.includes(c.id)} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="cand-grid">
                  {CANDIDATES.map(c => (
                    <CandidateCard key={c.id} id={c.id} highlight={hl.includes(c.id)} />
                  ))}
                </div>
              )}
            </LayoutGroup>
          </div>
          <div className="scrolly-steps" ref={stepsRef}>
            {STAGES.map(s => (
              <div className="step-block" data-stage={s.id} key={s.id}>
                <div className={`step-card ${stage === s.id ? 'active' : ''}`}>
                  <h4>{STEP_TEXT[s.id].title}</h4>
                  <p>{STEP_TEXT[s.id].body}</p>
                  <div className="ver mono">{s.version}</div>
                  <div className="ver" style={{ marginTop: 4 }}>结果类型：{s.resultType}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
