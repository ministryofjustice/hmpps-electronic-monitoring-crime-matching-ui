/* eslint-disable no-console */
import pidusage from 'pidusage'
import pidtree from 'pidtree'
import { execFileSync } from 'node:child_process'
import { type Browser, type Page } from 'playwright'

export type ProximityAlertReportImages = {
  image1Jpg: Buffer
  image2Jpg: Buffer
  wearerImage1JpgById: Record<string, Buffer>
  wearerImage2JpgById: Record<string, Buffer>
}

export type RenderProximityAlertImagesArgs = {
  browser: Browser
  pageUrl: string
  baseUrlForCookies: string
  cookieHeader: string | undefined
  selectedDeviceWearerIds: string[]
  image1StateJson?: string
  viewport?: { width: number; height: number }
  deviceScaleFactor?: number
  timeoutMs?: number
  ignoreHTTPSErrors?: boolean
  jpegQuality?: number
}

const DEFAULT_VIEWPORT = { width: 1200, height: 650 }
const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_JPEG_QUALITY = 85

type PresetParam = 'image-2' | 'wearer-image-1' | 'wearer-image-2'

type Image1CaptureState = {
  mapWidthPx: number
  mapHeightPx: number
  devicePixelRatio: number
  view: {
    center: [number, number]
    resolution: number
    rotation: number
  }
}

type PeakResources = {
  chromiumCpuPct?: number
  chromiumRssMB?: number
  nodeRssMB?: number
}

function mb(bytes: number): number {
  return Math.round((bytes / 1024 / 1024) * 10) / 10
}

function makeTimers(label: string, meta?: Record<string, unknown>) {
  const startTime = Date.now()
  let last = startTime

  const sinceStart = () => Date.now() - startTime
  const sinceLast = () => {
    const now = Date.now()
    const d = now - last
    last = now
    return d
  }

  const log = (step: string, extra?: Record<string, unknown>) => {
    const totalMs = sinceStart()
    const stepMs = sinceLast()
    console.log(`[${label}] +${stepMs}ms (total ${totalMs}ms) ${step}`, { ...(meta ?? {}), ...(extra ?? {}) })
  }

  return { log, sinceStart }
}

function cookiesFromHeader(cookieHeader: string, baseUrlForCookies: string) {
  return cookieHeader
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const equalsIndex = part.indexOf('=')
      const name = equalsIndex >= 0 ? part.slice(0, equalsIndex) : part
      const value = equalsIndex >= 0 ? part.slice(equalsIndex + 1) : ''
      return { name, value, url: baseUrlForCookies }
    })
}

function pageUrlForHeadless(baseUrl: string, selectedDeviceWearerIds: string[]): string {
  const url = new URL(baseUrl)
  url.searchParams.set('headless', 'true')

  if (selectedDeviceWearerIds.length > 0) {
    url.searchParams.set('wearerIds', selectedDeviceWearerIds.join(','))
  }

  return url.toString()
}

function tryParseImage1State(json: string | undefined): Image1CaptureState | null {
  if (!json) return null
  try {
    const parsed = JSON.parse(json) as Image1CaptureState
    if (
      !parsed ||
      typeof parsed.mapWidthPx !== 'number' ||
      typeof parsed.mapHeightPx !== 'number' ||
      typeof parsed.devicePixelRatio !== 'number' ||
      !parsed.view ||
      !Array.isArray(parsed.view.center) ||
      parsed.view.center.length !== 2 ||
      typeof parsed.view.center[0] !== 'number' ||
      typeof parsed.view.center[1] !== 'number' ||
      typeof parsed.view.resolution !== 'number' ||
      typeof parsed.view.rotation !== 'number'
    ) {
      return null
    }
    if (parsed.mapWidthPx <= 0 || parsed.mapHeightPx <= 0) return null
    return parsed
  } catch {
    return null
  }
}

// eslint-friendly sequential runner (keeps deterministic / low-memory behaviour)
async function forEachSequential<T>(items: readonly T[], fn: (item: T, index: number) => Promise<void>): Promise<void> {
  await items.reduce<Promise<void>>((p, item, index) => p.then(() => fn(item, index)), Promise.resolve())
}

async function waitForAppLayersReady(page: Page): Promise<void> {
  await page.evaluate(() => {
    type DocumentLike = {
      addEventListener: (type: string, listener: () => void, options?: { once?: boolean }) => void
    }
    const root = globalThis as unknown as { document: DocumentLike }

    return new Promise<void>(resolve => {
      root.document.addEventListener('app:map:layers:ready', () => resolve(), { once: true })
    })
  })
}

async function waitForOlRenderComplete(page: Page): Promise<void> {
  await page.evaluate(() => {
    type EmMapLike = { olMapInstance?: unknown }
    type OlMapLike = {
      once: (eventName: string, handler: () => void) => void
      renderSync: () => void
    }

    const doc = (globalThis as unknown as { document?: unknown }).document
    if (!doc) throw new Error('document not available')

    const mapElement = (doc as { querySelector: (selector: string) => unknown }).querySelector(
      'em-map',
    ) as EmMapLike | null
    if (!mapElement?.olMapInstance) throw new Error('em-map.olMapInstance not found')

    const map = mapElement.olMapInstance as OlMapLike

    return new Promise<void>(resolve => {
      map.once('rendercomplete', resolve)
      map.renderSync()
    })
  })
}

// fast “toggle applied” wait (no tile barrier)
async function waitForNextPaint(page: Page): Promise<void> {
  await page.evaluate(() => {
    const raf = (globalThis as unknown as { requestAnimationFrame?: (cb: () => void) => void }).requestAnimationFrame
    return new Promise<void>(resolve => {
      if (!raf) {
        setTimeout(() => resolve(), 0)
        return
      }
      raf(() => raf(resolve))
    })
  })
}

function startResourceSampler(_browser: Browser, label: string, intervalMs = 200) {
  const peak: PeakResources = {}
  let stopped = false

  const getCommand = (pid: number): string => {
    try {
      return execFileSync('ps', ['-p', String(pid), '-o', 'command='], { encoding: 'utf8' }).trim()
    } catch {
      return ''
    }
  }

  const isChromiumLike = (cmd: string): boolean => {
    const s = cmd.toLowerCase()
    return (
      s.includes('chromium') ||
      s.includes('chrome') ||
      s.includes('headless_shell') ||
      s.includes('chrome-headless-shell')
    )
  }

  const sampleOnce = async () => {
    const nodeRssMB = mb(process.memoryUsage().rss)
    if (!peak.nodeRssMB || nodeRssMB > peak.nodeRssMB) peak.nodeRssMB = nodeRssMB

    const pids = await pidtree(process.pid, { root: true })
    const chromiumPids = pids.filter(pid => {
      const cmd = getCommand(pid)
      return Boolean(cmd) && isChromiumLike(cmd)
    })

    if (chromiumPids.length === 0) return

    const results = await Promise.allSettled(chromiumPids.map(pid => pidusage(pid)))

    let totalChromiumRssBytes = 0
    let totalChromiumCpuPct = 0

    for (const result of results) {
      if (result.status === 'fulfilled') {
        totalChromiumRssBytes += result.value.memory
        totalChromiumCpuPct += result.value.cpu
      }
    }

    const chromiumRssMB = mb(totalChromiumRssBytes)
    const chromiumCpuPct = Math.round(totalChromiumCpuPct * 10) / 10

    if (!peak.chromiumRssMB || chromiumRssMB > peak.chromiumRssMB) peak.chromiumRssMB = chromiumRssMB
    if (!peak.chromiumCpuPct || chromiumCpuPct > peak.chromiumCpuPct) peak.chromiumCpuPct = chromiumCpuPct
  }

  const tick = async () => {
    try {
      await sampleOnce()
    } catch {
      // ignore sampling errors
    }
  }

  const timer = setInterval(() => {
    if (stopped) return
    tick()
  }, intervalMs)

  const stop = async () => {
    stopped = true
    clearInterval(timer)
    await tick()
    console.log(`[resources:${label}] peak`, peak)
    return peak
  }

  return { stop, peak }
}

async function applyPreset(page: Page, preset: PresetParam, wearerId?: string): Promise<void> {
  await page.evaluate(
    ({ preset: p, wearerId: w }) => {
      const win = globalThis as unknown as {
        mapImages?: { applyPreset?: (preset: string, wearerId?: string) => void }
      }
      if (!win.mapImages?.applyPreset) throw new Error('window.mapImages.applyPreset not found')
      win.mapImages.applyPreset(p, w)
    },
    { preset, wearerId },
  )
}

async function applyImage1State(page: Page, state: Image1CaptureState): Promise<void> {
  await page.evaluate(
    ({ s }) => {
      const win = globalThis as unknown as {
        mapImages?: { applyImage1CaptureState?: (state: unknown) => void }
      }
      if (!win.mapImages?.applyImage1CaptureState) throw new Error('window.mapImages.applyImage1CaptureState not found')
      win.mapImages.applyImage1CaptureState(s)
    },
    { s: state },
  )
}

export async function renderProximityAlertReportImages(
  args: RenderProximityAlertImagesArgs,
): Promise<ProximityAlertReportImages> {
  const {
    browser,
    pageUrl,
    baseUrlForCookies,
    cookieHeader,
    selectedDeviceWearerIds,
    image1StateJson,
    viewport = DEFAULT_VIEWPORT,
    deviceScaleFactor = 2,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    ignoreHTTPSErrors = false,
    jpegQuality = DEFAULT_JPEG_QUALITY,
  } = args

  const timers = makeTimers('mapImageRenderer', { pageUrl })
  timers.log('start', {
    viewport,
    deviceScaleFactor,
    timeoutMs,
    jpegQuality,
    selectedDeviceWearerIdsCount: selectedDeviceWearerIds.length,
  })

  const sampler = startResourceSampler(browser, 'export-proximity-alert')
  const sessionCookies = cookieHeader ? cookiesFromHeader(cookieHeader, baseUrlForCookies) : []

  const parsedImage1State = tryParseImage1State(image1StateJson)
  const headlessDeviceScaleFactor = parsedImage1State ? parsedImage1State.devicePixelRatio : deviceScaleFactor

  const contextStart = Date.now()
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: headlessDeviceScaleFactor,
    ignoreHTTPSErrors,
  })
  timers.log('context created', { contextMs: Date.now() - contextStart, headlessDeviceScaleFactor })

  try {
    if (sessionCookies.length > 0) {
      const addCookiesStart = Date.now()
      await context.addCookies(sessionCookies)
      timers.log('cookies added to context', { addCookiesMs: Date.now() - addCookiesStart })
    } else {
      timers.log('no cookie header provided')
    }

    const pageStart = Date.now()
    const page = await context.newPage()
    page.setDefaultTimeout(timeoutMs)
    page.setDefaultNavigationTimeout(timeoutMs)
    timers.log('page created', { pageMs: Date.now() - pageStart })

    page.on('console', msg => console.log('[browser console]', msg.type(), msg.text()))
    page.on('pageerror', err => console.error('[browser pageerror]', err))
    page.on('requestfailed', request => console.warn('[browser requestfailed]', request.url(), request.failure()))

    let targetUrl = pageUrlForHeadless(pageUrl, selectedDeviceWearerIds)

    if (parsedImage1State) {
      const url = new URL(targetUrl)
      url.searchParams.set('mapW', String(parsedImage1State.mapWidthPx))
      url.searchParams.set('mapH', String(parsedImage1State.mapHeightPx))
      targetUrl = url.toString()
    }

    timers.log('navigate start', { targetUrl })

    const gotoStart = Date.now()
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' })
    timers.log('page.goto complete', {
      gotoMs: Date.now() - gotoStart,
      finalUrl: page.url(),
      title: await page.title(),
    })

    const readyStart = Date.now()
    await waitForAppLayersReady(page)
    timers.log('app layers ready', { readyWaitMs: Date.now() - readyStart })

    const initRenderStart = Date.now()
    await waitForOlRenderComplete(page)
    timers.log('initial ol rendercomplete', { renderWaitMs: Date.now() - initRenderStart })

    const mapElementHandle = await page.$('em-map')
    if (!mapElementHandle) throw new Error('Map element <em-map> not found for screenshot')

    const screenshot = async (extra?: Record<string, unknown>): Promise<Buffer> => {
      const screenshotStart = Date.now()
      const jpg = await mapElementHandle.screenshot({ type: 'jpeg', quality: jpegQuality })
      timers.log('screenshot captured', {
        ...(extra ?? {}),
        screenshotMs: Date.now() - screenshotStart,
        bytes: jpg.length,
      })
      return jpg
    }

    // -------------------------
    // Image 1 phase (apply captured view once, then toggle-only per wearer)
    // -------------------------
    let image1Jpg: Buffer

    if (parsedImage1State) {
      const applyStart = Date.now()
      await applyImage1State(page, parsedImage1State)
      timers.log('image1 state applied', { applyMs: Date.now() - applyStart })

      const renderStart = Date.now()
      await waitForOlRenderComplete(page)
      timers.log('ol rendercomplete (image1 state)', { renderWaitMs: Date.now() - renderStart })

      image1Jpg = await screenshot({ phase: 'image-1-overview' })
    } else {
      image1Jpg = await screenshot({ phase: 'image-1-overview-fallback' })
    }

    const wearerImage1JpgById: Record<string, Buffer> = {}
    await forEachSequential(selectedDeviceWearerIds, async wearerId => {
      const applyStart = Date.now()
      await applyPreset(page, 'wearer-image-1', wearerId)
      timers.log('preset applied', { preset: 'wearer-image-1', wearerId, applyMs: Date.now() - applyStart })

      const paintStart = Date.now()
      await waitForNextPaint(page)
      timers.log('next paint', { preset: 'wearer-image-1', wearerId, paintWaitMs: Date.now() - paintStart })

      wearerImage1JpgById[wearerId] = await screenshot({ preset: 'wearer-image-1', wearerId })
    })

    // -------------------------
    // Image 2 phase (fit once, then toggle-only per wearer)
    // -------------------------
    const apply2Start = Date.now()
    await applyPreset(page, 'image-2')
    timers.log('preset applied', { preset: 'image-2', applyMs: Date.now() - apply2Start })

    const render2Start = Date.now()
    await waitForOlRenderComplete(page)
    timers.log('ol rendercomplete (image-2)', { renderWaitMs: Date.now() - render2Start })

    const image2Jpg = await screenshot({ preset: 'image-2' })

    const wearerImage2JpgById: Record<string, Buffer> = {}
    await forEachSequential(selectedDeviceWearerIds, async wearerId => {
      const applyStart = Date.now()
      await applyPreset(page, 'wearer-image-2', wearerId)
      timers.log('preset applied', { preset: 'wearer-image-2', wearerId, applyMs: Date.now() - applyStart })

      const paintStart = Date.now()
      await waitForNextPaint(page)
      timers.log('next paint', { preset: 'wearer-image-2', wearerId, paintWaitMs: Date.now() - paintStart })

      wearerImage2JpgById[wearerId] = await screenshot({ preset: 'wearer-image-2', wearerId })
    })

    timers.log('complete', { totalMs: timers.sinceStart() })
    return { image1Jpg, image2Jpg, wearerImage1JpgById, wearerImage2JpgById }
  } catch (err) {
    timers.log('failed', { totalMs: timers.sinceStart(), error: err instanceof Error ? err.message : String(err) })
    throw err
  } finally {
    const closeStart = Date.now()
    await context.close()
    timers.log('context closed', { closeMs: Date.now() - closeStart })
    await sampler.stop()
  }
}
