import config from '../../config'
import presentProximityAlertReportData from '../../presenters/proximityAlertReportData'
import type { CrimeVersion } from '../../types/crimeVersion'
import type HubManager from '../../types/hubManager'
import MapImageRendererService from './proximityAlertMapImageService'
import PlaywrightBrowserService from './playwrightBrowserService'
import ProximityAlertReportDocxService from './reportDocx/proximityAlertReportDocxService'

export type BuildProximityAlertReportExportArgs = {
  crimeVersion: CrimeVersion
  cookieHeader?: string
  authorisingManager: HubManager
  authorisingManagerSignature: Buffer
  selectedDeviceIds: string[]
  selectedTrackDeviceIds: string[]
  capturedMapState?: string
  showConfidenceCircles: boolean
  showLocationNumbering: boolean
}

export default class ProximityAlertReportExportService {
  constructor(
    private readonly playwrightBrowserService: PlaywrightBrowserService,
    private readonly mapImageRendererService: MapImageRendererService,
    private readonly proximityAlertReportDocxService: ProximityAlertReportDocxService,
  ) {}

  async build(args: BuildProximityAlertReportExportArgs): Promise<Buffer> {
    const {
      crimeVersion,
      cookieHeader,
      authorisingManager,
      authorisingManagerSignature,
      selectedDeviceIds,
      selectedTrackDeviceIds,
      capturedMapState,
      showConfidenceCircles,
      showLocationNumbering,
    } = args

    const browser = await this.playwrightBrowserService.getBrowser()

    const images = await this.mapImageRendererService.render({
      browser,
      pageUrl: `${config.ingressUrl}/proximity-alert/${encodeURIComponent(crimeVersion.crimeVersionId)}`,
      baseUrlForCookies: config.ingressUrl,
      cookieHeader,
      selectedDeviceIds,
      selectedTrackDeviceIds,
      capturedMapState,
      showConfidenceCircles,
      showLocationNumbering,
    })

    const report = presentProximityAlertReportData(crimeVersion, {
      authorisingManager,
      authorisingManagerSignature,
      selectedDeviceIds,
    })

    return this.proximityAlertReportDocxService.build({
      report,
      images,
    })
  }
}
