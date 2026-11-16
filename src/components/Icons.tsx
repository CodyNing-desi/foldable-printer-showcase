const PATHS: Record<string, string> = {
  dot: 'M8 8m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
  check: 'M3 8.5l3.2 3.2L13 4.5',
  cross: 'M4 4l8 8M12 4l-8 8',
  star: 'M8 2l1.8 3.9 4.2.5-3.1 2.9.8 4.2L8 11.4 4.3 13.5l.8-4.2L2 6.4l4.2-.5z',
  flag: 'M4 14V2.5M4 3h8l-2 2.5 2 2.5H4',
  bench: 'M2 12h12M4 12V7l4-3 4 3v5M8 4v8',
  shield: 'M8 2l5 2v4c0 3.2-2.2 5.4-5 6.5C5.2 13.4 3 11.2 3 8V4z',
  stop: 'M5.2 2h5.6L14 5.2v5.6L10.8 14H5.2L2 10.8V5.2zM5.5 8h5',
  archive: 'M2 4h12v3H2zM3.5 7v6h9V7M6.5 9.5h3',
  ghost: 'M4 14V6a4 4 0 0 1 8 0v8l-2-1.5L8 14l-2-1.5zM6.5 6.5h.01M9.5 6.5h.01',
  wave: 'M2 8c2-4 4-4 6 0s4 4 6 0',
  box: 'M2.5 5.5L8 2.5l5.5 3v5L8 13.5l-5.5-3zM2.5 5.5L8 8.5l5.5-3M8 8.5v5',
  collide: 'M6 6L2 2M10 6l4-4M6 10l-4 4M10 10l4 4M6 6h4v4H6z',
  wrench: 'M9.5 2.5a4 4 0 0 0-5 5L2 10l2 2 2.5-2.5a4 4 0 0 0 5-5L9 7 7 5z',
  copy: 'M5 5h8v8H5zM3 11V3h8',
  clock: 'M8 8m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0M8 4.5V8l2.5 2',
  flask: 'M6 2h4M6.5 2v4L3 12.5a1.5 1.5 0 0 0 1.3 2h7.4a1.5 1.5 0 0 0 1.3-2L9.5 6V2M4.5 10h7',
  arrow: 'M2 8h10M8.5 4L13 8l-4.5 4',
  alert: 'M8 2L14.5 13.5H1.5zM8 6.5v3.5M8 12h.01',
  eye: 'M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8zM8 8m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
  zoom: 'M7 7m-4.5 0a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0M10.5 10.5L14 14M7 5v4M5 7h4',
}

export function Icon({ name, size = 14, className }: { name: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name] ?? PATHS.dot} />
    </svg>
  )
}
