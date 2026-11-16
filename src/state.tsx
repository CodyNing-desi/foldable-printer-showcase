import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { StageId } from './data/types'
import { AUTO_STEPS } from './autoplay'

export const CHAPTERS = [
  { id: 'ch1', no: '01', label: '问题提出' },
  { id: 'ch2', no: '02', label: '15种候选' },
  { id: 'ch3', no: '03', label: '统一筛选' },
  { id: 'ch4', no: '04', label: 'F04 逆转' },
  { id: 'ch5', no: '05', label: 'F12 逆转' },
  { id: 'ch6', no: '06', label: '最终决策' },
  { id: 'ch7', no: '07', label: '机构运动' },
  { id: 'ch8', no: '08', label: '走向实物' },
]

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
  playToken: number
  requestPlay: () => void
  f04View: number
  setF04View: (v: number) => void
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
  const [playToken, setPlayToken] = useState(0)
  const [f04View, setF04View] = useState(0)
  const [auto, setAuto] = useState<AutoState>({ active: false, index: 0, paused: false, progress: 0 })
  const [reduced, setReduced] = useState(false)
  const [activeChapter, setActiveChapter] = useState('ch1')
  const autoRef = useRef(auto)
  autoRef.current = auto

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const fn = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }, [reduced])

  const requestPlay = useCallback(() => setPlayToken(t => t + 1), [])

  const openCandidate = useCallback((id: string | null) => {
    setSelected(id)
    if (id && autoRef.current.active) setAuto(a => ({ ...a, paused: true }))
  }, [])

  const openEvidence = useCallback((id: string | null) => {
    setEvidence(id)
    if (id && autoRef.current.active) setAuto(a => ({ ...a, paused: true }))
  }, [])

  const startAuto = useCallback(() => {
    setSelected(null)
    setEvidence(null)
    setAuto({ active: true, index: 0, paused: false, progress: 0 })
  }, [])
  const exitAuto = useCallback(() => setAuto(a => ({ ...a, active: false, paused: false })), [])
  const togglePause = useCallback(() => setAuto(a => ({ ...a, paused: !a.paused })), [])
  const autoNext = useCallback(() => setAuto(a => {
    if (a.index >= AUTO_STEPS.length - 1) return { ...a, active: false }
    return { ...a, index: a.index + 1, progress: 0 }
  }), [])
  const autoPrev = useCallback(() => setAuto(a => ({ ...a, index: Math.max(0, a.index - 1), progress: 0 })), [])

  // apply step effects
  useEffect(() => {
    if (!auto.active) return
    const step = AUTO_STEPS[auto.index]
    if (!step) return
    if (step.stage) setStage(step.stage)
    if (step.motion) setMotionTab(step.motion)
    if (typeof step.f04 === 'number') setF04View(step.f04)
    scrollTo(step.chapter)
    if (step.play) {
      const t = window.setTimeout(() => setPlayToken(x => x + 1), reduced ? 100 : 700)
      return () => window.clearTimeout(t)
    }
  }, [auto.active, auto.index, scrollTo, reduced])

  // advance timer + progress
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
    stage, setStage, selected, openCandidate, evidence, openEvidence,
    motionTab, setMotionTab, playToken, requestPlay, f04View, setF04View,
    auto, startAuto, exitAuto, togglePause, autoNext, autoPrev,
    reduced, activeChapter, setActiveChapter, scrollTo,
  }), [stage, selected, evidence, motionTab, playToken, f04View, auto, reduced, activeChapter, openCandidate, openEvidence, startAuto, exitAuto, togglePause, autoNext, autoPrev, requestPlay, scrollTo])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function assetUrl(p: string): string {
  return `${import.meta.env.BASE_URL}${p}`
}
