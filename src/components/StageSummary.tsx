import { AnimatePresence, motion } from 'framer-motion'
import type { Stage } from '../data/types'
import { REASON_META } from '../data/types'
import { useApp } from '../state'
import { Icon } from './Icons'
import { ReasonBadge } from './ReasonBadge'

export function StageSummary({ stage }: { stage: Stage }) {
  const { openCandidate, reduced } = useApp()
  const total = stage.reasonDist.reduce((s, r) => s + r.ids.length, 0)

  return (
    <div className="stage-summary">
      <AnimatePresence mode="wait">
        <motion.div
          key={stage.id}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <div className="ss-rule"><Icon name="flag" size={14} /><b>本阶段规则</b>{stage.rule}</div>

          <div className="ss-flows">
            {stage.eliminated.length > 0 && (
              <div className="ss-flow out">
                <span className="ss-flow-t"><Icon name="cross" size={12} />淘汰 / 出局</span>
                {stage.eliminated.map(id => (
                  <button key={id} className="ss-chip" onClick={() => openCandidate(id)}>{id}</button>
                ))}
              </div>
            )}
            {stage.entered.length > 0 && stage.id !== 's0' && (
              <div className="ss-flow in">
                <span className="ss-flow-t"><Icon name="check" size={12} />进入 / 回归</span>
                {stage.entered.map(id => (
                  <button key={id} className="ss-chip" onClick={() => openCandidate(id)}>{id}</button>
                ))}
              </div>
            )}
            {stage.revoked.length > 0 && (
              <div className="ss-flow revoke">
                <span className="ss-flow-t"><Icon name="star" size={12} />推荐撤回</span>
                {stage.revoked.map(id => (
                  <button key={id} className="ss-chip" onClick={() => openCandidate(id)}>{id}</button>
                ))}
              </div>
            )}
            {stage.id === 's0' && (
              <div className="ss-flow in">
                <span className="ss-flow-t"><Icon name="dot" size={12} />全部候选</span>
                <span className="ss-chip static">15 套机构构想进入统一评价</span>
              </div>
            )}
          </div>

          {total > 0 && (
            <div className="ss-reasons">
              <span className="ss-flow-t">淘汰原因分布</span>
              <div className="ss-bar">
                {stage.reasonDist.map(r => (
                  <div key={r.cat} className="ss-bar-seg" style={{ width: `${(r.ids.length / total) * 100}%`, background: REASON_META[r.cat].color }} title={`${REASON_META[r.cat].label}：${r.ids.join('、')}`} />
                ))}
              </div>
              <div className="ss-reason-list">
                {stage.reasonDist.map(r => (
                  <span key={r.cat} className="ss-reason-item">
                    <ReasonBadge cat={r.cat} />
                    <span className="mono">{r.ids.length}</span>
                    <span className="muted tiny">{r.ids.join(' ')}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="ss-lesson"><Icon name="zoom" size={14} /><span>{stage.lesson}</span></div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
