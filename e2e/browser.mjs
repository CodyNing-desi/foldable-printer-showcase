// 可移植的浏览器启动：优先 Playwright 自带浏览器；失败时回退 CHROME_PATH 或本机缓存。
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

function cachedExecutables() {
  const roots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'ms-playwright'),
    process.env.HOME && path.join(process.env.HOME, '.cache', 'ms-playwright'),
  ].filter(Boolean)
  const out = []
  for (const root of roots) {
    if (!fs.existsSync(root)) continue
    for (const dir of fs.readdirSync(root)) {
      for (const rel of ['chrome-headless-shell-win64/chrome-headless-shell.exe', 'chrome-win64/chrome.exe', 'chrome-linux/headless_shell', 'chrome-linux/chrome']) {
        const p = path.join(root, dir, rel)
        if (fs.existsSync(p)) out.push(p)
      }
    }
  }
  return out.sort().reverse()
}

export async function launchBrowser() {
  try {
    return await chromium.launch({ args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'] })
  } catch (e) {
    const candidates = [process.env.CHROME_PATH, ...cachedExecutables()].filter(Boolean)
    for (const exe of candidates) {
      try {
        return await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'] })
      } catch { /* try next */ }
    }
    throw new Error(
      '无法启动 Chromium。请先运行 `bunx playwright install chromium`（或 npx playwright install chromium），' +
      '或设置环境变量 CHROME_PATH 指向任意 Chromium 可执行文件。原始错误: ' + e.message,
    )
  }
}
