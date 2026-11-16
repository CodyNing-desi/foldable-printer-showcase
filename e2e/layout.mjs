// 布局几何审计：1920×1080 投影与 1366×768 笔记本下逐章检查溢出/可见性/关键元素尺寸
import { chromium } from 'playwright'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.gif': 'image/gif', '.md': 'text/plain; charset=utf-8' }
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (p === '/') p = '/index.html'
  const file = path.join(DIST, p)
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})
await new Promise(r => server.listen(4174, r))
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Users/94823/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe', args: ['--no-sandbox'] })

for (const vp of [{ width: 1920, height: 1080 }, { width: 1366, height: 768 }]) {
  const page = await browser.newPage({ viewport: vp })
  await page.goto('http://localhost:4174/', { waitUntil: 'networkidle' })
  console.log(`\n=== ${vp.width}x${vp.height} ===`)
  const chapters = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8']
  for (const id of chapters) {
    await page.evaluate(cid => document.getElementById(cid).scrollIntoView(), id)
    await page.waitForTimeout(700)
    const r = await page.evaluate(cid => {
      const doc = document.documentElement
      const sec = document.getElementById(cid)
      const out = { overflowX: doc.scrollWidth - window.innerWidth, elements: [] }
      const sel = {
        ch1: ['.hero-visual .frame', 'h1', '.hero-cta'],
        ch2: ['.scrolly-sticky', '.cand-grid, .final-groups', '.stage-pills'],
        ch3: ['.matrix', '.sampling svg', '.concept-cards'],
        ch4: ['.f04-stage svg', '.conclusion-banner'],
        ch5: ['.f12-grid', '.f12-track'],
        ch6: ['.board', '.scz-callout'],
        ch7: ['.player .screen', '.phase-bar', '.kf-strip'],
        ch8: ['.pipe', '.final-quote'],
      }[cid]
      for (const s of sel) {
        const el = document.querySelector(`#${cid} ${s}`)
        if (!el) { out.elements.push({ s, missing: true }); continue }
        const b = el.getBoundingClientRect()
        out.elements.push({ s, w: Math.round(b.width), h: Math.round(b.height), top: Math.round(b.top), bottom: Math.round(b.bottom), inViewportX: b.left >= -1 && b.right <= window.innerWidth + 1 })
      }
      // 卡片文字是否被裁剪
      if (cid === 'ch2') {
        const cards = [...document.querySelectorAll('.cand-card')]
        out.clipped = cards.filter(c => c.scrollHeight > c.clientHeight + 2).length
        out.cardH = cards[0] ? Math.round(cards[0].getBoundingClientRect().height) : 0
      }
      return out
    }, id)
    const bad = r.elements.filter(e => e.missing || !e.inViewportX || e.w < 40)
    console.log(`${id}: overflowX=${r.overflowX}px ${r.clipped !== undefined ? `clippedCards=${r.clipped} cardH=${r.cardH}` : ''} ${bad.length ? 'ISSUES: ' + JSON.stringify(bad) : 'ok'}`)
    if (id === 'ch2') {
      console.log('   ', JSON.stringify(r.elements))
      await page.evaluate(() => document.querySelectorAll('.step-block')[3].scrollIntoView({ block: 'center' }))
      await page.waitForTimeout(700)
      const pin = await page.evaluate(() => {
        const g = document.querySelector('.cand-grid, .final-groups').getBoundingClientRect()
        return { top: Math.round(g.top), bottom: Math.round(g.bottom), vh: window.innerHeight, fullyVisible: g.top >= 58 && g.bottom <= window.innerHeight }
      })
      console.log('    pinned-grid:', JSON.stringify(pin))
    }
    if (id === 'ch7') console.log('   ', JSON.stringify(r.elements))
  }
  await page.close()
}
await browser.close()
server.close()
