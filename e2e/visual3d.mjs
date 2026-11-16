// 第三轮视觉验收：逐状态截取 3D 画布区域，供像素分析判定"模型是否真正可见/是否裁切"
import { launchBrowser } from './browser.mjs'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const VPW = Number(process.env.VP || 1920), VPH = Number(process.env.VPH || 1080)
const OUT = path.join(ROOT, 'e2e', process.env.OUTDIR || 'shots3d')
fs.mkdirSync(OUT, { recursive: true })
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.glb': 'model/gltf-binary', '.md': 'text/plain' }
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p === '/') p = '/index.html'
  const f = path.join(DIST, p)
  if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] ?? 'application/octet-stream' }); fs.createReadStream(f).pipe(res)
})
await new Promise(r => server.listen(4181, r))
const browser = await launchBrowser()
const page = await browser.newPage({ viewport: { width: VPW, height: VPH } })
const errs = []
page.on('pageerror', e => errs.push(String(e)))
await page.addInitScript(() => {
  window.__ctx = { created: 0, lost: 0 }
  const orig = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (t, ...a) {
    const c = orig.call(this, t, ...a)
    if (c && /webgl/.test(t)) { window.__ctx.created++; this.addEventListener('webglcontextlost', () => window.__ctx.lost++) }
    return c
  }
})
await page.goto('http://localhost:4181/?pdb', { waitUntil: 'networkidle' })
if (process.env.HIDE !== '0') await page.addStyleTag({ content: '.scene-tag,.joint-tag,.scene-badge,.scene-caption{display:none !important}' })

const manifest = []
async function snap(name, chapter, setup, wait = 2200) {
  await page.evaluate(cid => document.getElementById(cid).scrollIntoView({ block: 'start' }), chapter)
  await page.waitForTimeout(900)
  if (setup) await setup()
  await page.waitForTimeout(wait)
  const box = await page.locator(`#${chapter} .scene-canvas`).first().boundingBox()
  if (!box) { manifest.push({ name, error: 'no canvas box' }); return }
  await page.screenshot({ path: path.join(OUT, `${name}.png`), clip: { x: box.x, y: Math.max(0, box.y), width: box.width, height: Math.min(box.height, VPH - Math.max(0, box.y)) } })
  const met = await page.evaluate(cid => {
    const c = document.querySelector(`#${cid} .scene-canvas canvas`)
    if (!c) return null
    const g = c.getContext('webgl2') || c.getContext('webgl')
    const w = c.width, h = c.height
    const px = new Uint8Array(w * h * 4)
    g.readPixels(0, 0, w, h, g.RGBA, g.UNSIGNED_BYTE, px)
    let n = 0, x0 = w, x1 = -1, y0 = h, y1 = -1
    for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) {
      const k = (y * w + x) * 4
      if (px[k + 3] < 12) continue
      const mx = Math.max(px[k], px[k + 1], px[k + 2]), mn = Math.min(px[k], px[k + 1], px[k + 2])
      const mean = (px[k] + px[k + 1] + px[k + 2]) / 3
      if (!((mx - mn) > 25 || mean < 200)) continue
      n++
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y
    }
    const samples = (w / 2 | 0) * (h / 2 | 0)
    // readPixels 原点在左下 → 翻转 y 以匹配屏幕坐标
    const touch = (x0 <= 4 ? 1 : 0) + (x1 >= w - 5 ? 1 : 0) + ((h - 1 - y1) <= 4 ? 1 : 0) + ((h - 1 - y0) >= h - 5 ? 1 : 0)
    return { cov: +(n / samples).toFixed(3), touch, bw: +((x1 - x0) / w).toFixed(2), bh: +((y1 - y0) / h).toFixed(2) }
  }, chapter)
  manifest.push({ name, chapter, w: Math.round(box.width), h: Math.round(box.height), met })
}
const setRange = (sel, v) => page.locator(sel).fill(String(v))

// 首页三姿态
await snap('hero-open', 'ch1', () => setRange('#ch1 input[type=range]', 0))
await snap('hero-mid', 'ch1', () => setRange('#ch1 input[type=range]', 0.5))
await snap('hero-folded', 'ch1', () => setRange('#ch1 input[type=range]', 1))
// 候选页
await snap('cand-s0', 'ch2', () => page.click('.seg button:has-text("候选定义")'))
await snap('cand-v321', 'ch2', () => page.click('.seg button:has-text("V3.2.1 冻结")'))
// Ch7 各方案各状态
await page.evaluate(() => document.getElementById('ch7').scrollIntoView())
await page.waitForTimeout(2500)
const ch7range = '#ch7 input[aria-label="折叠进度"]'
const exrange = '#ch7 input[aria-label="爆炸分解进度"]'
for (const [tab, prefix] of [['F09', 'f09'], ['F07', 'f07'], ['SCZ', 'scz'], ['F08', 'f08']]) {
  await page.click(`#ch7 .seg button:has-text("${tab}")`)
  await page.waitForTimeout(2200)
  await snap(`${prefix}-open`, 'ch7', () => setRange(ch7range, 0))
  await snap(`${prefix}-mid`, 'ch7', () => setRange(ch7range, 0.5))
  await snap(`${prefix}-folded`, 'ch7', () => setRange(ch7range, 1))
}
await page.click('#ch7 .seg button:has-text("F09")')
await page.waitForTimeout(1800)
await snap('f09-explode50', 'ch7', () => setRange(exrange, 0.5))
await snap('f09-explode100', 'ch7', () => setRange(exrange, 1))
await setRange(exrange, 0)
await page.click('.chip:has-text("零件树")')
await page.waitForTimeout(400)
await page.locator('.part-row', { hasText: 'X 臂' }).first().click()
await page.waitForTimeout(400)
await page.click('.chip:has-text("隔离")')
await snap('f09-isolate-arm', 'ch7', null)
await page.click('.chip:has-text("取消隔离")')
await page.click('.chip:has-text("X 光")')
await snap('f09-xray', 'ch7', null)
await page.click('.chip:has-text("X 光")')
await page.click('.chip:has-text("关节特写")')
await snap('f09-detail', 'ch7', null)
await page.click('.chip:has-text("等轴")')
// F04 / F12
for (const mode of ['Before', 'After', 'Why Failed']) {
  await snap(`f04-${mode.split(' ')[0].toLowerCase()}-full`, 'ch4', async () => {
    await page.click(`#ch4 .seg button:has-text("${mode}")`)
    await page.click('#ch4 .seg button:has-text("整体视角")')
    await setRange('#ch4 input[aria-label="F04 运动进度"]', mode === 'Before' ? 0.65 : 0.9)
  })
}
await snap('f04-why-close', 'ch4', () => page.click('#ch4 .seg button:has-text("干涉特写")'))
await snap('f12-full', 'ch5', async () => {
  await page.click('#ch5 .seg button:has-text("整体视角")')
  await setRange('#ch5 input[aria-label="伸缩进度"]', 0.7)
})
await snap('f12-close-wobble', 'ch5', async () => {
  await page.click('#ch5 .seg button:has-text("导向间隙特写")')
  await page.click('.btn:has-text("打开晃动示意")')
})
const ctx = await page.evaluate(() => window.__ctx)
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({ manifest, ctx, errs }, null, 1))
console.log('states:', manifest.length, 'ctx:', JSON.stringify(ctx), 'errs:', errs.length)
await browser.close(); server.close()
