import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { StageId } from './data/types'
import type { CamPreset } from './data/viewer'
import type { F04Mode } from './three/SchematicScenes'
import { AUTO_STEPS } from './autoplay'

export const CHAPTERS = [
  { id: 'ch1', no: '01', label: '问题' },
  { id: 'ch2', no: '02', label: '候选与筛选' },
  { id: 'ch3', no: '03', label: '统一标准' },
  { id: 'ch4', no: '04', label: 'F04 逆转' },
  { id: 'ch5', no: '05', label: 'F12 逆转' },
  { id: 'ch6', no: '06', label: '最终决策' },
  { id: 'ch7', no: '07', label: '机构解释器' },
  { id: 'ch8', no: '08', label: '走向实物' },
]

export interface ViewerCtrl {
  t: number
  playing: boolean
  explode: number
  xray: boolean
  isolate: string | null
  selectedPart: string | null
  traces: boolean
  labels: boolean
  preset: CamPreset
  presetToken: number
}

export const DEFAULT_CTRL: ViewerCtrl = {
  t: 0, playing: false, explode: 0, xray: false, isolate: null, selectedPart: null,
  traces: false, labels: true, preset: 'iso', presetToken: 0,
}

interface AutoState { active: boolean; index: number; paused: boolean; progress: number }

interface AppState {
  stage: StageId
  setStage: (s: StageId) => void
  selected: string | null
  openCandidate: (id: string | null) => void
  evidence: string | null
  openEvidence: (id: string | null) => void
  motionTab: string
  setMotionTab: (id: string) => void
  ctrl: ViewerCtrl
  setCtrl: (patch: Partial<ViewerCtrl>) => void
  f04Mode: F04Mode
  setF04Mode: (m: F04Mode) => void
  f04T: number
  setF04T: (t: number) => void
  f12Extend: number
  setF12Extend: (v: number) => void
  f12Wobble: boolean
  setF12Wobble: (v: boolean) => void
  auto: AutoState
  startAuto: () => void
  exitAuto: () => void
  togglePause: () => void
  autoNext: () => void
  autoPrev: () => void
  reduced: boolean
  activeChapter: string
  setActiveChapter: (id: string) => void
  scrollTo: (id: string) => void
}

const Ctx = createContext<AppState | null>(null)
export function useApp(): AppState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp outside provider')
  return v
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<StageId>('s0')
  const [selected, setSelected] = useState<string | null>(null)
  const [evidence, setEvidence] = useState<string | null>(null)
  const [motionTab, setMotionTab] = useState('F09_L82')
  const [ctrl, setCtrlState] = useState<ViewerCtrl>(DEFAULT_CTRL)
  const [f04Mode, setF04Mode] = useState<F04Mode>('before')
  const [f04T, setF04T] = useState(0)
  const [f12Extend, setF12Extend] = useState(0.35)
  const [f12Wobble, setF12Wobble] = useState(false)
  const [auto, setAuto] = useState<AutoState>({ active: false, index: 0, paused: false, progress: 0 })
  const [reduced, setReduced] = useState(false)
  const [activeChapter, setActiveChapter] = useState('ch1')
  const autoRef = useRef(auto)
  autoRef.current = auto

  const setCtrl = useCallback((patch: Partial<ViewerCtrl>) => setCtrlState(c => ({ ...c, ...patch })), [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const fn = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }, [reduced])

  const openCandidate = useCallback((id: string | null) => {
    setSelected(id)
    if (id && autoRef.current.active) setAuto(a => ({ ...a, paused: true }))
  }, [])
  const openEvidence = useCallback((id: string | null) => {
    setEvidence(id)
    if (id && autoRef.current.active) setAuto(a => ({ ...a, paused: true }))
  }, [])

  const startAuto = useCallback(() => {
    setSelected(null); setEvidence(null)
    setAuto({ active: true, index: 0, paused: false, progress: 0 })
  }, [])
  const exitAuto = useCallback(() => setAuto(a => ({ ...a, active: false, paused: false })), [])
  const togglePause = useCallback(() => setAuto(a => ({ ...a, paused: !a.paused })), [])
  const autoNext = useCallback(() => setAuto(a => a.index >= AUTO_STEPS.length - 1 ? { ...a, active: false } : { ...a, index: a.index + 1, progress: 0 }), [])
  const autoPrev = useCallback(() => setAuto(a => ({ ...a, index: Math.max(0, a.index - 1), progress: 0 })), [])

  useEffect(() => {
    if (!auto.active) return
    const step = AUTO_STEPS[auto.index]
    if (!step) return
    if (step.stage) setStage(step.stage)
    if (step.motion) { setMotionTab(step.motion); setCtrlState(c => ({ ...c, ...DEFAULT_CTRL, preset: 'iso', presetToken: c.presetToken + 1 })) }
    if (step.ctrl) setCtrlState(c => ({ ...c, ...step.ctrl }))
    if (step.f04Mode) setF04Mode(step.f04Mode)
    if (typeof step.f04T === 'number') setF04T(step.f04T)
    if (typeof step.f12Extend === 'number') setF12Extend(step.f12Extend)
    if (typeof step.f12Wobble === 'boolean') setF12Wobble(step.f12Wobble)
    scrollTo(step.chapter)
  }, [auto.active, auto.index, scrollTo])

  useEffect(() => {
    if (!auto.active || auto.paused) return
    const step = AUTO_STEPS[auto.index]
    if (!step) return
    const started = Date.now()
    const base = auto.progress
    const iv = window.setInterval(() => {
      const p = base + (Date.now() - started) / (step.dur * 1000)
      if (p >= 1) {
        window.clearInterval(iv)
        setAuto(a => {
          if (!a.active || a.paused || a.index !== auto.index) return a
          if (a.index >= AUTO_STEPS.length - 1) return { ...a, active: false, progress: 0 }
          return { ...a, index: a.index + 1, progress: 0 }
        })
      } else {
        setAuto(a => (a.active && !a.paused && a.index === auto.index ? { ...a, progress: p } : a))
      }
    }, 100)
    return () => window.clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto.active, auto.paused, auto.index])

  const value = useMemo<AppState>(() => ({
    stage, setStage, selected, openCandidate, evidence, openEvidence, motionTab, setMotionTab,
    ctrl, setCtrl, f04Mode, setF04Mode, f04T, setF04T, f12Extend, setF12Extend, f12Wobble, setF12Wobble,
    auto, startAuto, exitAuto, togglePause, autoNext, autoPrev, reduced, activeChapter, setActiveChapter, scrollTo,
  }), [stage, selected, evidence, motionTab, ctrl, f04Mode, f04T, f12Extend, f12Wobble, auto, reduced, activeChapter, setCtrl, openCandidate, openEvidence, startAuto, exitAuto, togglePause, autoNext, autoPrev, scrollTo])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function assetUrl(p: string): string {
  return `${import.meta.env.BASE_URL}${p}`
}
