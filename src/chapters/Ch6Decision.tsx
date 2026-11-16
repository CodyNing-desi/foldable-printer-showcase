import { ROBUST_TABLE, THIRD_COMPARE, QUAL_MATRIX, FINAL_BOARD } from '../data/analysis'
import { ELIM_BY_ID } from '../data/eliminations'
import { MOTIONS } from '../data/motion'
import { useApp } from '../state'
import { StatusBadge } from '../components/StatusBadge'
import { EliminationCard } from '../components/EliminationCard'
import { RiskCallout } from '../components/RiskCallout'
import { Icon } from '../components/Icons'
import type { Status } from '../data/types'

const MOTION_BY_BOARD: Record<string, string> = { F09_L82: 'F09_L82', F07: 'F07', SCZ: 'SCZ', F08: 'F08_OPTIONAL' }

const BOARD_STATUS: Record<string, Status> = {
  'F09_L82': 'conditional', F07: 'conditional', SCZ: 'bench', F08: 'fallback', F12: 'nogo',
}
const BOARD_COLOR: Record<string, string> = {
  'F09_L82': 'var(--st-conditional)', F07: 'var(--st-conditional)', SCZ: 'var(--st-bench)', F08: 'var(--st-fallback)', F12: 'var(--st-nogo)',
}

export function Ch6Decision() {
  const { openEvidence, openCandidate } = useApp()

  return (
    <section className="chapter" id="ch6">
      <div className="container">
        <div className="ch-kicker">CHAPTER 06 · 最终决策</div>
        <h2 className="ch-title">为什么最终不是简单选择综合前三名？</h2>
        <p className="ch-lead">
          选择规则在优化之前就冻结：<strong>只推荐权重扰动前三频率 ≥80%、且来自不同机构族的方案</strong>。
          工程决策还要回答：每条路线能为实物验证带来什么新证据，以及六周内造不造得出来。
        </p>

        <div className="dec-grid">
          <div className="panel">
            <h3>V1 权重扰动 100 次（selection.json）</h3>
            <table className="data">
              <thead><tr><th>候选</th><th>前三频率</th><th>基线分数（越低越好）</th><th>候选间 Pareto</th></tr></thead>
              <tbody>
                {ROBUST_TABLE.map(r => (
                  <tr key={r.id}>
                    <td><button className="ev-link" onClick={() => openCandidate(r.id)}>{r.id}</button> <span className="tiny muted">{r.family}</span></td>
                    <td className="num mono">{r.freq}</td>
                    <td className="num mono">{r.score.toFixed(4)}</td>
                    <td>{r.pareto ? '是' : '否（被支配）'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="small muted" style={{ margin: '10px 0 0' }}>
              F08 与 F07 同属根部翻折且在候选间 Pareto 中被支配，不与 F07 重复推荐；没有为了凑满三套而降低门槛。
              按分数排序会得到 F07/F08/F12——但 F08 证据重复、F12 六周造不出来。
            </p>
          </div>
          <div className="panel">
            <h3>第三项之争：F08 vs SCZ（THIRD_OPTION_DECISION.md）</h3>
            <table className="data">
              <thead><tr><th>指标（V1 口径）</th><th>F08 根部后移</th><th>SCZ 剪刀轴</th></tr></thead>
              <tbody>
                {THIRD_COMPARE.map(r => (
                  <tr key={r.metric}><td>{r.metric}</td><td>{r.f08}</td><td>{r.scz}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="small muted" style={{ margin: '10px 0 0' }}>
              按"最可能通过实物门槛"：F08 优先。按"每投入一元新增多少独立证据"：SCZ 优先。
              本阶段目标包含机构探索，故选 SCZ 为第三项、F08 为备选。
            </p>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 22 }}>
          <h3>设计决策矩阵 <span className="vtag">设计决策维度，而非仿真定量指标</span></h3>
          <div className="matrix-wrap">
            <table className="data">
              <thead>
                <tr><th>方案</th>{QUAL_MATRIX.cols.map(c => <th key={c}>{c}</th>)}<th>依据</th></tr>
              </thead>
              <tbody>
                {QUAL_MATRIX.rows.map(r => (
                  <tr key={r.id}>
                    <td><b>{r.id}</b></td>
                    {r.vals.map((v, i) => {
                      const level = v.startsWith('高') ? '高' : v.startsWith('中') ? '中' : v.startsWith('低') ? '低' : null
                      return <td key={i}>{level ? <span className={`qual-dot qual-${level}`}>{v}</span> : <span className="small">{v}</span>}</td>
                    })}
                    <td className="small muted">{r.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="tiny muted" style={{ margin: '10px 0 0' }}>
            定性判断来自仓库决策文件与 config 复杂度声明（F09 2.5 / F07 2.0 / SCZ 4.8 / F08 2.4 / F12 4.1），不是统一量化评分；收纳表现为 V3.2.1 同阶段数值。
          </p>
        </div>

        <RiskCallout tone="warn" title="读决策板前先记住缩比边界">
          下列"已验证"仅指 R1-V6 缩比 CAD 的运动与装配逻辑。F09 刚性同步杆不代表原双丝杆+同步带性能；SCZ 手动剪叉不代表丝杆推力与效率。整机性能结论一律待实物。
        </RiskCallout>

        <div className="board">
          {FINAL_BOARD.map(b => {
            const mot = MOTIONS.find(m => m.id === MOTION_BY_BOARD[b.id])
            return (
              <div className="board-card" key={b.id} style={{ borderTopColor: BOARD_COLOR[b.id] }}>
                <StatusBadge status={BOARD_STATUS[b.id]} label={b.status} />
                <h4>{b.id}</h4>
                <div className="role">{b.role} · V3.2.1 冻结</div>
                <div className="nums">
                  <span>收纳比 <b className="mono">{b.storage}</b></span>
                  <span>10 N Y 挠度 <b className="mono">{b.defl}</b></span>
                </div>
                <div className="bench"><b>台架验证：</b>{b.bench}</div>
                <div className="nogo"><b>停止/切换：</b>{b.nogo}</div>
                {mot ? (
                  <div className="board-boundary">
                    <div className="bb-ok"><Icon name="check" size={11} />已验证：{mot.decision.verified[0]}等 {mot.decision.verified.length} 项</div>
                    <div className="bb-bad"><Icon name="flask" size={11} />未验证：{mot.decision.notVerified[0]}等 {mot.decision.notVerified.length} 项</div>
                  </div>
                ) : (
                  <div className="board-boundary">
                    <div className="bb-bad"><Icon name="stop" size={11} />不制造；仿真结论与风险记录归档</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="scz-callout">
          SCZ 不是因为所有指标最优秀而入围，而是因为它提供了另一种机构路线最需要被实物验证的问题——
          低位输入力比、双向回差、左右同步与非线性 Z 映射。它只做台架，不做整机主力。
        </div>

        <div className="dec-scope-cards">
          <EliminationCard e={ELIM_BY_ID['F08']} compact />
          <EliminationCard e={ELIM_BY_ID['SCZ']} compact />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
          <button className="ev-link" onClick={() => openEvidence('lineup321')}>V3.2.1 入围名单</button>
          <button className="ev-link" onClick={() => openEvidence('third')}>第三项决策原文</button>
          <button className="ev-link" onClick={() => openEvidence('final31')}>V3.1 Go/No-Go 门槛</button>
          <button className="ev-link" onClick={() => openEvidence('current')}>当前冻结决策</button>
        </div>
      </div>
    </section>
  )
}
