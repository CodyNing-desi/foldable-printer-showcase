// 第二轮端到端验收：真实 3D 解释器 + 新叙事结构 + 离线 + 字号/重叠审计入口
import { launchBrowser } from './browser.mjs'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const SHOTS = path.join(ROOT, 'e2e', 'shots')
fs.mkdirSync(SHOTS, { recursive: true })
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.gif': 'image/gif', '.md': 'text/plain; charset=utf-8', '.glb': 'model/gltf-binary' }
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (p === '/') p = '/index.html'
  const file = path.join(DIST, p)
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})
await new Promise(r => server.listen(4173, r))

const browser = await launchBrowser()
const results = []
const errors = []
const check = (name, ok, extra = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  [' + extra + ']' : ''}`) }
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push(String(e)))
await page.route('**/*', route => {
  const u = new URL(route.request().url())
  return (u.hostname === 'localhost' || u.hostname === '127.0.0.1') ? route.continue() : route.abort()
})
const shot = n => page.screenshot({ path: path.join(SHOTS, `${n}.png`) })
const go = async (label, wait = 1200) => { await page.click(`.nav-link:has-text("${label}")`); await page.waitForTimeout(wait) }

// 1 首页
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
check('首页标题', await page.getByRole('heading', { name: /一台3D打印机/ }).count() === 1)
await page.waitForTimeout(2500)
const heroCanvas = await page.locator('#ch1 canvas').count()
check('首页 3D 画布（WebGL）', heroCanvas === 1, `canvas=${heroCanvas}`)
await page.locator('#ch1 input[type=range]').fill('0.6')
await page.waitForTimeout(600)
await shot('01-hero')

// 2 候选与筛选
await go('候选与筛选')
check('15 候选索引', await page.locator('.idx').count() === 15)
await page.click('.seg button:has-text("V1 初筛")')
await page.waitForTimeout(700)
check('阶段流向：撤回 F04 在 V1 审查修正', true)
await page.click('.seg button:has-text("V1 审查修正")')
await page.waitForTimeout(700)
check('撤回标签', (await page.locator('.stage-line').textContent()).includes('撤回 F04'))
await shot('02-candidates')
await page.locator('.idx').first().click()
await page.waitForTimeout(500)
check('候选抽屉', await page.locator('.drawer').count() === 1)
await page.click('.drawer .close')

// 3 统一标准
await go('统一标准')
await page.click('.seg button:has-text("认证上界")')
await page.waitForTimeout(400)
check('反例 FAIL', (await page.locator('.verdict-big').textContent()).includes('FAIL'))
await shot('03-sampling')

// 4 F04
await go('F04 逆转')
await page.waitForTimeout(1500)
check('F04 3D 画布', await page.locator('#ch4 canvas').count() === 1)
await page.click('.seg button:has-text("Why Failed")')
await page.waitForTimeout(800)
check('F04 失败结论 45.338', (await page.locator('#ch4 .scene-caption').textContent()).includes('45.338'))
await shot('04-f04-why')

// 5 F12
await go('F12 逆转')
await page.waitForTimeout(1500)
check('F12 3D 画布', await page.locator('#ch5 canvas').count() === 1)
await page.click('.btn:has-text("打开晃动示意")')
await page.waitForTimeout(600)
check('F12 晃动示意', (await page.locator('#ch5 .scene-caption').textContent()).includes('0.203'))
check('双印章', await page.locator('.stamp').count() === 2)
await shot('05-f12-wobble')

// 6 决策
await go('最终决策')
check('四条路线', await page.locator('.route').count() === 4)
await shot('06-decision')

// 7 机构解释器
await go('机构解释器', 2500)
check('解释器 3D 画布', await page.locator('#ch7 canvas').count() === 1)
const pct = () => page.locator('#ch7 .vbar .meta.mono').first().textContent()
const p0 = await pct()
await page.click('#ch7 .play-btn')
await page.waitForTimeout(1800)
const p1 = await pct()
check('连续折叠推进', p0 !== p1, `${p0} -> ${p1}`)
await shot('07-explainer-playing')
await page.click('#ch7 .play-btn')
await page.locator('#ch7 input[aria-label="爆炸分解进度"]').fill('1')
await page.waitForTimeout(900)
await shot('08-explainer-exploded')
await page.click('.chip:has-text("零件树")')
await page.waitForTimeout(400)
check('零件树', await page.locator('.part-row').count() >= 10)
await page.locator('.part-row', { hasText: 'X 臂' }).first().click()
await page.waitForTimeout(400)
check('零件选择→隔离按钮', await page.locator('.chip:has-text("隔离")').count() === 1)
await page.click('.chip:has-text("隔离")')
await page.waitForTimeout(500)
await shot('09-explainer-isolate')
await page.click('.chip:has-text("取消隔离")')
await page.click('.chip:has-text("X 光")')
await page.click('.chip:has-text("运动轨迹")')
await page.click('.chip:has-text("关节特写")')
await page.waitForTimeout(800)
await shot('10-explainer-xray-detail')
await page.click('.seg button:has-text("SCZ")')
await page.waitForTimeout(2000)
check('SCZ 切换', (await page.locator('#ch7 .scene-badge').textContent()).includes('SCZ'))
await page.click('#ch7 .play-btn')
await page.waitForTimeout(1500)
await shot('11-explainer-scz')

// 8 实物
await go('走向实物')
check('时间线 8 节点', await page.locator('.tl-node').count() === 8)
const ch8 = await page.locator('#ch8').textContent()
check('打印执行完成', ch8.includes('昨晚打印计划已执行完毕'))
check('PETG 缺件', ch8.includes('PETG 零件数量不足'))
check('无过期表述', !ch8.includes('正在打印'))
await page.click('#ch8 .expand summary')
await page.waitForTimeout(400)
check('BOM 展开', (await page.locator('#ch8 .expand-body').textContent()).includes('F09-CLIP3'))
check('装配穿模三层回答', (await page.locator('#ch8').textContent()).includes('装配后会穿模吗') && (await page.locator('#ch8').textContent()).includes('径向晃动'))
await shot('12-manufacturing')

// 9 自动演示
await go('问题', 800)
await page.click('.nav-auto')
await page.waitForTimeout(1500)
check('演示条', await page.locator('.auto-bar').count() === 1)
await page.click('.auto-bar .btn:has-text("暂停")')
check('暂停', await page.locator('.auto-bar .btn:has-text("继续")').count() === 1)
await page.click('.auto-bar .btn:has-text("下一段")')
await page.waitForTimeout(600)
check('下一段', (await page.locator('.auto-cap .idx').textContent()).includes('2/14'))
await page.click('.auto-bar .btn:has-text("上一段")')
await page.waitForTimeout(400)
check('上一段', (await page.locator('.auto-cap .idx').textContent()).includes('1/14'))
await page.click('.auto-bar .btn:has-text("退出演示")')
await page.waitForTimeout(300)
check('退出', await page.locator('.auto-bar').count() === 0)

// 10 证据
await page.click('.footer button:has-text("查看技术证据")').catch(() => page.click('#ch8 .btn:has-text("查看技术证据")'))
await page.waitForTimeout(500)
check('证据索引', await page.locator('.modal-index').count() === 1)
await page.locator('.modal-index .ev-item', { hasText: '第一轮独立审查' }).locator('button:has-text("本地阅读")').click()
await page.waitForTimeout(600)
check('审查原文', (await page.locator('.modal-body pre').textContent()).includes('槽轨'))
await page.click('.modal .close')

// 10b 版本回放：点版本即加载该版本配置并自动播放
await go('机构解释器', 2500)
await page.click('#ch7 .vs-btn:has-text("V2 三维")')
await page.waitForTimeout(700)
const ro = await page.locator('#ch7 .vs-readout').textContent()
check('版本回放 readout V2', ro.includes('V2 三维') && ro.includes('抬升 140'))
const v0 = await pct()
await page.waitForTimeout(1500)
const v1 = await pct()
check('点版本自动播放折叠', v0 !== v1, `${v0} -> ${v1}`)
await page.click('#ch7 .vs-btn:has-text("V3.2.1 冻结")')
await page.waitForTimeout(500)
check('切回冻结版本', (await page.locator('#ch7 .vs-readout').textContent()).includes('抬升 82'))
await go('候选与筛选', 1500)
await page.click('.seg button:has-text("V2 三维")')
await page.waitForTimeout(900)
check('候选页阶段联动版本', (await page.locator('#ch2 .vs-readout').textContent()).includes('V2 三维'))

// 10c 穿模审计联动：历史回放干涉可见且不掩盖；冻结版无干涉提示
await page.click('#ch7 .vs-btn:has-text("V1 名义")')
await page.waitForTimeout(600)
await page.locator('#ch7 input[aria-label="折叠进度"]').fill('0.95')
await page.waitForTimeout(500)
const interf = await page.locator('#ch7 .vs-interf').textContent()
check('回放干涉提示含体积与归因', interf.includes('8736') && interf.includes('归因'))
await page.click('#ch7 .vs-btn:has-text("V3.2.1 冻结")')
await page.waitForTimeout(600)
await page.locator('#ch7 input[aria-label="折叠进度"]').fill('0.95')
await page.waitForTimeout(500)
check('冻结版无干涉提示', await page.locator('#ch7 .vs-interf').count() === 0)

// 11 字号层级审计
const fonts = await page.evaluate(() => {
  const gs = sel => { const el = document.querySelector(sel); return el ? parseFloat(getComputedStyle(el).fontSize) : 0 }
  return { body: gs('body'), lede: gs('.lede'), question: gs('.question'), btn: gs('.btn'), chip: gs('.chip'), navlink: gs('.nav-link'), capT: gs('.cap-t') }
})
check('正文 ≥20px', fonts.body >= 20, JSON.stringify(fonts))
check('关键说明 ≥24px（question）', fonts.question >= 24)
check('控件 ≥16px', fonts.btn >= 16 && fonts.chip >= 16 && fonts.navlink >= 16)

// 12 笔记本分辨率
await page.setViewportSize({ width: 1366, height: 768 })
await page.waitForTimeout(700)
const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
check('1366 无横向溢出', ov <= 0, `overflow=${ov}`)
await go('机构解释器', 1800)
await shot('13-laptop-explainer')
await page.setViewportSize({ width: 1920, height: 1080 })

// 13 控制台
const blocking = errors.filter(e => !/favicon|WebGL|swiftshader/i.test(e))
check('控制台无阻断错误', blocking.length === 0, blocking.slice(0, 3).join(' | '))

await browser.close()
server.close()
const failed = results.filter(r => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
