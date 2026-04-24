import type { Browser, Page } from 'playwright'
import {
  capturedMapStateValueSchema,
  type CapturedMapStateValue,
} from '../../schemas/proximityAlert/exportProximityAlert'

type ValueOf<T> = T[keyof T]

const MAP_IMAGE_PRESETS = {
  // Replays the user's submitted browser view using captured map state.
  overviewUserView: 'overview-user-view',

  // Shows all selected device wearers without tracks, fitted to the cluster.
  overviewFittedToDeviceWearers: 'overview-fitted-to-device-wearers',

  // Shows a single device wearer with tracks visible.
  deviceWearerWithTracks: 'device-wearer-with-tracks',

  // Shows a single device wearer without tracks, fitted tightly to its positions.
  deviceWearerFittedWithoutTracks: 'device-wearer-fitted-without-tracks',
} as const

type PresetParam = ValueOf<typeof MAP_IMAGE_PRESETS>

export type ProximityAlertReportImages = {
  overviewUserViewJpg?: Buffer
  overviewFittedToDeviceWearersJpg?: Buffer
  deviceWearerWithTracksJpgByDeviceId: Record<string, Buffer>
  deviceWearerFittedWithoutTracksJpgByDeviceId: Record<string, Buffer>
}

export type RenderProximityAlertImagesArgs = {
  browser: Browser
  pageUrl: string
  baseUrlForCookies: string
  cookieHeader?: string
  selectedDeviceIds: string[]
  capturedMapState?: string
}

const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_VIEWPORT = {
  width: 1200,
  height: 650,
}
const DEFAULT_JPEG_QUALITY = 85

// Parse a Cookie header into Playwright cookie objects.
const cookiesFromHeader = (cookieHeader: string, baseUrlForCookies: string) => {
  return cookieHeader
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const equalsIndex = part.indexOf('=')
      const name = equalsIndex >= 0 ? part.slice(0, equalsIndex) : part
      const value = equalsIndex >= 0 ? part.slice(equalsIndex + 1) : ''

      return {
        name,
        value,
        url: baseUrlForCookies,
      }
    })
}

// Attempt to parse the captured map state, returning undefined if parsing fails or the structure is invalid.
const tryParseCapturedMapState = (capturedMapState?: string): CapturedMapStateValue | undefined => {
  if (!capturedMapState) return undefined

  try {
    const parsedMapState: unknown = JSON.parse(capturedMapState)
    const result = capturedMapStateValueSchema.safeParse(parsedMapState)

    return result.success ? result.data : undefined
  } catch {
    return undefined
  }
}

// Build a URL for headless export.
const pageUrlForHeadless = (
  baseUrl: string,
  selectedDeviceIds: string[],
  capturedMapState: CapturedMapStateValue,
): string => {
  const url = new URL(baseUrl)

  url.searchParams.set('headless', 'true')

  if (selectedDeviceIds.length > 0) {
    url.searchParams.set('deviceIds', selectedDeviceIds.join(','))
  }

  url.searchParams.set('mapWidthPx', String(capturedMapState.mapWidthPx))
  url.searchParams.set('mapHeightPx', String(capturedMapState.mapHeightPx))

  return url.toString()
}

// Wait until the client-side map code has added all custom layers.
const waitForAppLayersReady = async (page: Page): Promise<void> => {
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

// Wait for the OpenLayers map to complete a render after a view or layer change.
const waitForOlRenderComplete = async (page: Page): Promise<void> => {
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

    if (!mapElement?.olMapInstance) {
      throw new Error('em-map.olMapInstance not found')
    }

    const map = mapElement.olMapInstance as OlMapLike

    return new Promise<void>(resolve => {
      map.once('rendercomplete', () => resolve())
      map.renderSync()
    })
  })
}

// Apply a map preset in the headless page to set layer visibility and styles for screenshots.
const applyPreset = async (page: Page, preset: PresetParam, deviceId?: string): Promise<void> => {
  await page.evaluate(
    ({ presetValue, deviceIdValue }) => {
      const win = globalThis as unknown as {
        mapImages?: { applyPreset?: (preset: string, deviceId?: string) => void }
      }

      if (!win.mapImages?.applyPreset) {
        throw new Error('window.mapImages.applyPreset not found')
      }

      win.mapImages.applyPreset(presetValue, deviceIdValue)
    },
    {
      presetValue: preset,
      deviceIdValue: deviceId,
    },
  )
}

// Apply the captured map state in the headless page to set the map view for the user-view overview screenshot.
const applyCapturedMapState = async (page: Page, capturedMapState: CapturedMapStateValue): Promise<void> => {
  await page.evaluate(
    ({ capturedMapStateValue }) => {
      const win = globalThis as unknown as {
        mapImages?: { applyCapturedMapState?: (state: unknown) => void }
      }

      if (!win.mapImages?.applyCapturedMapState) {
        throw new Error('window.mapImages.applyCapturedMapState not found')
      }

      win.mapImages.applyCapturedMapState(capturedMapStateValue)
    },
    {
      capturedMapStateValue: capturedMapState,
    },
  )
}

// Capture a screenshot of the map element in the headless page, returning it as a JPEG buffer.
const screenshotMapElement = async (page: Page): Promise<Buffer> => {
  const mapElement = await page.$('em-map')
  if (!mapElement) {
    throw new Error('Map element <em-map> not found for screenshot')
  }

  return mapElement.screenshot({
    type: 'jpeg',
    quality: DEFAULT_JPEG_QUALITY,
  })
}

export default class MapImageRendererService {
  // Render map images for the proximity alert report based on the provided arguments, returning them as buffers.
  async render(args: RenderProximityAlertImagesArgs): Promise<ProximityAlertReportImages> {
    const { browser, pageUrl, baseUrlForCookies, cookieHeader, selectedDeviceIds, capturedMapState } = args

    if (!cookieHeader) {
      throw new Error('cookieHeader is required to render proximity alert report images')
    }

    const parsedCapturedMapState = tryParseCapturedMapState(capturedMapState)
    if (!parsedCapturedMapState) {
      throw new Error('capturedMapState is required and must be valid to render proximity alert report images')
    }

    const context = await browser.newContext({
      viewport: DEFAULT_VIEWPORT,
    })

    try {
      const cookies = cookiesFromHeader(cookieHeader, baseUrlForCookies)
      if (cookies.length === 0) {
        throw new Error('cookieHeader must contain at least one valid cookie to render proximity alert report images')
      }

      await context.addCookies(cookies)

      const page = await context.newPage()
      page.setDefaultTimeout(DEFAULT_TIMEOUT_MS)
      page.setDefaultNavigationTimeout(DEFAULT_TIMEOUT_MS)

      const targetUrl = pageUrlForHeadless(pageUrl, selectedDeviceIds, parsedCapturedMapState)

      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' })
      await waitForAppLayersReady(page)
      await waitForOlRenderComplete(page)
      // Overview image that reproduces the user's current browser map view.
      await applyPreset(page, MAP_IMAGE_PRESETS.overviewUserView)
      await applyCapturedMapState(page, parsedCapturedMapState)
      await waitForOlRenderComplete(page)
      const overviewUserViewJpg = await screenshotMapElement(page)

      const deviceWearerWithTracksJpgByDeviceId: Record<string, Buffer> = {}

      // Capture similar map states together to avoid repeatedly switching between overview and detail views.
      // Large view changes can trigger extra tile loading/rendering, so grouping screenshots reduces export time.
      /* eslint-disable no-await-in-loop -- Intentional: keep map state changes and screenshots sequential */
      for (const deviceId of selectedDeviceIds) {
        await applyPreset(page, MAP_IMAGE_PRESETS.deviceWearerWithTracks, deviceId)
        await waitForOlRenderComplete(page)
        deviceWearerWithTracksJpgByDeviceId[deviceId] = await screenshotMapElement(page)
      }
      /* eslint-enable no-await-in-loop */

      await applyPreset(page, MAP_IMAGE_PRESETS.overviewFittedToDeviceWearers)
      await waitForOlRenderComplete(page)
      const overviewFittedToDeviceWearersJpg = await screenshotMapElement(page)

      const deviceWearerFittedWithoutTracksJpgByDeviceId: Record<string, Buffer> = {}

      /* eslint-disable no-await-in-loop -- Intentional: keep map state changes and screenshots sequential */
      for (const deviceId of selectedDeviceIds) {
        await applyPreset(page, MAP_IMAGE_PRESETS.deviceWearerFittedWithoutTracks, deviceId)
        await waitForOlRenderComplete(page)
        deviceWearerFittedWithoutTracksJpgByDeviceId[deviceId] = await screenshotMapElement(page)
      }
      /* eslint-enable no-await-in-loop */

      return {
        overviewUserViewJpg,
        overviewFittedToDeviceWearersJpg,
        deviceWearerWithTracksJpgByDeviceId,
        deviceWearerFittedWithoutTracksJpgByDeviceId,
      }
    } finally {
      await context.close()
    }
  }
}
