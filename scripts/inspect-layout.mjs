#!/usr/bin/env node
// One-off UI inspector. Walks the site at several viewports, screenshots
// each route, and reports any layout issues it can detect from the DOM.

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')
const OUT_DIR = resolve(ROOT, 'screenshots')
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

const VIEWPORTS = [
  { name: 'mobile-360', width: 360, height: 780 },
  { name: 'mobile-414', width: 414, height: 896 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1280', width: 1280, height: 800 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
]

const ROUTES = [
  { name: 'home', path: '/homepage' },
  { name: 'projects', path: '/projects' },
  { name: 'project-detail', path: '/projects/pyclimb-project' },
]

async function inspect(page, route, viewport) {
  await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' })
  // scroll through the page so framer-motion's whileInView animations fire,
  // then back to top before screenshotting
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.85
    const total = document.documentElement.scrollHeight
    for (let y = 0; y < total; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 80))
    }
    window.scrollTo(0, 0)
    await new Promise((r) => setTimeout(r, 200))
  })

  const findings = await page.evaluate(() => {
    const issues = []
    const docWidth = document.documentElement.clientWidth
    const docHeight = document.documentElement.scrollHeight
    if (document.documentElement.scrollWidth > docWidth + 1) {
      issues.push({
        kind: 'horizontal-overflow',
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: docWidth,
      })
    }

    // Find any element that extends outside the viewport horizontally.
    const offenders = []
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      const overflowsRight = r.right - docWidth > 2
      const overflowsLeft = r.left < -2
      if (overflowsRight || overflowsLeft) {
        const cls = el.className && typeof el.className === 'string' ? el.className : ''
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: cls.slice(0, 120),
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
        })
      }
    })

    // Detect text that's clipped (overflow ellipsis or text-overflow not handled)
    const truncations = []
    document.querySelectorAll('h1, h2, h3, p, span, strong, em, b').forEach((el) => {
      if (el.scrollWidth - el.clientWidth > 2 || el.scrollHeight - el.clientHeight > 2) {
        const cs = getComputedStyle(el)
        if (cs.overflow === 'hidden' || cs.textOverflow === 'ellipsis') {
          const cls = el.className && typeof el.className === 'string' ? el.className : ''
          truncations.push({
            tag: el.tagName.toLowerCase(),
            cls: cls.slice(0, 120),
            scrollW: el.scrollWidth,
            clientW: el.clientWidth,
          })
        }
      }
    })

    return {
      docWidth,
      docHeight,
      offenders: offenders.slice(0, 10),
      truncations: truncations.slice(0, 10),
      issues,
    }
  })

  return findings
}

async function run() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch()
  const report = []

  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      })
      const page = await context.newPage()

      for (const route of ROUTES) {
        const findings = await inspect(page, route, vp)
        const file = resolve(OUT_DIR, `${vp.name}-${route.name}.png`)
        await page.screenshot({ path: file, fullPage: true })
        report.push({ viewport: vp.name, route: route.name, findings })
      }

      await context.close()
    }
  } finally {
    await browser.close()
  }

  console.log(JSON.stringify(report, null, 2))
}

run().catch((err) => {
  console.error('inspect-layout failed:', err)
  process.exit(1)
})
