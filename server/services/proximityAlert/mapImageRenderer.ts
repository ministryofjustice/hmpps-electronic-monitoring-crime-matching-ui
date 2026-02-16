import { chromium, type Browser, type Page } from 'playwright'

export type ProximityAlertMapImages = {
  image1Jpg: Buffer
  image2Jpg: Buffer
}

export type RenderProximityAlertImagesArgs = {
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

type MapPresetName = 'proximityAlertImage1' | 'proximityAlertImage2'

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

// Wait until the client-side map initialisation has completed
async function waitForMapImagesReady(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const root = globalThis as unknown as { mapImages?: { ready?: boolean } }
    return root.mapImages?.ready === true
  })
}

// Call one of the exposed map image preset functions inside the page to generate Image 1 or Image 2
async function applyImagePreset(page: Page, presetName: MapPresetName): Promise<void> {
  await page.evaluate((name: MapPresetName) => {
    const root = globalThis as unknown as { mapImages?: Record<string, unknown> }
    const api = root.mapImages
    if (!api) throw new Error('globalThis.mapImages not found')

    const presetFunction = api[name]
    if (typeof presetFunction !== 'function') throw new Error(`mapImages.${name} not found`)
    presetFunction()
  }, presetName)
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

    const mapElement = (
      doc as {
        querySelector: (selector: string) => unknown
      }
    ).querySelector('em-map') as EmMapLike | null

    if (!mapElement?.olMapInstance) {
      throw new Error('em-map.olMapInstance not found')
    }

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
    pageUrl,
    baseUrlForCookies,
    cookieHeader,
    viewport = DEFAULT_VIEWPORT,
    deviceScaleFactor = 2,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    ignoreHTTPSErrors = false,
    jpegQuality = DEFAULT_JPEG_QUALITY,
  } = args

  console.log('[mapImageRenderer] start', { pageUrl })

  let browser: Browser | undefined

  try {
    browser = await chromium.launch({ headless: true })

    const context = await browser.newContext({
      viewport,
      deviceScaleFactor,
      ignoreHTTPSErrors,
    })

    if (cookieHeader) {
      const sessionCookies = cookiesFromHeader(cookieHeader, baseUrlForCookies)
      if (sessionCookies.length > 0) {
        await context.addCookies(sessionCookies)
      }
    }

    const page = await context.newPage()
    page.setDefaultTimeout(timeoutMs)
    page.setDefaultNavigationTimeout(timeoutMs)

    page.on('console', msg => console.log('[browser console]', msg.type(), msg.text()))
    page.on('pageerror', err => console.error('[browser pageerror]', err))
    page.on('requestfailed', request => console.warn('[browser requestfailed]', request.url(), request.failure()))

    await page.addInitScript(() => {
      const root = globalThis as unknown as { headlessMapCapture?: boolean }
      root.headlessMapCapture = true
    })

    await page.goto(pageUrl, { waitUntil: 'domcontentloaded' })
    console.log('[mapImageRenderer] landed on', page.url(), '|', await page.title())

    await waitForMapImagesReady(page)
    console.log('[mapImageRenderer] mapImages.ready === true')

    const screenshotMapForPreset = async (presetName: MapPresetName): Promise<Buffer> => {
      console.log('[mapImageRenderer] applying preset', presetName)
      await applyImagePreset(page, presetName)
      await waitForOlRenderComplete(page)

      const mapElementHandle = await page.$('em-map')
      if (!mapElementHandle) throw new Error('Map element <em-map> not found for screenshot')

      const jpg = await mapElementHandle.screenshot({
        type: 'jpeg',
        quality: jpegQuality,
      })

      console.log('[mapImageRenderer] screenshot captured', presetName, jpg.length)
      return jpg
    }

    const image1Jpg = await screenshotMapForPreset('proximityAlertImage1')
    const image2Jpg = await screenshotMapForPreset('proximityAlertImage2')

    await context.close()
    return { image1Jpg, image2Jpg }
  } finally {
    if (browser) await browser.close()
  }
}
