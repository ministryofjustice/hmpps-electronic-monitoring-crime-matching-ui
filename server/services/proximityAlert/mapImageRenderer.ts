/* eslint-disable no-console */
import { type Browser, type Page } from 'playwright'

export type ProximityAlertMapImages = {
  image1Jpg: Buffer
  image2Jpg: Buffer
}

export type RenderProximityAlertImagesArgs = {
  browser: Browser
  pageUrl: string
  baseUrlForCookies: string
  cookieHeader: string | undefined
  viewport?: { width: number; height: number }
  deviceScaleFactor?: number
  timeoutMs?: number
  ignoreHTTPSErrors?: boolean
  jpegQuality?: number
}

const DEFAULT_VIEWPORT = { width: 1200, height: 800 }
const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_JPEG_QUALITY = 85

type PresetParam = 'image-1' | 'image-2'

// Helper to log performance times at key steps i the process
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

// Convert the incoming HTTP Cookie header into Playwright cookie objects
// so the headless browser can reuse the user's authenticated session.
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

function pageUrlForPreset(baseUrl: string, preset: PresetParam): string {
  const url = new URL(baseUrl)
  url.searchParams.set('preset', preset)
  url.searchParams.set('headless', 'true')
  return url.toString()
}

// Wait until the map component signals that layers are ready.
// This listens for the custom event dispatched in initialiseProximityAlertMapImagesView.
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

// Wait for OpenLayers to finish a render cycle by listening to `rendercomplete` on em-map.olMapInstance.
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

export async function renderProximityAlertMapImages(
  args: RenderProximityAlertImagesArgs,
): Promise<ProximityAlertMapImages> {
  const {
    browser,
    pageUrl,
    baseUrlForCookies,
    cookieHeader,
    viewport = DEFAULT_VIEWPORT,
    deviceScaleFactor = 2,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    ignoreHTTPSErrors = false,
    jpegQuality = DEFAULT_JPEG_QUALITY,
  } = args

  const timers = makeTimers('mapImageRenderer', { pageUrl })
  timers.log('start', { viewport, deviceScaleFactor, timeoutMs, jpegQuality })

  const contextStart = Date.now()
  const context = await browser.newContext({ viewport, deviceScaleFactor, ignoreHTTPSErrors })
  timers.log('context created', { contextMs: Date.now() - contextStart })

  // Cookies
  try {
    if (cookieHeader) {
      const cookieStart = Date.now()
      const sessionCookies = cookiesFromHeader(cookieHeader, baseUrlForCookies)
      timers.log('cookies parsed', { cookieCount: sessionCookies.length, parseMs: Date.now() - cookieStart })

      if (sessionCookies.length > 0) {
        const addCookiesStart = Date.now()
        await context.addCookies(sessionCookies)
        timers.log('cookies added to context', { addCookiesMs: Date.now() - addCookiesStart })
      }
    } else {
      timers.log('no cookie header provided')
    }

    // New page
    const pageStart = Date.now()
    const page = await context.newPage()
    page.setDefaultTimeout(timeoutMs)
    page.setDefaultNavigationTimeout(timeoutMs)
    timers.log('page created', { pageMs: Date.now() - pageStart })

    page.on('console', msg => console.log('[browser console]', msg.type(), msg.text()))
    page.on('pageerror', err => console.error('[browser pageerror]', err))
    page.on('requestfailed', request => console.warn('[browser requestfailed]', request.url(), request.failure()))

    const screenshotPreset = async (preset: PresetParam): Promise<Buffer> => {
      const targetUrl = pageUrlForPreset(pageUrl, preset)
      timers.log('preset navigate start', { preset, targetUrl })

      const gotoStart = Date.now()
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' })
      timers.log('page.goto complete', {
        preset,
        gotoMs: Date.now() - gotoStart,
        finalUrl: page.url(),
        title: await page.title(),
      })

      // Wait for map ready flag
      const readyStart = Date.now()
      await waitForAppLayersReady(page)
      timers.log('mapImages.ready === true', { preset, readyWaitMs: Date.now() - readyStart })

      const renderStart = Date.now()
      await waitForOlRenderComplete(page)
      timers.log('ol rendercomplete', { preset, renderWaitMs: Date.now() - renderStart })

      const selectStart = Date.now()
      const mapElementHandle = await page.$('em-map')
      timers.log('em-map element selected', { preset, selectMs: Date.now() - selectStart })

      if (!mapElementHandle) throw new Error('Map element <em-map> not found for screenshot')

      const screenshotStart = Date.now()
      const jpg = await mapElementHandle.screenshot({ type: 'jpeg', quality: jpegQuality })
      timers.log('screenshot captured', { preset, screenshotMs: Date.now() - screenshotStart, bytes: jpg.length })

      return jpg
    }

    const image1Jpg = await screenshotPreset('image-1')
    timers.log('image 1 done', { bytes: image1Jpg.length })

    const image2Jpg = await screenshotPreset('image-2')
    timers.log('image 2 done', { bytes: image2Jpg.length })

    timers.log('complete', { totalMs: timers.sinceStart() })
    return { image1Jpg, image2Jpg }
  } catch (err) {
    timers.log('failed', { totalMs: timers.sinceStart(), error: err instanceof Error ? err.message : String(err) })
    throw err
  } finally {
    if (context) {
      const closeStart = Date.now()
      await context.close()
      timers.log('context closed', { closeMs: Date.now() - closeStart })
    }
  }
}
