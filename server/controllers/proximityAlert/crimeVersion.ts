import { RequestHandler } from 'express'
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
import presentProximityAlertReportData from '../../presenters/proximityAlertReportData'
import type { MojAlert } from '../../types/govUk/mojAlert'
import { createMojAlertWarning } from '../../utils/alerts'
import HubManagersService from '../../services/hubManagerService'
import Result from '../../types/result'
import { CrimeVersion } from '../../types/crimeVersion'
import HubManager from '../../types/hubManager'

const DOCX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const DOCX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
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
    private readonly hubManagersService: HubManagersService,
  ) {}

  private async getViewData(
    username: string,
    crimeVersionId: string,
  ): Promise<Result<{ crimeVersion: CrimeVersion; hubManagers: Array<HubManager> }, string>> {
    const result = await Promise.all([
      this.crimeService.getCrimeVersion(username, crimeVersionId),
      this.hubManagersService.getHubManagersWithSignatures(username),
    ])

    if (result[0].ok && result[1].ok) {
      return {
        ok: true,
        data: {
          crimeVersion: result[0].data,
          hubManagers: result[1].data,
        },
      }
    }

    return {
      ok: false,
      error: 'Failed to fetch data',
    }
  }

  view: RequestHandler = async (req, res, next) => {
    const { username } = res.locals.user
    const { crimeVersionId } = req.params
    const result = await this.getViewData(username, crimeVersionId)

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
        crimeVersion: presentCrimeVersion(result.data.crimeVersion),
        alerts,
        exportProximityAlertForm: toExportProximityAlertForm(crimeVersionId, exportState),
        hubManagers: result.data.hubManagers,
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
          req.session.validationErrors = parsedRequest.validationErrors
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

            const report = presentProximityAlertReportData(result.data, {
              selectedDeviceIds: deviceIds,
            })

            const docxBuffer = await this.proximityAlertReportDocxService.build({
              report,
              images,
            })

            res.setHeader('Content-Type', DOCX_CONTENT_TYPE)
            res.setHeader('Content-Disposition', `attachment; filename="proximity-alert-${crimeVersionId}.docx"`)
            res.send(docxBuffer)
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
