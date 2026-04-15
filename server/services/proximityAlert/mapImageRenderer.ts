import type { Browser } from 'playwright'

export type ProximityAlertReportImages = {
  image1Jpg?: Buffer
  image2Jpg?: Buffer
  wearerImage1JpgById: Record<string, Buffer>
  wearerImage2JpgById: Record<string, Buffer>
}

export type RenderProximityAlertImagesArgs = {
  browser: Browser
  pageUrl: string
  baseUrlForCookies: string
  cookieHeader?: string
  selectedDeviceIds: string[]
  capturedMapState?: string
}

export async function renderProximityAlertReportImages(
  args: RenderProximityAlertImagesArgs,
): Promise<ProximityAlertReportImages> {
  const { browser } = args

  const context = await browser.newContext()

  try {
    return {
      image1Jpg: undefined,
      image2Jpg: undefined,
      wearerImage1JpgById: {},
      wearerImage2JpgById: {},
    }
  } finally {
    await context.close()
  }
}
