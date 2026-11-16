import { ROBUST_TABLE, THIRD_COMPARE, FINAL_BOARD } from '../data/analysis'
import { useApp, assetUrl } from '../state'

const ROUTES = [
  { id: 'F09_L82', img: 'F09_L82', role: '主候选 1 · CONDITIONAL GO', color: 'var(--amber)', why: '刚度潜力最高（Y 挠度 0.1252 mm 最优）。双侧同步与横梁连接必须实物回答。', nums: '收纳比 0.786 · lift=82 才过 0.800 门槛' },
  { id: 'F07', img: 'F07', role: '主候选 2 · CONDITIONAL GO', color: 'var(--amber)', why: '结构最简、六周完成概率最高。代价：单柱抗扭与 0.021 mm 极小导向净距要实测。', nums: '收纳比 0.751 · Y 挠度 0.8166 mm' },
  { id: 'SCZ', img: 'SCZ', role: '主候选 3 · BENCH-ONLY', color: 'var(--violet)', why: '入围靠独立机构证据增益，不是分数：回差、同步、非线性 Z 映射是最大证据缺口。只做台架。', nums: '收纳比 0.503 · 回差 >0.15 mm 即终止' },
  { id: 'F08', img: 'F08_OPTIONAL', role: '备选 · FALLBACK', color: 'var(--blue)', why: '与 F07 同族、证据重复；最长边 897 mm 超便携。只在 F07/F09 台架失败时启用。', nums: '收纳比 0.616 · 前三频率 100%' },
]

export function Ch6Decision() {
  const { openEvidence, openCandidate } = useApp()

  return (
    <section className="chapter" id="ch6">
      <div className="wrap">
        <div className="kicker">CHAPTER 06 · 最终决策</div>
        <h2 className="question">为什么不是综合前三名？</h2>
        <p className="lede">规则在优化前就冻结：<b>稳健前三 ≥80% 且机构族不同</b>。按分数排会得到 F07/F08/F12——但 F08 证据重复、F12 六周造不出来。工程决策还要问：每条路线会带回什么新证据。</p>

        <div className="routes">
          {ROUTES.map(r => (
            <div className="route" key={r.id}>
              <img src={assetUrl(`assets/${r.img}/view_open.png`)} alt={`${r.id} 展开姿态（R1-V6 真实渲染）`} />
              <div className="r-body">
                <div className="r-role" style={{ color: r.color }}>{r.role}</div>
                <h3><button style={{ all: 'unset', cursor: 'pointer' }} onClick={() => openCandidate(r.id === 'F09_L82' ? 'F09' : r.id)}>{r.id}</button></h3>
                <p>{r.why}</p>
                <div className="r-nums mono">{r.nums}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="verdict-line" style={{ borderColor: 'var(--violet)' }}>
          SCZ 不是因为所有指标最优秀而入围，而是因为它提供了另一种机构路线最需要被实物验证的问题。
        </p>
        <p className="lede" style={{ marginBottom: 0 }}>
          F12 仿真 PASS 仍被工程 No-Go（见 Chapter 05）；F04 建模不成立被撤回（见 Chapter 04）。
          缩比 CAD 只验证运动与装配逻辑——F09 刚性同步杆 ≠ 原同步传动性能，SCZ 手动剪叉 ≠ 丝杆推力验证。
        </p>

        <details className="expand">
          <summary>查看证据：权重扰动 · F08/SCZ 对比 · V3.2.1 冻结状态板</summary>
          <div className="expand-body">
            <table style={{ marginBottom: 18 }}>
              <thead><tr><th>候选</th><th>前三频率（100 次扰动）</th><th>基线分数</th><th>候选间 Pareto</th></tr></thead>
              <tbody>{ROBUST_TABLE.map(r => <tr key={r.id}><td><b>{r.id}</b> <span className="meta">{r.family}</span></td><td className="num">{r.freq}</td><td className="num">{r.score.toFixed(4)}</td><td>{r.pareto ? '是' : '否（被支配）'}</td></tr>)}</tbody>
            </table>
            <table style={{ marginBottom: 18 }}>
              <thead><tr><th>指标（V1 口径）</th><th>F08</th><th>SCZ</th></tr></thead>
              <tbody>{THIRD_COMPARE.map(r => <tr key={r.metric}><td>{r.metric}</td><td>{r.f08}</td><td>{r.scz}</td></tr>)}</tbody>
            </table>
            <table>
              <thead><tr><th>方案</th><th>资格</th><th>收纳比</th><th>Y 挠度</th><th>停止/切换门槛</th></tr></thead>
              <tbody>{FINAL_BOARD.map(b => <tr key={b.id}><td><b>{b.id}</b></td><td>{b.status}</td><td className="num">{b.storage}</td><td className="num">{b.defl}</td><td>{b.nogo}</td></tr>)}</tbody>
            </table>
            <div className="evidence-row">
              {['lineup321', 'third', 'final31', 'current'].map(id => (
                <button key={id} className="btn sm ghost" onClick={() => openEvidence(id)}>{id === 'lineup321' ? 'V3.2.1 名单' : id === 'third' ? '第三项决策' : id === 'final31' ? 'Go/No-Go 门槛' : '当前冻结决策'}</button>
              ))}
            </div>
          </div>
        </details>
      </div>
    </section>
  )
}
