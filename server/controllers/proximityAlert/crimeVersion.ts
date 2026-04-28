import { RequestHandler } from 'express'
import archiver from 'archiver'
import createError from 'http-errors'
import config from '../../config'
import {
  parseExportProximityAlertRequest,
  toExportProximityAlertForm,
  withExportProximityAlertError,
} from '../../form-pages/proximityAlert/exportProximityAlert'
import presentCrimeVersion from '../../presenters/crimeVersion'
import CrimeService from '../../services/crimeService'
import MapImageRendererService from '../../services/proximityAlert/proximityAlertMapImageService'
import PlaywrightBrowserService from '../../services/proximityAlert/playwrightBrowserService'
import ProximityAlertReportDocxService from '../../services/proximityAlert/proximityAlertReportDocxService'
import type { MojAlert } from '../../types/govUk/mojAlert'
import { createMojAlertWarning } from '../../utils/alerts'

const EXPORT_ERROR_MESSAGE = 'Could not export Proximity Alert report. Please try again.'
const NO_DEVICE_WEARERS_SELECTED_ERROR_MESSAGE =
  'Select at least one device wearer to export the Proximity Alert report.'
const INVALID_EXPORT_REQUEST_ERROR = 'Invalid export request.'

export default class CrimeVersionController {
  constructor(
    private readonly crimeService: CrimeService,
    private readonly playwrightBrowserService: PlaywrightBrowserService,
    private readonly mapImageRendererService: MapImageRendererService,
    private readonly proximityAlertReportDocxService: ProximityAlertReportDocxService,
  ) {}

  view: RequestHandler = async (req, res, next) => {
    const { username } = res.locals.user
    const { crimeVersionId } = req.params
    const result = await this.crimeService.getCrimeVersion(username, crimeVersionId)

    if (result.ok) {
      const exportState = req.session.exportProximityAlertState
      delete req.session.exportProximityAlertState

      const alerts: Array<MojAlert> = []
      if (exportState?.error) {
        const alert = createMojAlertWarning(exportState.error)
        alert.dismissible = true
        alerts.push(alert)
      }

      res.render('pages/proximityAlert/crimeVersion', {
        usesInternalOverlays: true,
        crimeVersion: presentCrimeVersion(result.data),
        alerts,
        exportProximityAlertForm: toExportProximityAlertForm(crimeVersionId, exportState),
      })
    } else {
      next(createError(404, 'Not found'))
    }
  }

  exportProximityAlert: RequestHandler = async (req, res, next) => {
    const { username } = res.locals.user
    const { crimeVersionId } = req.params
    const redirectUrl = `/proximity-alert/${encodeURIComponent(crimeVersionId)}`

    try {
      const result = await this.crimeService.getCrimeVersion(username, crimeVersionId)

      if (!result.ok) {
        next(createError(404, 'Not found'))
      } else {
        const parsedRequest = parseExportProximityAlertRequest(req.body as Record<string, unknown>)

        if (!parsedRequest.success) {
          req.session.exportProximityAlertState = withExportProximityAlertError(
            parsedRequest.formState,
            INVALID_EXPORT_REQUEST_ERROR,
          )
          res.redirect(redirectUrl)
        } else {
          const { deviceIds, selectedTrackDeviceIds, capturedMapState, showConfidenceCircles, showLocationNumbering } =
            parsedRequest.exportData

          if (deviceIds.length === 0) {
            req.session.exportProximityAlertState = withExportProximityAlertError(
              parsedRequest.formState,
              NO_DEVICE_WEARERS_SELECTED_ERROR_MESSAGE,
            )
            res.redirect(redirectUrl)
          } else {
            const browser = await this.playwrightBrowserService.getBrowser()

            const images = await this.mapImageRendererService.render({
              browser,
              pageUrl: `${config.ingressUrl}/proximity-alert/${encodeURIComponent(crimeVersionId)}`,
              baseUrlForCookies: config.ingressUrl,
              cookieHeader: req.headers.cookie,
              selectedDeviceIds: deviceIds,
              selectedTrackDeviceIds,
              capturedMapState,
              showConfidenceCircles,
              showLocationNumbering,
            })

            const zipFileName = `proximity-alert-${crimeVersionId}-map-images.zip`

            res.setHeader('Content-Type', 'application/zip')
            res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`)

            const archive = archiver('zip', { zlib: { level: 9 } })

            archive.on('warning', () => {
              // ignore temporary zip warnings for manual image checking
            })

            archive.on('error', archiveError => {
              next(archiveError)
            })

            archive.pipe(res)

            if (images.overviewUserViewJpg) {
              archive.append(images.overviewUserViewJpg, { name: 'overview-user-view.jpg' })
            }

            if (images.overviewFittedToDeviceWearersJpg) {
              archive.append(images.overviewFittedToDeviceWearersJpg, { name: 'overview-fitted-to-device-wearers.jpg' })
            }

            for (const [deviceId, imageBuffer] of Object.entries(images.deviceWearerWithTracksJpgByDeviceId)) {
              archive.append(imageBuffer, { name: `device-wearer-${deviceId}-with-tracks.jpg` })
            }

            for (const [deviceId, imageBuffer] of Object.entries(images.deviceWearerFittedWithoutTracksJpgByDeviceId)) {
              archive.append(imageBuffer, { name: `device-wearer-${deviceId}-fitted-without-tracks.jpg` })
            }

            await archive.finalize()
          }
        }
      }
    } catch {
      const parsedRequest = parseExportProximityAlertRequest(req.body as Record<string, unknown>)

      req.session.exportProximityAlertState = withExportProximityAlertError(
        parsedRequest.formState,
        EXPORT_ERROR_MESSAGE,
      )
      res.redirect(redirectUrl)
    }
  }
}
