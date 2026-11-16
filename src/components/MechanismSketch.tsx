// 二维原理示意（非 CAD）。几何数据不足的候选只画机构拓扑，卡片上统一标注"原理示意"。
export function MechanismSketch({ id, family }: { id: string; family: string }) {
  const s = { stroke: 'currentColor', strokeWidth: 2, fill: 'none' } as const
  const dot = { fill: 'currentColor', stroke: 'none' } as const
  const dash = { stroke: 'currentColor', strokeWidth: 1.5, fill: 'none', strokeDasharray: '4 3', opacity: 0.65 } as const

  let body: JSX.Element
  switch (family) {
    case 'root_single':
      body = (
        <g>
          <rect x="26" y="16" width="8" height="48" {...s} />
          <line x1="30" y1="16" x2="92" y2="16" {...s} />
          <rect x="86" y="16" width="8" height="10" {...s} />
          <circle cx="30" cy="64" r="3.5" {...dot} />
          <path d="M 96 22 A 40 40 0 0 1 70 60" {...dash} />
          {id === 'F07' && <path d="M 18 58 L 18 34 M 14 40 L 18 34 L 22 40" {...dash} />}
          {id === 'F08' && <path d="M 40 72 L 16 72 M 22 68 L 16 72 L 22 76" {...dash} />}
        </g>
      )
      break
    case 'root_double':
      body = (
        <g>
          <rect x="24" y="16" width="8" height="48" {...s} />
          <rect x="88" y="16" width="8" height="48" {...s} />
          <line x1="24" y1="16" x2="96" y2="16" {...s} />
          <line x1="60" y1="16" x2="60" y2="30" {...s} />
          <rect x="55" y="30" width="10" height="8" {...s} />
          <circle cx="28" cy="64" r="3.5" {...dot} />
          <circle cx="92" cy="64" r="3.5" {...dot} />
          {id === 'F09' && <path d="M 14 58 L 14 34 M 10 40 L 14 34 L 18 40 M 106 58 L 106 34 M 102 40 L 106 34 L 110 40" {...dash} />}
        </g>
      )
      break
    case 'arm_fold':
      body = (
        <g>
          <rect x="26" y="16" width="8" height="48" {...s} />
          <line x1="30" y1="16" x2="92" y2="16" {...s} />
          <rect x="86" y="16" width="8" height="10" {...s} />
          <circle cx="34" cy="16" r="3.5" {...dot} />
          <path d="M 92 20 A 58 58 0 0 1 60 62" {...dash} />
        </g>
      )
      break
    case 'guided_single':
    case 'guided_double':
      body = (
        <g>
          <rect x="40" y="14" width="8" height="42" {...s} />
          <line x1="44" y1="14" x2="96" y2="14" {...s} />
          <rect x="90" y="14" width="8" height="9" {...s} />
          <path d="M 30 64 C 30 40 36 30 44 22" {...s} />
          <path d="M 36 64 C 36 44 42 34 50 26" {...s} />
          <circle cx="33" cy="52" r="3" {...dot} />
          <circle cx="39" cy="36" r="3" {...dot} />
          {family === 'guided_double' && <rect x="70" y="14" width="8" height="42" {...s} />}
        </g>
      )
      break
    case 'telescope_2':
      body = (
        <g>
          <rect x="30" y="34" width="18" height="30" {...s} />
          <rect x="34" y="16" width="10" height="30" {...s} />
          <line x1="39" y1="16" x2="92" y2="16" {...s} />
          <rect x="86" y="16" width="8" height="9" {...s} />
          <path d="M 56 30 L 56 12 M 52 18 L 56 12 L 60 18" {...dash} />
        </g>
      )
      break
    case 'telescope_3':
      body = (
        <g>
          <rect x="28" y="42" width="22" height="22" {...s} />
          <rect x="32" y="28" width="14" height="22" {...s} />
          <rect x="35" y="14" width="8" height="22" {...s} />
          <line x1="39" y1="14" x2="92" y2="14" {...s} />
          <rect x="86" y="14" width="8" height="9" {...s} />
          <path d="M 58 34 L 58 10 M 54 16 L 58 10 L 62 16" {...dash} />
        </g>
      )
      break
    case 'external_flip':
      body = (
        <g>
          <rect x="14" y="10" width="92" height="58" {...dash} />
          <rect x="40" y="26" width="7" height="34" {...s} />
          <line x1="43" y1="26" x2="84" y2="26" {...s} />
          <rect x="78" y="26" width="7" height="8" {...s} />
          <path d="M 108 40 A 46 46 0 0 1 84 72" {...dash} />
        </g>
      )
      break
    case 'case_linked':
      body = (
        <g>
          <rect x="20" y="24" width="80" height="40" {...s} />
          <line x1="20" y1="24" x2="96" y2="12" {...s} />
          <circle cx="20" cy="24" r="3" {...dot} />
          <rect x="46" y="34" width="6" height="22" {...s} />
          <line x1="49" y1="34" x2="78" y2="34" {...s} />
        </g>
      )
      break
    case 'drawer_y':
      body = (
        <g>
          <rect x="22" y="16" width="7" height="48" {...s} />
          <line x1="25" y1="16" x2="66" y2="16" {...s} />
          <rect x="40" y="50" width="52" height="9" {...s} />
          <path d="M 96 54 L 112 54 M 106 50 L 112 54 L 106 58" {...dash} />
          <rect x="44" y="44" width="30" height="6" {...s} />
        </g>
      )
      break
    case 'external_combo':
      body = (
        <g>
          <rect x="12" y="12" width="96" height="56" {...dash} />
          <rect x="34" y="24" width="6" height="30" {...s} />
          <rect x="66" y="24" width="6" height="30" {...s} />
          <line x1="34" y1="24" x2="72" y2="24" {...s} />
          <path d="M 84 44 A 30 30 0 0 1 66 62" {...dash} />
        </g>
      )
      break
    case 'scissor':
      body = (
        <g>
          <line x1="28" y1="14" x2="92" y2="14" {...s} />
          <line x1="34" y1="62" x2="86" y2="18" {...s} />
          <line x1="86" y1="62" x2="34" y2="18" {...s} />
          <circle cx="60" cy="40" r="3" {...dot} />
          <circle cx="34" cy="62" r="3" {...dot} />
          <circle cx="86" cy="62" r="3" {...dot} />
          <path d="M 98 58 L 98 24 M 94 30 L 98 24 L 102 30" {...dash} />
        </g>
      )
      break
    default:
      body = <rect x="30" y="20" width="60" height="40" {...s} />
  }

  return (
    <svg viewBox="0 0 120 80" role="img" aria-label={`${id} 原理示意`}>
      <rect x="8" y="64" width="104" height="6" {...s} />
      <rect x="44" y="56" width="44" height="6" {...s} opacity="0.7" />
      {body}
    </svg>
  )
}
