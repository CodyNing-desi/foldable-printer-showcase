// 视觉审计：重叠检测 + 动画状态截图 + 交互录屏（Playwright video）
import { launchBrowser } from './browser.mjs'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(ROOT, 'dist')
const OUT = path.join(ROOT, 'e2e', 'shots')
const MEDIA = path.join(ROOT, 'docs', 'media')
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(MEDIA, { recursive: true })
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.gif': 'image/gif', '.md': 'text/plain; charset=utf-8', '.glb': 'model/gltf-binary' }
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (p === '/') p = '/index.html'
  const file = path.join(DIST, p)
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})
await new Promise(r => server.listen(4175, r))
const browser = await launchBrowser()

// ---- 重叠审计 ----
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
await page.goto('http://localhost:4175/', { waitUntil: 'networkidle' })
const chapters = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8']
let overlaps = []
for (const id of chapters) {
  await page.evaluate(cid => document.getElementById(cid).scrollIntoView(), id)
  await page.waitForTimeout(1400)
  const bad = await page.evaluate(cid => {
    const els = [...document.querySelectorAll(`#${cid} .scene, #${cid} .step-card, #${cid} .route, #${cid} .tl-node, #${cid} .idx, #${cid} .stamp, #${cid} .issue-block, #${cid} .boundary-col, #${cid} .expand, #${cid} .verdict-line`)]
    const rects = els.map(e => ({ e, r: e.getBoundingClientRect() }))
    const out = []
    for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i], b = rects[j]
      if (a.e.contains(b.e) || b.e.contains(a.e)) continue
      const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left)
      const oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top)
      if (ox > 6 && oy > 6) out.push({ a: a.e.className.slice(0, 30), b: b.e.className.slice(0, 30), ox: Math.round(ox), oy: Math.round(oy) })
    }
    return out
  }, id)
  overlaps.push(...bad.map(b => ({ chapter: id, ...b })))
}
console.log('OVERLAPS:', overlaps.length ? JSON.stringify(overlaps) : 'none')
await page.close()

// ---- 交互录屏 ----
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: MEDIA, size: { width: 1920, height: 1080 } } })
const v = await ctx.newPage()
await v.goto('http://localhost:4175/', { waitUntil: 'networkidle' })
await v.waitForTimeout(2500)
await v.locator('#ch1 input[type=range]').fill('0.5'); await v.waitForTimeout(700)
await v.locator('#ch1 input[type=range]').fill('1'); await v.waitForTimeout(900)
await v.click('.nav-link:has-text("F04 逆转")'); await v.waitForTimeout(1800)
await v.click('.seg button:has-text("After")'); await v.waitForTimeout(900)
await v.click('.seg button:has-text("Why Failed")'); await v.waitForTimeout(1400)
await v.click('.nav-link:has-text("F12 逆转")'); await v.waitForTimeout(1600)
await v.click('.btn:has-text("打开晃动示意")'); await v.waitForTimeout(1600)
await v.click('.nav-link:has-text("机构解释器")'); await v.waitForTimeout(2600)
await v.click('#ch7 .play-btn'); await v.waitForTimeout(3200)
await v.click('#ch7 .play-btn')
await v.locator('#ch7 input[aria-label="爆炸分解进度"]').fill('1'); await v.waitForTimeout(1600)
await v.locator('#ch7 input[aria-label="爆炸分解进度"]').fill('0'); await v.waitForTimeout(900)
await v.click('.chip:has-text("零件树")'); await v.waitForTimeout(500)
await v.locator('.part-row', { hasText: '中横梁' }).first().click(); await v.waitForTimeout(700)
await v.click('.chip:has-text("隔离")'); await v.waitForTimeout(1000)
await v.click('.chip:has-text("取消隔离")'); await v.waitForTimeout(400)
await v.click('.seg button:has-text("SCZ")'); await v.waitForTimeout(2000)
await v.click('#ch7 .play-btn'); await v.waitForTimeout(2600)
const videoPath = await v.video().path()
await ctx.close()
const dest = path.join(MEDIA, 'interaction-tour.webm')
fs.copyFileSync(videoPath, dest)
console.log('VIDEO:', dest)

await browser.close()
server.close()
console.log('visual audit done')
