import { useEffect, useRef, useState } from 'react'
import { CANDIDATES } from '../data/candidates'
import { STAGES, STAGE_BY_ID, stageStatus } from '../data/stages'
import { STATUS_META } from '../data/types'
import type { StageId } from '../data/types'
import { useApp, useCtrl, useInView } from '../state'
import { VersionStrip } from '../components/VersionStrip'
import { MechanismViewer, webglAvailable } from '../three/MechanismViewer'
import { FramePlayer } from '../components/FramePlayer'

const FOCUS: Record<StageId, string> = {
  s0: 'F09_L82', v1pre: 'F07', v1fix: 'F07', v2: 'F09_L82', v3: 'F07', v31: 'F09_L82', v321: 'F09_L82',
}

const STEP_TEXT: Record<StageId, { title: string; body: string }> = {
  s0: { title: '起点：15 种折叠思路', body: '先把"打印机怎么折"想成 15 种不同机构：折根部、缩立柱、剪叉、抽屉、装箱……所有尺寸假设都写明。此时没有任何一种被验证过。' },
  v1pre: { title: '第一轮统一考试', body: '15 套机构用同一套规则检查：折叠过程会不会自己撞自己、折起来够不够小、展开后够不够打印。6 套及格。F04 本该不及格，却在一个简化过头的模型里拿了满分，一度被推荐——第一个陷阱。' },
  v1fix: { title: '独立审查：模型作弊被抓', body: '请项目外的人逐行查代码，发现 F04 的"槽轨"根本不存在，只是一条理想路径。补上真实槽轨后它立刻撞床、无解，推荐被撤回。F11 的箱盖、F14 的第二段动作此前也没建模，补全后同样不及格。' },
  v2: { title: '换三维尺子再量一遍', body: '从平面投影升级到真实三维碰撞检查。双柱龙门 F09 第一次及格——它是后来靠设计改进进入名单的，不是一开始就在。F12 因为折起来还是太大而出局。' },
  v3: { title: '把行李也算进体积', body: '收纳不能只算机器本体：料盘、电源、工具都要一起带走。算上附件后 F07 一度出局，F12 改了结构又回来。筛选不是一路删卡片，而是有人出去、有人回来。' },
  v31: { title: '决定造哪几套', body: '不再按总分排序，而是问：六周内造得出来吗？造出来能回答什么新问题？结论：F09、F07 造整机验证，SCZ 只造台架，F08 留作备选；F12、F04 停止。' },
  v321: { title: '最终冻结名单', body: '用数学上可证明的连续碰撞检查复核所有方案。F09 把抬升高度从 85 毫米微调到 82 毫米才真正过线。最终：两套主候选、一套台架、一套备选。' },
}

export function Ch2Candidates() {
  const { stage, setStage, openCandidate, openEvidence, auto } = useApp()
  const stepsRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef(stage); stageRef.current = stage
  const autoRef = useRef(auto.active); autoRef.current = auto.active
  const [hasGL] = useState(webglAvailable)
  const [sceneRef, inView] = useInView<HTMLDivElement>()
  const { ctrl, setCtrl } = useCtrl()

  useEffect(() => {
    const vmap: Record<StageId, string> = { s0: 'v1', v1pre: 'v1', v1fix: 'v1', v2: 'v2', v3: 'v3', v31: 'v321', v321: 'v321' }
    setCtrl({ version: vmap[stage], t: 0, playing: true, explode: 0, isolate: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

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
              <div className="scene-canvas" style={{ height: 'min(58vh, 620px)' }} ref={sceneRef}>
                <span className="scene-badge">{focus} · 当前阶段展示机构</span>
                {hasGL ? (
                  <MechanismViewer cand={focus} ctrl={{ t: ctrl.t, explode: 0, xray: false, isolate: null, selected: null, traces: false, labels: false, preset: 'iso', presetToken: 0, frameToken: 0, version: ctrl.version }} onSelect={() => {}} onFallback={() => {}} className="viewer-fill" active={inView} />
                ) : <FramePlayer cand={focus} />}
                <div className="scene-caption">
                  <div className="cap-t">{info.label}：{info.lesson}</div>
                </div>
              </div>
              <div className="vbar">
                <button className="play-btn" style={{ width: 42, height: 42, fontSize: 15 }} onClick={() => { if (!ctrl.playing && ctrl.t >= 1) setCtrl({ t: 0 }); setCtrl({ playing: !ctrl.playing }) }} aria-label={ctrl.playing ? '暂停' : '播放该版本折叠'}>{ctrl.playing ? '❚❚' : '▶'}</button>
                <input type="range" min={0} max={1} step={0.005} value={ctrl.t} onChange={e => setCtrl({ t: Number(e.target.value), playing: false })} aria-label="机构姿态" />
                <span className="meta mono">{Math.round(ctrl.t * 100)}%</span>
              </div>
            </div>
            <VersionStrip cand={focus} />
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
                  <button className="btn sm ghost" style={{ marginTop: 12 }} onClick={() => openEvidence(STAGE_BY_ID[s.id].evidence[0])}>查看本轮证据</button>
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
        <p className="legend-line">状态点：绿＝通过本轮检查；琥珀＝曾被推荐或有条件继续；紫＝只做台架；蓝＝备选；红＝停止；灰＝归档或未验证。点任意编号看完整理由与证据。</p>
      </div>
    </section>
  )
}
