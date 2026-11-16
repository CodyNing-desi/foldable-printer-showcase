import { MFG_LADDER, MFG_ISSUES, PETG_SHARED, PETG_SCZ } from '../data/manufacturing'
import { useApp } from '../state'
import { Icon } from './Icons'
import { RiskCallout } from './RiskCallout'

export function ManufacturingLadder() {
  return (
    <div className="mfg-ladder">
      {MFG_LADDER.map((s, i) => (
        <div key={s.label} className={`mfg-step ${s.state}`}>
          <div className="mfg-dot">
            {s.state === 'done' ? <Icon name="check" size={12} /> : s.state === 'active' ? <Icon name="clock" size={12} /> : <span>{i + 1}</span>}
          </div>
          <div className="mfg-body">
            <b>{s.label}</b>
            <span className={`mfg-state st-${s.state}`}>{s.state === 'done' ? '完成' : s.state === 'active' ? '进行中' : '待执行'}</span>
            <p>{s.note}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ManufacturingIssues() {
  const { openEvidence } = useApp()
  return (
    <div className="mfg-issues">
      <div className="mfg-issues-head">
        <h3><Icon name="wrench" size={16} />现实制造问题 · Manufacturing Issues</h3>
        <span className="tiny muted">口径：团队现场盘点（2026-11-16）+ MASTER_PARTS_BOM.csv（R1-V6）</span>
      </div>
      {MFG_ISSUES.map(issue => (
        <div className="issue-card" key={issue.title}>
          <div className="issue-title"><Icon name="alert" size={14} />{issue.title}<span className="issue-status">{issue.status}</span></div>
          <p className="small">{issue.detail}</p>
          <div className="issue-kv"><span>影响范围</span><p className="small muted">{issue.affected}</p></div>
          <div className="issue-kv"><span>可选对策</span><p className="small muted">{issue.options}</p></div>
        </div>
      ))}
      <div className="petg-tables">
        <div className="panel">
          <h3 className="small">跨方案共享 PETG 件（缺口影响全部路线）</h3>
          <table className="data">
            <thead><tr><th>零件</th><th>BOM 数量</th><th>共享范围</th></tr></thead>
            <tbody>
              {PETG_SHARED.map(r => <tr key={r.part}><td>{r.part}</td><td className="num mono">{r.qty}</td><td className="tiny">{r.scope}</td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h3 className="small">SCZ 专属 PETG 件（44 件，受影响最大）</h3>
          <table className="data">
            <thead><tr><th>零件</th><th>BOM 数量</th></tr></thead>
            <tbody>
              {PETG_SCZ.map(r => <tr key={r.part}><td>{r.part}</td><td className="num mono">{r.qty}</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="ev-link" onClick={() => openEvidence('cadprint')}>PRINT_PLAN_5_MACHINES.md</button>
        <button className="ev-link" onClick={() => openEvidence('cadguide')}>ASSEMBLY_GUIDE.md</button>
        <button className="ev-link" onClick={() => openEvidence('cadlimits')}>MODEL_LIMITATIONS.md</button>
      </div>
    </div>
  )
}

export function VerificationBoundary() {
  return (
    <div className="boundary">
      <div className="panel boundary-col ok">
        <h3><Icon name="check" size={15} />已通过 CAD / 仿真证据验证</h3>
        <ul className="reason-list">
          <li>运动学相位、限位与防呆顺序（V3.2.1 冻结参数 ×0.5）</li>
          <li>2001 步密集采样无穿透 + 关键相位扫掠凸包保守检查</li>
          <li>L2b 装配约束闭合 + CAD 孔轴审计（V6 新增，闭合失败 0）</li>
          <li>认证连续碰撞（V3.2.1 简化 OBB 模型，解析运动上界）</li>
          <li>F09 中央 X 臂真实铰接、SCZ 顶横轴随动（V6 零件级修复）</li>
        </ul>
      </div>
      <div className="panel boundary-col bad">
        <h3><Icon name="flask" size={15} />必须靠实物回答的问题</h3>
        <ul className="reason-list">
          <li>真实打印配合（L4 试件）：FDM ±0.2–0.5 mm 公差 vs 认证净距 0.007–0.023 mm</li>
          <li>摩擦 / 间隙 / 卡滞；承载刚度；寿命；锁紧衰减</li>
          <li>F09 双侧同步误差、SCZ 低位推力与双向回差、F07 单柱抗扭</li>
          <li>折叠前后同一 G-code 打印对照（20 次展开重复定位）</li>
        </ul>
      </div>
      <RiskCallout tone="danger" title="两条不能越过的边界">
        <p><b>F09 刚性同步杆 ≠ 原双丝杆+同步带同步性能验证</b>：载荷分配、消回差、同步误差均未验证。</p>
        <p><b>SCZ 手动剪叉 ≠ 丝杆推力与真实效率验证</b>：不演示丝杆推力、效率、自锁；无载荷摩擦不代表真实输入推力。</p>
      </RiskCallout>
    </div>
  )
}
