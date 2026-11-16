import { useEffect } from 'react'
import { AppProvider, CHAPTERS, useApp } from './state'
import { Nav } from './components/Nav'
import { AutoplayBar } from './components/AutoplayBar'
import { DetailDrawer } from './components/DetailDrawer'
import { EvidenceModal } from './components/EvidenceModal'
import { Ch1Hero } from './chapters/Ch1Hero'
import { Ch2Candidates } from './chapters/Ch2Candidates'
import { Ch3Matrix } from './chapters/Ch3Matrix'
import { Ch4F04 } from './chapters/Ch4F04'
import { Ch5F12 } from './chapters/Ch5F12'
import { Ch6Decision } from './chapters/Ch6Decision'
import { Ch7Motion } from './chapters/Ch7Motion'
import { Ch8Pipeline } from './chapters/Ch8Pipeline'
import { REPO_BASE, SIM_BRANCH, CAD_BRANCH, CAD_COMMIT } from './data/evidence'

function ChapterTracker() {
  const { setActiveChapter } = useApp()
  useEffect(() => {
    const ob = new IntersectionObserver(es => {
      for (const en of es) if (en.isIntersecting) setActiveChapter(en.target.id)
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 })
    CHAPTERS.forEach(c => { const el = document.getElementById(c.id); if (el) ob.observe(el) })
    return () => ob.disconnect()
  }, [setActiveChapter])
  return null
}

function Shell() {
  return (
    <>
      <Nav />
      <ChapterTracker />
      <main>
        <Ch1Hero />
        <Ch2Candidates />
        <Ch3Matrix />
        <Ch4F04 />
        <Ch5F12 />
        <Ch6Decision />
        <Ch7Motion />
        <Ch8Pipeline />
      </main>
      <footer className="footer">
        <div className="wrap">
          <span>数据与素材：{REPO_BASE} · {SIM_BRANCH} · {CAD_BRANCH} @ {CAD_COMMIT.slice(0, 7)}（R1-V6）</span>
          <span>证据文档与 CAD 资产已本地打包，可离线演示。缩比模型不宣称完成整机性能验证。</span>
        </div>
      </footer>
      <AutoplayBar />
      <DetailDrawer />
      <EvidenceModal />
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
