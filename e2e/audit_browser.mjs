// 浏览器侧穿模归因校验：证明浏览器世界变换 == 导出轨道插值（无额外旋转/缩放/父变换），
// 并检查 SCZ 臂缩放与版本一致；在重点时刻截图供审计表对照。仅 ?dbg3d 门控钩子。
import { launchBrowser } from './browser.mjs'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const OUT = path.join(ROOT, 'e2e', 'audit-shots')
fs.mkdirSync(OUT, { recursive: true })
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.glb': 'model/gltf-binary', '.md': 'text/plain' }
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p === '/') p = '/index.html'
  const f = path.join(DIST, p)
  if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] ?? 'application/octet-stream' }); fs.createReadStream(f).pipe(res)
})
await new Promise(r => server.listen(4191, r))
const browser = await launchBrowser()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
await page.goto('http://localhost:4191/?dbg3d', { waitUntil: 'networkidle' })
await page.addStyleTag({ content: '.scene-tag,.joint-tag,.scene-badge,.scene-caption{display:none !important}' })

function slerp(qa, qb, u) {
  let d = qa[0]*qb[0]+qa[1]*qb[1]+qa[2]*qb[2]+qa[3]*qb[3]
  let b = qb.slice()
  if (d < 0) { b = b.map(x => -x); d = -d }
  if (d > 0.9995) { const r = qa.map((x, i) => x + u * (b[i] - x)); const n = Math.hypot(...r); return r.map(x => x / n) }
  const th = Math.acos(Math.min(1, d)), s = Math.sin(th)
  return qa.map((x, i) => Math.sin((1 - u) * th) / s * x + Math.sin(u * th) / s * b[i])
}
function interp(tr, n, t) {
  const f = Math.min(1, Math.max(0, t)) * (n - 1)
  const i = Math.min(n - 2, Math.floor(f)), u = f - i
  const p = [0, 1, 2].map(k => tr.p[i*3+k] * (1 - u) + tr.p[(i+1)*3+k] * u)
  const q = slerp(tr.q.slice(i*4, i*4+4), tr.q.slice((i+1)*4, (i+1)*4+4), u)
  return { p, q }
}

const results = []
await page.evaluate(() => document.getElementById('ch7').scrollIntoView())
await page.waitForTimeout(2500)
const TABS = [['F09', 'F09_L82'], ['F07', 'F07'], ['SCZ', 'SCZ'], ['F08', 'F08_OPTIONAL']]
for (const [tab, cand] of TABS) {
  await page.click(`#ch7 .seg button:has-text("${tab}")`)
  await page.waitForTimeout(2000)
  const versions = await page.evaluate(c => fetch(`./models/${c}/versions.json`).then(r => r.json()), cand)
  for (const ver of versions) {
    await page.click(`#ch7 .vs-btn:has-text("${ver.label}")`)
    await page.waitForTimeout(900)
    for (const t of [0, 0.1, 0.3, 0.42, 0.7, 1]) {
      await page.locator('#ch7 input[aria-label="折叠进度"]').fill(String(t))
      await page.waitForTimeout(250)
      const dev = await page.evaluate(({ t }) => {
        const M = window.__mech
        if (!M) return null
        const out = { maxPos: 0, maxQuat: 0, scale: {} }
        const slerp = (qa, qb, u) => {
          let d = qa[0]*qb[0]+qa[1]*qb[1]+qa[2]*qb[2]+qa[3]*qb[3]; let b = qb.slice()
          if (d < 0) { b = b.map(x => -x); d = -d }
          if (d > 0.9995) { const r = qa.map((x, i) => x + u * (b[i] - x)); const n = Math.hypot(...r); return r.map(x => x / n) }
          const th = Math.acos(Math.min(1, d)), s = Math.sin(th)
          return qa.map((x, i) => Math.sin((1 - u) * th) / s * x + Math.sin(u * th) / s * b[i])
        }
        for (const [pid, obj] of Object.entries(M.nodes)) {
          const tr = M.tracks[pid]
          if (!tr) continue
          const f = Math.min(1, Math.max(0, t)) * (M.n - 1)
          const i = Math.min(M.n - 2, Math.floor(f)), u = f - i
          const p = [0, 1, 2].map(k => tr.p[i*3+k] * (1 - u) + tr.p[(i+1)*3+k] * u)
          const q = slerp(tr.q.slice(i*4, i*4+4), tr.q.slice((i+1)*4, (i+1)*4+4), u)
          out.maxPos = Math.max(out.maxPos, Math.hypot(obj.position.x - p[0], obj.position.y - p[1], obj.position.z - p[2]))
          out.maxQuat = Math.max(out.maxQuat, Math.abs(Math.abs(obj.quaternion.x*q[0]+obj.quaternion.y*q[1]+obj.quaternion.z*q[2]+obj.quaternion.w*q[3]) - 1))
          if (pid.startsWith('ARM_A') || pid.startsWith('ARM_B')) out.scale[pid] = obj.scale.x
        }
        return out
      }, { t })
      results.push({ cand, version: ver.id, t, ...dev })
    }
    // 重点时刻截图（冻结版 + 一个历史版）
    if (ver.id === 'v321' || ver.id === 'v1') {
      for (const [t, name] of [[0.1, 'xarm'], [0.3, 'slider'], [0.7, 'root'], [1, 'foldend']]) {
        await page.locator('#ch7 input[aria-label="折叠进度"]').fill(String(t))
        await page.waitForTimeout(300)
        const box = await page.locator('#ch7 .scene-canvas').boundingBox()
        await page.screenshot({ path: path.join(OUT, `${cand}-${ver.id}-${name}.png`), clip: box })
      }
    }
  }
}
const bad = results.filter(r => r.maxPos > 1e-6 || r.maxQuat > 1e-6)
const scales = results.filter(r => Object.keys(r.scale || {}).length)
fs.writeFileSync(path.join(OUT, 'browser-transform-check.json'), JSON.stringify({ results, bad, n: results.length }, null, 1))
console.log('checks:', results.length, 'mismatch:', bad.length, 'maxPos:', Math.max(...results.map(r => r.maxPos)).toExponential(2), 'maxQuatDev:', Math.max(...results.map(r => r.maxQuat)).toExponential(2))
console.log('scz scales sample:', JSON.stringify(scales.slice(0, 2)))
await browser.close(); server.close()
