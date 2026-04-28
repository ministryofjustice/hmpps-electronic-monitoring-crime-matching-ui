import type { Browser, Page } from 'playwright'
import {
  capturedMapStateValueSchema,
  type CapturedMapStateValue,
} from '../../schemas/proximityAlert/exportProximityAlert'

type ExportMapFitMode = 'none' | 'selected-device-wearers' | 'focused-device-wearer'

type ExportMapRenderConfig = {
  selectedDeviceIds?: number[]
  selectedTrackDeviceIds?: number[]
  focusedDeviceId?: number
  showConfidenceCircles: boolean
  showLocationNumbering: boolean
  fitMode: ExportMapFitMode
  capturedMapState?: CapturedMapStateValue
}

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
  selectedTrackDeviceIds: string[]
  capturedMapState?: string
  showConfidenceCircles: boolean
  showLocationNumbering: boolean
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

// Converts selected device IDs from strings to valid numeric IDs for map rendering.
const parseSelectedDeviceIds = (selectedDeviceIds: string[]): number[] => {
  return selectedDeviceIds.map(deviceId => Number(deviceId)).filter(deviceId => Number.isFinite(deviceId))
}

// Build a URL for headless export.
const pageUrlForHeadless = ({
  baseUrl,
  capturedMapState,
  selectedDeviceIds,
}: {
  baseUrl: string
  capturedMapState: CapturedMapStateValue
  selectedDeviceIds: number[]
}): string => {
  const url = new URL(baseUrl)

  url.searchParams.set('headless', 'true')
  url.searchParams.set('mapWidthPx', String(capturedMapState.mapWidthPx))
  url.searchParams.set('mapHeightPx', String(capturedMapState.mapHeightPx))
  url.searchParams.set('selectedDeviceIds', selectedDeviceIds.join(','))

  return url.toString()
}

// Replays the user's submitted browser view using captured map state.
const overviewUserViewConfig = ({
  selectedDeviceIds,
  selectedTrackDeviceIds,
  capturedMapState,
  showConfidenceCircles,
  showLocationNumbering,
}: {
  selectedDeviceIds: number[]
  selectedTrackDeviceIds: number[]
  capturedMapState: CapturedMapStateValue
  showConfidenceCircles: boolean
  showLocationNumbering: boolean
}): ExportMapRenderConfig => ({
  selectedDeviceIds,
  selectedTrackDeviceIds,
  showConfidenceCircles,
  showLocationNumbering,
  fitMode: 'none',
  capturedMapState,
})

// Shows all selected device wearers without tracks, fitted to the cluster.
const overviewFittedToDeviceWearersConfig = (selectedDeviceIds: number[]): ExportMapRenderConfig => ({
  selectedDeviceIds,
  selectedTrackDeviceIds: [],
  showConfidenceCircles: true,
  showLocationNumbering: true,
  fitMode: 'selected-device-wearers',
})

// Shows a single device wearer with tracks visible.
const deviceWearerWithTracksConfig = (deviceId: number): ExportMapRenderConfig => ({
  selectedDeviceIds: [deviceId],
  selectedTrackDeviceIds: [deviceId],
  focusedDeviceId: deviceId,
  showConfidenceCircles: true,
  showLocationNumbering: true,
  fitMode: 'none',
})

// Shows a single device wearer without tracks, fitted to the device.
const deviceWearerFittedWithoutTracksConfig = (deviceId: number): ExportMapRenderConfig => ({
  selectedDeviceIds: [deviceId],
  selectedTrackDeviceIds: [],
  focusedDeviceId: deviceId,
  showConfidenceCircles: true,
  showLocationNumbering: true,
  fitMode: 'focused-device-wearer',
})

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

// Apply a map render config in the headless page to set layer visibility and viewport for screenshots.
const applyRenderConfig = async (page: Page, config: ExportMapRenderConfig): Promise<void> => {
  await page.evaluate(
    async ({ renderConfig }) => {
      const win = globalThis as unknown as {
        mapImages?: { applyRenderConfig?: (config: unknown) => Promise<void> }
      }

      if (!win.mapImages?.applyRenderConfig) {
        throw new Error('window.mapImages.applyRenderConfig not found')
      }

      await win.mapImages.applyRenderConfig(renderConfig)
    },
    {
      renderConfig: config,
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
    const {
      browser,
      pageUrl,
      baseUrlForCookies,
      cookieHeader,
      selectedDeviceIds,
      selectedTrackDeviceIds,
      capturedMapState,
      showConfidenceCircles,
      showLocationNumbering,
    } = args

    if (!cookieHeader) {
      throw new Error('cookieHeader is required to render proximity alert report images')
    }

    const parsedCapturedMapState = tryParseCapturedMapState(capturedMapState)
    if (!parsedCapturedMapState) {
      throw new Error('capturedMapState is required and must be valid to render proximity alert report images')
    }

    const selectedDeviceIdsAsNumbers = parseSelectedDeviceIds(selectedDeviceIds)
    const selectedTrackDeviceIdsAsNumbers = parseSelectedDeviceIds(selectedTrackDeviceIds)

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

      const targetUrl = pageUrlForHeadless({
        baseUrl: pageUrl,
        capturedMapState: parsedCapturedMapState,
        selectedDeviceIds: selectedDeviceIdsAsNumbers,
      })

      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' })
      await waitForAppLayersReady(page)
      await waitForOlRenderComplete(page)

      await applyRenderConfig(
        page,
        overviewUserViewConfig({
          selectedDeviceIds: selectedDeviceIdsAsNumbers,
          selectedTrackDeviceIds: selectedTrackDeviceIdsAsNumbers,
          capturedMapState: parsedCapturedMapState,
          showConfidenceCircles,
          showLocationNumbering,
        }),
      )
      await waitForOlRenderComplete(page)
      const overviewUserViewJpg = await screenshotMapElement(page)

      const deviceWearerWithTracksJpgByDeviceId: Record<string, Buffer> = {}

      // Capture similar map states together to avoid repeatedly switching between overview and detail views.
      // Large view changes can trigger extra tile loading/rendering, so grouping screenshots reduces export time.
      /* eslint-disable no-await-in-loop -- Intentional: keep map state changes and screenshots sequential */
      for (const deviceId of selectedDeviceIdsAsNumbers) {
        await applyRenderConfig(page, deviceWearerWithTracksConfig(deviceId))
        await waitForOlRenderComplete(page)
        deviceWearerWithTracksJpgByDeviceId[String(deviceId)] = await screenshotMapElement(page)
      }
      /* eslint-enable no-await-in-loop */

      await applyRenderConfig(page, overviewFittedToDeviceWearersConfig(selectedDeviceIdsAsNumbers))
      await waitForOlRenderComplete(page)
      const overviewFittedToDeviceWearersJpg = await screenshotMapElement(page)

      const deviceWearerFittedWithoutTracksJpgByDeviceId: Record<string, Buffer> = {}

      /* eslint-disable no-await-in-loop -- Intentional: keep map state changes and screenshots sequential */
      for (const deviceId of selectedDeviceIdsAsNumbers) {
        await applyRenderConfig(page, deviceWearerFittedWithoutTracksConfig(deviceId))
        await waitForOlRenderComplete(page)
        deviceWearerFittedWithoutTracksJpgByDeviceId[String(deviceId)] = await screenshotMapElement(page)
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
