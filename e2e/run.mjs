// 端到端验收：本地静态服务器 + Playwright（离线：阻断一切外部请求）
import { chromium } from 'playwright'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const SHOTS = path.join(ROOT, 'e2e', 'shots')
fs.mkdirSync(SHOTS, { recursive: true })

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png',
  '.gif': 'image/gif', '.md': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml',
}

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (p === '/') p = '/index.html'
  const file = path.join(DIST, p)
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end('not found'); return
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})
await new Promise(r => server.listen(4173, r))

const EXE = process.env.CHROME_PATH || 'C:/Users/94823/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe'
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] })
const results = []
const errors = []
function check(name, ok, extra = '') {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  [' + extra + ']' : ''}`)
}

const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push(String(e)))
// 离线验证：阻断所有非本地请求
await page.route('**/*', route => {
  const u = new URL(route.request().url())
  if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return route.continue()
  return route.abort()
})

const shot = (name) => page.screenshot({ path: path.join(SHOTS, `${name}.png`) })

// 1. 首页
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
check('首页标题', await page.getByRole('heading', { name: /一台3D打印机/ }).count() === 1)
check('首页副标题', (await page.textContent('body')).includes('15种机构构想，数轮仿真与审查，三条实物验证路线'))
await shot('01-hero-1920')

// 2. 候选总览
await page.click('.nav-link:has-text("15种候选")')
await page.waitForTimeout(900)
check('15 张候选卡', await page.locator('.cand-card').count() === 15)
await shot('02-candidates-s0')

// 3. 阶段切换：V1 初筛 F04 曾被推荐
await page.click('.stage-pill:has-text("V1 初筛")')
await page.waitForTimeout(400)
const f04card = page.locator('.cand-card', { hasText: 'F04' }).first()
check('F04 曾被推荐标签', (await f04card.textContent()).includes('曾被推荐'))
await shot('03-stage-v1pre')

// 4. 详情抽屉
await f04card.click()
await page.waitForTimeout(500)
check('F04 抽屉打开', await page.locator('.drawer').count() === 1)
check('抽屉含 45.338', (await page.locator('.drawer').textContent()).includes('45.338'))
check('抽屉含时间线', await page.locator('.drawer .hist-item').count() === 7)
await shot('04-drawer-f04')
await page.click('.drawer .close')
await page.waitForTimeout(300)

// 5. 冻结名单重组
await page.click('.stage-pill:has-text("V3.2.1 冻结")')
await page.waitForTimeout(700)
check('最终分组：主候选', (await page.locator('.final-groups').textContent()).includes('主候选'))
check('最终分组：No-Go 及归档', (await page.locator('.final-groups').textContent()).includes('No-Go 及归档'))
check('归档 chip 数量 11', await page.locator('.cand-chip').count() === 11)
await shot('05-stage-v321-groups')

// 6. 指标矩阵 + 采样反例
await page.click('.nav-link:has-text("统一筛选")')
await page.waitForTimeout(900)
check('矩阵 15 行', await page.locator('.matrix tbody tr').count() === 15)
await page.locator('.matrix td.cell').first().hover()
await page.waitForTimeout(200)
check('矩阵悬停提示', await page.locator('.tooltip').count() === 1)
await shot('06-matrix-tooltip')
await page.click('.seg-btn:has-text("V3.2.1 认证上界")')
await page.waitForTimeout(300)
check('正弦反例 FAIL 判定', (await page.locator('.verdict').textContent()).includes('FAIL'))
await shot('07-sampling-certified')

// 7. F04 前后对比
await page.click('.nav-link:has-text("F04 逆转")')
await page.waitForTimeout(900)
await page.locator('#ch4 input[type=range]').fill('1')
await page.waitForTimeout(300)
check('F04 After 标签激活', await page.locator('#ch4 .f04-labels .on').textContent() === 'After · 补全机构后的模型')
await shot('08-f04-after')

// 8. F12 决策转移
await page.click('.nav-link:has-text("F12 逆转")')
await page.waitForTimeout(900)
await page.click('.btn:has-text("播放决策转移")')
await page.waitForTimeout(1200)
check('F12 No-Go 转移', (await page.locator('.f12-track').textContent()).includes('No-Go'))
await shot('09-f12-nogo')

// 9. 最终决策板
await page.click('.nav-link:has-text("最终决策")')
await page.waitForTimeout(900)
check('决策板 5 张卡', await page.locator('.board-card').count() === 5)
check('SCZ Bench-only', (await page.locator('.board').textContent()).includes('Bench-only'))
await shot('10-decision-board')

// 10. 运动展示
await page.click('.nav-link:has-text("机构运动")')
await page.waitForTimeout(1200)
const frameText = () => page.locator('.player-controls .mono').textContent()
const f0 = await frameText()
await page.click('.play-btn')
await page.waitForTimeout(1600)
const f1 = await frameText()
check('F09 播放推进帧', f0 !== f1, `${f0} -> ${f1}`)
await page.click('.play-btn') // 暂停
const f2 = await frameText()
await page.waitForTimeout(700)
check('暂停后帧不变', f2 === await frameText())
await page.locator('.player input[type=range]').fill('24')
await page.waitForTimeout(200)
check('拖动进度条到帧25', (await frameText()).includes('25/48'))
await page.click('.kf-btn:has-text("折叠")')
await page.waitForTimeout(200)
check('关键帧切换到折叠', (await frameText()).includes('48/48'))
await shot('11-motion-f09-folded')
await page.click('.motion-tab:has-text("SCZ")')
await page.waitForTimeout(900)
check('SCZ 相位标签', (await page.locator('.phase-bar').textContent()).includes('剪叉收拢'))
await page.click('.play-btn')
await page.waitForTimeout(1200)
await shot('12-motion-scz')
await page.click('.motion-tab:has-text("F07")')
await page.waitForTimeout(700)
check('F07 切换', (await page.locator('.player').textContent()).includes('单立柱抬升与根部翻折'))

// 11. 证据模态
await page.click('.nav-link:has-text("走向实物")')
await page.waitForTimeout(800)
await page.click('.btn:has-text("查看技术证据")')
await page.waitForTimeout(400)
check('证据索引打开', await page.locator('.modal-index').count() === 1)
await page.locator('.modal-index .ev-item', { hasText: '第一轮独立审查' }).locator('button:has-text("本地阅读")').click()
await page.waitForTimeout(600)
check('审查原文本地加载', (await page.locator('.modal-body pre').textContent()).includes('槽轨'))
await shot('13-evidence-review')
await page.click('.modal .close')
await page.waitForTimeout(300)

// 12. 自动演示
await page.click('.nav-link:has-text("问题提出")')
await page.waitForTimeout(700)
await page.click('.nav-auto')
await page.waitForTimeout(1500)
check('自动演示条出现', await page.locator('.auto-bar').count() === 1)
await shot('14-autoplay-running')
await page.click('.auto-bar .btn:has-text("暂停")')
await page.waitForTimeout(300)
check('暂停按钮变继续', await page.locator('.auto-bar .btn:has-text("继续")').count() === 1)
await page.click('.auto-bar .btn:has-text("下一段")')
await page.waitForTimeout(800)
check('下一段推进', (await page.locator('.auto-cap .idx').textContent()).includes('2/15'))
await page.click('.auto-bar .btn:has-text("上一段")')
await page.waitForTimeout(500)
check('上一段回退', (await page.locator('.auto-cap .idx').textContent()).includes('1/15'))
// 演示中点击候选卡 → 抽屉打开且演示暂停
await page.click('.auto-bar .btn:has-text("继续")')
await page.waitForTimeout(300)
await page.click('.auto-bar .btn:has-text("下一段")') // -> step2 ch2 s0
await page.waitForTimeout(1200)
await page.locator('.cand-card').first().click()
await page.waitForTimeout(500)
check('演示中可打开候选详情', await page.locator('.drawer').count() === 1)
check('打开详情自动暂停', await page.locator('.auto-bar .btn:has-text("继续")').count() === 1)
await page.click('.drawer .close')
await page.click('.auto-bar .btn:has-text("退出演示")')
await page.waitForTimeout(300)
check('退出演示', await page.locator('.auto-bar').count() === 0)

// 13. 笔记本分辨率无横向溢出
await page.setViewportSize({ width: 1366, height: 768 })
await page.waitForTimeout(600)
const overflow1366 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
check('1366 无横向溢出', overflow1366 <= 0, `overflow=${overflow1366}px`)
await page.click('.nav-link:has-text("15种候选")')
await page.waitForTimeout(800)
await shot('15-laptop-candidates')
await page.setViewportSize({ width: 1920, height: 1080 })

// 14. 控制台错误
const blocking = errors.filter(e => !/favicon/i.test(e))
check('控制台无阻断错误', blocking.length === 0, blocking.slice(0, 3).join(' | '))

await browser.close()
server.close()
const failed = results.filter(r => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
