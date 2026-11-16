import { useApp } from '../state'

const PIPE = [
  { label: '方案筛选', state: 'done', note: '15 候选 · 7 阶段' },
  { label: '仿真审查', state: 'done', note: '两轮独立审查 + 认证上界' },
  { label: 'CAD 修正', state: 'done', note: 'R1-V5 → R1-V6' },
  { label: '实物打印', state: 'active', note: 'L4 试件 + 正式零件排产/执行中' },
  { label: '装配验证', state: 'pending', note: '结果待回填' },
  { label: '最终选型', state: 'pending', note: '由实物闸门决定' },
]

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
        <h2 className="ch-title">当前进度：CAD 已冻结，实物正在打印</h2>
        <p className="ch-lead">
          R1-V6 完成并经独立审查修复；L4 接口试件与正式零件已进入打印排产/执行阶段（五机排产计划）。
          实物装配与测试结果仍待回填——<strong>仿真到此为止，剩下的问题交给实物</strong>。
        </p>

        <div className="pipe">
          {PIPE.map(p => (
            <div key={p.label} className={`pipe-step ${p.state === 'done' ? 'done' : ''} ${p.state === 'active' ? 'active-step' : ''}`}>
              <div className="dot" />
              <b>{p.label}</b>
              <span>{p.state === 'done' ? '已完成 · ' : p.state === 'active' ? '进行中 · ' : '待执行 · '}{p.note}</span>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 18, margin: '26px 0 14px' }}>V5 独立审查 → V6 修复（保留问题记录，不删除失败版本）</h3>
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
          <button className="ev-link" onClick={() => openEvidence('cadprint')}>PRINT_PLAN_5_MACHINES.md</button>
          <button className="ev-link" onClick={() => openEvidence('cadguide')}>ASSEMBLY_GUIDE.md</button>
          <button className="ev-link" onClick={() => openEvidence('cadmotion')}>MOTION_VALIDATION_REPORT.md</button>
        </div>

        <div className="panel" style={{ marginTop: 26 }}>
          <h3>已验证 vs 待实物验证</h3>
          <div className="dec-grid" style={{ gap: 16 }}>
            <ul className="reason-list">
              <li><b>已验证（CAD/仿真级）：</b>运动学相位与限位、2001 步密集采样无穿透、关键相位凸包保守检查、L2b 装配约束闭合与孔轴审计、认证连续碰撞（V3.2.1 简化 OBB 模型）。</li>
              <li><b>证据边界：</b>认证净距 0.007–0.023 mm 为 OBB 理论值，不覆盖 FDM ±0.2–0.5 mm 公差；演示模型配合间隙按 0.3/0.4 mm 设计，须试件冻结。</li>
            </ul>
            <ul className="reason-list">
              <li><b>待实物验证：</b>真实打印配合（L4 试件）、摩擦/间隙/卡滞、承载与刚度、寿命、双侧同步误差、SCZ 低位推力与双向回差、折叠前后同 G-code 打印对照。</li>
              <li><b>闸门规则：</b>SCZ 回差 &gt;0.15 mm 或低位卡滞即终止；F09 左右高度差 &gt;0.15 mm 别卡即停；F07 挠度/重复定位超限切 F08。</li>
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
