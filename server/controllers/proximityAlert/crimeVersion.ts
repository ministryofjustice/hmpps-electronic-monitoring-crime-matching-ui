import { RequestHandler } from 'express'
import createError from 'http-errors'
import {
  parseExportProximityAlertRequest,
  toExportProximityAlertForm,
  withExportProximityAlertError,
} from '../../form-pages/proximityAlert/exportProximityAlert'
import presentCrimeVersion from '../../presenters/crimeVersion'
import CrimeService from '../../services/crimeService'
import ProximityAlertReportExportService from '../../services/proximityAlert/proximityAlertReportExportService'
import type { MojAlert } from '../../types/govUk/mojAlert'
import { createMojAlertWarning } from '../../utils/alerts'
import HubManagersService from '../../services/hubManagerService'
import Result from '../../types/result'
import { CrimeVersion } from '../../types/crimeVersion'
import HubManager from '../../types/hubManager'
import AuditService, { Page } from '../../services/auditService'

const DOCX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const EXPORT_ERROR_MESSAGE = 'Could not export Proximity Alert report. Please try again.'
const NO_DEVICE_WEARERS_SELECTED_ERROR_MESSAGE =
  'Select at least one device wearer to export the Proximity Alert report.'
const INVALID_EXPORT_REQUEST_ERROR = 'Invalid export request.'

export default class CrimeVersionController {
  constructor(
    private readonly auditService: AuditService,
    private readonly crimeService: CrimeService,
    private readonly proximityAlertReportExportService: ProximityAlertReportExportService,
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
        isHeadless: req.query.headless === 'true',
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
    await this.auditService.logExport(Page.PROXIMITY_ALERT_CRIME_VERSION, {
      who: res.locals.user.username,
      correlationId: req.id,
      details: {
        params: req.params,
      },
    })
    const { username } = res.locals.user
    const { crimeVersionId } = req.params
    const redirectUrl = `/proximity-alert/${encodeURIComponent(crimeVersionId)}`

    try {
      const result = await this.crimeService.getCrimeVersion(username, crimeVersionId)

      if (!result.ok) {
        next(createError(404, 'Not found'))
      } else {
        const parsedRequest = parseExportProximityAlertRequest(req.body as Record<string, unknown>)

        const redirectWithAuthorisingManagerError = () => {
          req.session.validationErrors = [
            {
              field: 'authorisingManager',
              message: 'Select an authorising manager',
            },
          ]

          req.session.exportProximityAlertState = withExportProximityAlertError(
            parsedRequest.formState,
            INVALID_EXPORT_REQUEST_ERROR,
          )

          res.redirect(redirectUrl)
        }

        if (!parsedRequest.success) {
          req.session.validationErrors = parsedRequest.validationErrors
          req.session.exportProximityAlertState = withExportProximityAlertError(
            parsedRequest.formState,
            INVALID_EXPORT_REQUEST_ERROR,
          )
          res.redirect(redirectUrl)
        } else {
          const {
            authorisingManager,
            deviceIds,
            selectedTrackDeviceIds,
            capturedMapState,
            showConfidenceCircles,
            showLocationNumbering,
          } = parsedRequest.exportData

          if (!authorisingManager) {
            redirectWithAuthorisingManagerError()
          } else if (deviceIds.length === 0) {
            req.session.exportProximityAlertState = withExportProximityAlertError(
              parsedRequest.formState,
              NO_DEVICE_WEARERS_SELECTED_ERROR_MESSAGE,
            )
            res.redirect(redirectUrl)
          } else {
            const selectedHubManagerResult = await this.hubManagersService.getHubManager(username, authorisingManager)

            if (!selectedHubManagerResult.ok) {
              redirectWithAuthorisingManagerError()
            } else {
              const signatureResult = await this.hubManagersService.getHubManagerSignature(username, authorisingManager)

              if (!signatureResult.ok) {
                req.session.exportProximityAlertState = withExportProximityAlertError(
                  parsedRequest.formState,
                  EXPORT_ERROR_MESSAGE,
                )

                res.redirect(redirectUrl)
              } else {
                const reportBuffer = await this.proximityAlertReportExportService.build({
                  crimeVersion: result.data,
                  cookieHeader: req.headers.cookie,
                  authorisingManager: selectedHubManagerResult.data,
                  authorisingManagerSignature: signatureResult.data,
                  selectedDeviceIds: deviceIds,
                  selectedTrackDeviceIds,
                  capturedMapState,
                  showConfidenceCircles,
                  showLocationNumbering,
                })

                res.setHeader('Content-Type', DOCX_CONTENT_TYPE)
                res.setHeader('Content-Disposition', `attachment; filename="proximity-alert-${crimeVersionId}.docx"`)
                res.send(reportBuffer)
              }
            }
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
