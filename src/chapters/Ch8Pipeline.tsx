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
          <p>按零件清单（BOM），需要 PETG（一种更韧、耐反复拆装的打印材料）的零件共 23 种、133 件。其中销钉和卡圈是多套方案共用的，缺了会同时卡住所有路线；剪叉台架 SCZ 的专属件最多（44 件）。具体缺多少待"齐套"核查（逐件点数确认到齐）后回填；对策（补打 / 改排产 / 评估外购金属销与卡圈）待团队确认。</p>
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

        <div className="panel" style={{ margin: '26px 0' }}>
          <h3 style={{ fontSize: 24, marginBottom: 12 }}>装配后会穿模吗？——给组员的三层回答</h3>
          <div className="boundary-grid" style={{ margin: 0 }}>
            <div className="boundary-col ok">
              <h3>第一层 · 已排除：几何自撞</h3>
              <ul>
                <li>全行程 2001 步扫描：非允许接触对穿透 <b>0 处</b>；关键相位凸包保守检查全部确认。</li>
                <li>装配约束闭合 + 孔位真实存在性审计：<b>0 失败</b>。</li>
                <li>本轮 481 步独立复核（manifold 求体积）一致：冻结版四方案 0 穿透。</li>
              </ul>
            </div>
            <div className="boundary-col todo">
              <h3>第二层 · 未证明，但有测量阶梯</h3>
              <ul>
                <li>打印误差约 ±0.2–0.5 mm，远大于理论净距 0.007–0.023 mm——所以配合不按理论值做。</li>
                <li>试件阶梯实测选定：孔 Ø5.2/5.3/5.4/5.5 vs 销 Ø5.0；<b>转动顺滑且径向晃动 ≤0.3 mm</b> 才合格。</li>
                <li>滑槽侧隙 ≤0.4 mm、铰链末端间隙 ≥0.2 mm、卡圈 10 次拆装不裂。</li>
              </ul>
            </div>
            <div className="boundary-col ok" style={{ borderTopColor: 'var(--blue)' }}>
              <h3 style={{ color: 'var(--blue)' }}>第三层 · 兜底：失败在最便宜的阶段</h3>
              <ul>
                <li>顺序：先试片 → 后台架 → 最后整机。</li>
                <li>SCZ 回差 &gt;0.15 mm 或低位卡滞 → 停；F09 左右差 &gt;0.15 mm 别卡 → 停；F07 超限 → 切 F08。</li>
                <li>即使装配后发现问题，代价是几克耗材和几小时，不是整台整机和六周。</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: 20, marginTop: 14 }}>
            闭环：选定间隙<b>写回参数 → 重新生成正式件 → 复跑 L1–L3</b>。任何配合修改都重新过运动与装配检查，不是"把画面调对"。
          </p>
          <p style={{ fontSize: 20, marginTop: 8, color: 'var(--muted)' }}>
            发现干涉是证据产出，不是努力白费：14 处历史版本回放的实体干涉已定位到时间区间、零件对、交集体积与归因；被淘汰的方案带着完整失败记录归档，是下次复评的起点。
          </p>
          <div className="evidence-row">
            <button className="btn sm ghost" onClick={() => openEvidence('assemblyrisk')}>查看装配风险简报</button>
            <button className="btn sm ghost" onClick={() => openEvidence('cadmotion')}>运动与装配验证报告</button>
          </div>
        </div>

        <div className="boundary-grid">
          <div className="boundary-col ok">
            <h3>已通过 CAD / 仿真验证</h3>
            <ul>
              <li>运动学相位、限位与防呆顺序</li>
              <li>2001 步采样 + 凸包保守无碰撞</li>
              <li>装配约束闭合检查 + 孔位真实存在性审计（第 6 版新增）</li>
              <li>数学可证明的连续碰撞检查（简化包围盒模型）</li>
            </ul>
          </div>
          <div className="boundary-col todo">
            <h3>必须靠实物回答</h3>
            <ul>
              <li><b>F09 刚性同步杆 ≠ 原双丝杆+同步带性能</b></li>
              <li><b>SCZ 手动剪叉 ≠ 丝杆推力与效率</b></li>
              <li>打印配合：3D 打印误差约 ±0.2–0.5 毫米，而设计间隙只有 0.007–0.023 毫米</li>
              <li>摩擦与卡滞、承载刚度、寿命、折叠前后同一模型打印对照</li>
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
