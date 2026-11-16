import { MFG_LADDER, MFG_ISSUES, PETG_SHARED, PETG_SCZ } from '../data/manufacturing'
import { useApp } from '../state'

export function Ch8Pipeline() {
  const { scrollTo, setStage, startAuto, openEvidence } = useApp()

  return (
    <section className="chapter" id="ch8">
      <div className="wrap">
        <div className="kicker">CHAPTER 08 · 走向实物</div>
        <h2 className="question">打印执行完了，制造问题没有结束</h2>
        <p className="lede">昨晚打印计划已执行完毕。但<b>打印执行完成 ≠ 零件齐套 ≠ 装配完成 ≠ 实验完成</b>。现场盘点：PETG 零件数量不足。</p>

        <div className="timeline">
          {MFG_LADDER.map((s, i) => (
            <div key={s.label} className={`tl-node ${s.state}`}>
              <div className="tl-dot">{s.state === 'done' ? '✓' : i + 1}</div>
              <div className="tl-body">
                <b>{s.label}</b>
                <span className={`tl-state ${s.state}`}>{s.state === 'done' ? '完成' : s.state === 'active' ? '进行中' : '待执行'}</span>
                <p>{s.note}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="issue-block">
          <h3>⚠ PETG 零件数量不足</h3>
          <p>BOM 口径 PETG 共 23 项 / 133 件。跨方案共享销/卡圈影响全部路线；SCZ 专属件最多（44 件）。具体缺口待齐套核查回填；对策（补打 / 改排产 / 金属销与 E 卡圈外购评估）待团队确认。</p>
          <details className="expand" style={{ marginTop: 14 }}>
            <summary>展开 BOM 明细与制造问题清单</summary>
            <div className="expand-body">
              <div className="boundary-grid" style={{ margin: '8px 0 16px' }}>
                <div>
                  <h3 style={{ fontSize: 19, marginBottom: 8 }}>跨方案共享 PETG 件</h3>
                  <table>
                    <thead><tr><th>零件</th><th>数量</th><th>共享范围</th></tr></thead>
                    <tbody>{PETG_SHARED.map(r => <tr key={r.part}><td>{r.part}</td><td className="num">{r.qty}</td><td className="meta">{r.scope}</td></tr>)}</tbody>
                  </table>
                </div>
                <div>
                  <h3 style={{ fontSize: 19, marginBottom: 8 }}>SCZ 专属 PETG 件（44 件）</h3>
                  <table>
                    <thead><tr><th>零件</th><th>数量</th></tr></thead>
                    <tbody>{PETG_SCZ.map(r => <tr key={r.part}><td>{r.part}</td><td className="num">{r.qty}</td></tr>)}</tbody>
                  </table>
                </div>
              </div>
              {MFG_ISSUES.map(issue => (
                <p key={issue.title} style={{ margin: '10px 0' }}>
                  <b>{issue.title}</b>（{issue.status}）<br />
                  <span className="muted">{issue.detail} 影响：{issue.affected} 对策：{issue.options}</span>
                </p>
              ))}
              <div className="evidence-row">
                <button className="btn sm ghost" onClick={() => openEvidence('cadprint')}>PRINT_PLAN_5_MACHINES</button>
                <button className="btn sm ghost" onClick={() => openEvidence('cadguide')}>ASSEMBLY_GUIDE</button>
              </div>
            </div>
          </details>
        </div>

        <div className="boundary-grid">
          <div className="boundary-col ok">
            <h3>已通过 CAD / 仿真验证</h3>
            <ul>
              <li>运动学相位、限位与防呆顺序</li>
              <li>2001 步采样 + 凸包保守无碰撞</li>
              <li>L2b 装配闭合 + 孔轴审计（V6）</li>
              <li>认证连续碰撞（V3.2.1 简化 OBB）</li>
            </ul>
          </div>
          <div className="boundary-col todo">
            <h3>必须靠实物回答</h3>
            <ul>
              <li><b>F09 刚性同步杆 ≠ 原双丝杆+同步带性能</b></li>
              <li><b>SCZ 手动剪叉 ≠ 丝杆推力与效率</b></li>
              <li>打印配合（FDM ±0.2–0.5 mm vs 净距 0.007–0.023 mm）</li>
              <li>摩擦/卡滞、承载刚度、寿命、同 G-code 打印对照</li>
            </ul>
          </div>
        </div>

        <div className="final-quote">让仿真决定值得测试什么，<br />让实物决定最终留下什么。</div>
        <div className="final-sub">从 15 种候选机构，到多轮模型审查，再到三条差异化实物验证路线。</div>
        <div className="final-actions">
          <button className="btn" onClick={() => { setStage('v321'); scrollTo('ch2') }}>返回方案总览</button>
          <button className="btn" onClick={() => openEvidence('index')}>查看技术证据</button>
          <button className="btn primary" onClick={startAuto}>重播演示</button>
        </div>
      </div>
    </section>
  )
}
