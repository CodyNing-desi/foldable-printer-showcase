import { useApp } from '../state'
import { ManufacturingLadder, ManufacturingIssues, VerificationBoundary } from '../components/ManufacturingPanel'
import { Icon } from '../components/Icons'

const FIXES = [
  { tag: 'P0-1', title: 'F09 中央 X 臂真实铰接', body: 'V5 臂悬空于 y=0，仅动画对齐；V6 零件级 CAD：中横梁 BRG 抬高并加中央叉耳，X 臂物理铰接。', ev: 'L2b 闭合径向/轴线误差 ~0；孔轴审计 BRG/ARM 孔存在' },
  { tag: 'P0-2', title: 'SCZ 顶横轴随顶滑块', body: 'V5 顶横轴 SHT 置于固定 fix_x，不穿过顶滑块；V6 改随 sx 移动，复审整条剪叉运动链。', ev: 'L2b sht_slt 刚体相对位姿不变、导路偏移 ~0' },
  { tag: 'P0-3', title: '装配约束闭合检查', body: 'V5 只有"2001 步无穿透"；V6 新增 L2b：连接一致/轴线共线/销孔接口/导路保持/刚体位姿/全行程闭合 + CAD 孔轴审计。', ev: '各方案闭合失败 0、孔缺失 0、销孔合格' },
  { tag: '附加', title: 'F08 L 槽相位顺序化', body: 'V5 抬升与后移相位重叠致根销对角卡滞；V6 改抬升 0.20–0.40 → 后移 0.40–0.55 → 后翻 0.55–0.95。', ev: 'L2b root_slot 路径偏移 ~0' },
]

export function Ch8Pipeline() {
  const { scrollTo, setStage, startAuto, openEvidence } = useApp()

  return (
    <section className="chapter" id="ch8">
      <div className="container">
        <div className="ch-kicker">CHAPTER 08 · 从仿真走向实物</div>
        <h2 className="ch-title">打印执行完了，但制造问题没有结束</h2>
        <p className="ch-lead">
          昨晚打印计划已执行完毕——但<strong>打印执行完成 ≠ 零件齐套 ≠ 装配完成 ≠ 实验完成</strong>。
          现场盘点发现 PETG 零件数量不足等实际制造问题。这一章把执行状态拆开，把问题摆上桌。
        </p>

        <ManufacturingLadder />

        <div className="ch8-split">
          <ManufacturingIssues />
          <div>
            <h3 style={{ fontSize: 18, margin: '0 0 14px' }}>V5 独立审查 → V6 修复（保留问题记录，不删除失败版本）</h3>
            <div className="fix-grid">
              {FIXES.map(f => (
                <div className="fix-card" key={f.tag}>
                  <span className="tag">{f.tag}</span>
                  <h4>{f.title}</h4>
                  <p>{f.body}</p>
                  <span className="ev">证据：{f.ev}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="ev-link" onClick={() => openEvidence('cadchangelog')}>CHANGELOG_V5_V6.md</button>
              <button className="ev-link" onClick={() => openEvidence('cadmotion')}>MOTION_VALIDATION_REPORT.md</button>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: 18, margin: '30px 0 14px' }}><Icon name="eye" size={16} /> 当前模型已验证 / 未验证的清晰边界</h3>
        <VerificationBoundary />

        <div className="panel" style={{ marginTop: 22 }}>
          <h3>下一步实验重点（闸门规则不变）</h3>
          <ul className="reason-list">
            <li><b>先齐套：</b>PETG 缺口盘点 → 补打/改排产决策 → L4 试件试配冻结配合间隙。</li>
            <li><b>SCZ：</b>回差 &gt;0.15 mm 或低位卡滞即终止；<b>F09：</b>左右高度差 &gt;0.15 mm 别卡即停；<b>F07：</b>挠度/重复定位超限切 F08。</li>
            <li><b>最终对照：</b>通过闸门的 1–2 套方案组装完整打印机，折叠前后同一 G-code 各三次打印对照。</li>
          </ul>
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
