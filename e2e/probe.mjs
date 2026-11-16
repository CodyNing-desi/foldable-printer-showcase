import { chromium } from 'playwright'
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'
const DIST = path.resolve('dist')
const MIME = { '.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.glb':'model/gltf-binary','.md':'text/plain' }
const server = http.createServer((req,res)=>{ let p=decodeURIComponent(new URL(req.url,'http://x').pathname); if(p==='/')p='/index.html'; const f=path.join(DIST,p); if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return} res.writeHead(200,{'Content-Type':MIME[path.extname(f)]??'application/octet-stream'}); fs.createReadStream(f).pipe(res) })
await new Promise(r=>server.listen(4179,r))
const b = await chromium.launch({ executablePath:'C:/Users/94823/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe', args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader'] })
const pg = await b.newPage({ viewport:{width:1920,height:1080} })
const logs = []
pg.on('console', m => { const t=m.text(); if(/webgl|context|THREE|error|warn/i.test(t)) logs.push(m.type()+': '+t.slice(0,160)) })
pg.on('pageerror', e => logs.push('pageerror: '+String(e).slice(0,160)))
await pg.addInitScript(() => {
  window.__ctx = { created: 0, lost: 0, restored: 0, byType: {} }; window.__cidSeq = 0; window.__lostByCanvas = {}
  const orig = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function(type, ...a) {
    const c = orig.call(this, type, ...a)
    if (c && /webgl/.test(type)) {
      window.__ctx.created++; window.__ctx.byType[type] = (window.__ctx.byType[type]||0)+1; if(!this.__cid){ this.__cid = ++window.__cidSeq; } (window.__perCanvas=window.__perCanvas||{})[this.__cid] = ((window.__perCanvas||{})[this.__cid]||0)+1; if(window.__ctx.created<=40){ (window.__stacks=window.__stacks||[]).push(new Error().stack.split(String.fromCharCode(10)).slice(2,6).join(' | ')) }
      this.addEventListener('webglcontextlost', () => { window.__ctx.lost++; window.__lostByCanvas[this.__cid] = (window.__lostByCanvas[this.__cid]||0)+1 })
      this.addEventListener('webglcontextrestored', () => { window.__ctx.restored++ })
    }
    return c
  }
  window.__longtasks = 0
  new PerformanceObserver(l => { window.__longtasks += l.getEntries().length }).observe({ entryTypes: ['longtask'] })
})
const fps = async (ms=3000) => pg.evaluate(t => new Promise(res => { let n=0; const s=performance.now(); const loop=()=>{ n++; if(performance.now()-s<t) requestAnimationFrame(loop); else res(Math.round(n/(t/1000))) }; requestAnimationFrame(loop) }), ms)
await pg.goto('http://localhost:4179/', { waitUntil:'networkidle' })
await pg.waitForTimeout(4000)
await pg.evaluate(() => { window.__canvasInserts = 0; new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeName === 'CANVAS') window.__canvasInserts++ }).observe(document.body, { childList: true, subtree: true }) })
const idle = await pg.evaluate(() => ({ canvases: document.querySelectorAll('canvas').length, ctx: window.__ctx, longtasks: window.__longtasks, heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize/1e6) : null }))
const fpsIdle = await fps()
// ch7 播放
await pg.click('.nav-link:has-text("机构解释器")'); await pg.waitForTimeout(2500)
await pg.click('#ch7 .play-btn'); await pg.waitForTimeout(500)
const fpsPlay = await fps()
const play = await pg.evaluate(() => ({ r3fCreated: window.__r3fCreated, canvasInserts: window.__canvasInserts, ctx: window.__ctx, longtasks: window.__longtasks, heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize/1e6) : null }))
// 快速切换 tab
for (const t of ['SCZ','F07','F08','F09']) { await pg.click(`.seg button:has-text("${t}")`); await pg.waitForTimeout(700) }
const fpsSwitch = await fps(2000)
const sw = await pg.evaluate(() => ({ perCanvas: window.__perCanvas, lostByCanvas: window.__lostByCanvas, r3fCreated: window.__r3fCreated, canvasInserts: window.__canvasInserts, ctx: window.__ctx, canvases: document.querySelectorAll('canvas').length }))
const stacks = await pg.evaluate(() => (window.__stacks||[]).map(s => s.replace(/https?:\/\/[^/]+\//g,'').replace(/\?t=\d+/g,'')))
console.log(JSON.stringify({ idle, fpsIdle, fpsPlay, play, fpsSwitch, sw, logs: logs.slice(0,8), stacks }, null, 1))
await b.close(); server.close()
