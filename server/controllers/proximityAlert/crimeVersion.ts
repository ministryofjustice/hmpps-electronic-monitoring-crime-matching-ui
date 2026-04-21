import { RequestHandler } from 'express'
import createError from 'http-errors'
import logger from '../../../logger'
import config from '../../config'
import CrimeService from '../../services/crimeService'
import PlaywrightBrowserService from '../../services/proximityAlert/playwrightBrowserService'
import MapImageRendererService from '../../services/proximityAlert/mapImageRendererService'
import ProximityAlertReportDocxService from '../../services/proximityAlert/proximityAlertReportDocxService'
import presentCrimeVersion from '../../presenters/crimeVersion'
import toProximityAlertMapPositions from '../../presenters/proximityAlert/mapPositions'
import exportProximityAlertFormSchema from '../../schemas/proximityAlert/exportProximityAlert'
import { createMojAlertWarning } from '../../utils/alerts'
import type { MojAlert } from '../../types/govUk/mojAlert'

const DOCX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const EXPORT_ERROR_MESSAGE = 'Could not export Proximity Alert report. Please try again.'
const NO_DEVICE_WEARERS_SELECTED_ERROR_MESSAGE =
  'Select at least one device wearer to export the Proximity Alert report.'
const INVALID_EXPORT_REQUEST_ERROR = 'Invalid export request.'

function parseFormStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? [trimmed] : []
  }

  return []
}

function parseOptionalFormString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined

  const trimmed = value.trim()
  return trimmed || undefined
}

function parseDeviceIdsFromDeviceWearerToggle(value: unknown): string[] {
  return parseFormStringArray(value)
    .map(item => item.match(/^device-wearer-(.+)$/)?.[1])
    .filter((deviceId): deviceId is string => Boolean(deviceId))
}

function parseTrackDeviceIds(value: unknown): string[] {
  return parseFormStringArray(value)
    .map(item => item.match(/^device-wearer-tracks-(.+)$/)?.[1])
    .filter((deviceId): deviceId is string => Boolean(deviceId))
}

function parseAnalysisToggles(value: unknown): {
  showConfidenceCircles: boolean
  showLocationNumbering: boolean
} {
  const toggles = parseFormStringArray(value)

  return {
    showConfidenceCircles: toggles.includes('device-wearer-circles-'),
    showLocationNumbering: toggles.includes('device-wearer-labels-'),
  }
}

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
        positions: toProximityAlertMapPositions(result.data),
        alerts,
        exportProximityAlertForm: {
          url: `/proximity-alert/${encodeURIComponent(crimeVersionId)}/export-proximity-alert`,
          selectedDeviceIds: exportState?.selectedDeviceIds,
          selectedTrackDeviceIds: exportState?.selectedTrackDeviceIds,
          showConfidenceCircles: exportState?.showConfidenceCircles,
          showLocationNumbering: exportState?.showLocationNumbering,
          capturedMapState: exportState?.capturedMapState,
        },
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

      if (result.ok) {
        const selectedDeviceIds = parseDeviceIdsFromDeviceWearerToggle(req.body['device-wearer-toggle'])
        const selectedTrackDeviceIds = parseTrackDeviceIds(req.body['device-wearer-tracks'])
        const { showConfidenceCircles, showLocationNumbering } = parseAnalysisToggles(req.body['analysis-toggles'])
        const capturedMapState = parseOptionalFormString(req.body.capturedMapState)

        const normalisedFormData = {
          deviceIds: selectedDeviceIds,
          capturedMapState,
        }

        const formData = exportProximityAlertFormSchema.safeParse(normalisedFormData)

        if (!formData.success) {
          logger.warn(
            {
              crimeVersionId,
              issues: formData.error.issues,
            },
            'Invalid proximity alert export request',
          )

          req.session.exportProximityAlertState = {
            error: INVALID_EXPORT_REQUEST_ERROR,
            selectedDeviceIds,
            selectedTrackDeviceIds,
            showConfidenceCircles,
            showLocationNumbering,
            capturedMapState,
          }
          res.redirect(redirectUrl)
        } else {
          const { deviceIds, capturedMapState: validatedCapturedMapState } = formData.data

          if (deviceIds.length === 0) {
            req.session.exportProximityAlertState = {
              error: NO_DEVICE_WEARERS_SELECTED_ERROR_MESSAGE,
              selectedDeviceIds: deviceIds,
              selectedTrackDeviceIds,
              showConfidenceCircles,
              showLocationNumbering,
              capturedMapState: validatedCapturedMapState,
            }
            res.redirect(redirectUrl)
          } else {
            const browser = await this.playwrightBrowserService.getBrowser()
            const images = await this.mapImageRendererService.render({
              browser,
              pageUrl: `${config.ingressUrl}/proximity-alert/${encodeURIComponent(crimeVersionId)}`,
              baseUrlForCookies: config.ingressUrl,
              cookieHeader: req.headers.cookie,
              selectedDeviceIds: deviceIds,
              capturedMapState: validatedCapturedMapState,
            })

            const docxBuffer = await this.proximityAlertReportDocxService.build({
              crimeVersion: result.data,
              deviceIds,
              capturedMapState: validatedCapturedMapState,
              images,
            })

            res.setHeader('Content-Type', DOCX_CONTENT_TYPE)
            res.setHeader('Content-Disposition', `attachment; filename="proximity-alert-${crimeVersionId}.docx"`)
            res.send(docxBuffer)
          }
        }
      } else {
        next(createError(404, 'Not found'))
      }
    } catch (error) {
      logger.error(
        {
          crimeVersionId,
          error,
        },
        'Failed to export proximity alert report',
      )

      const selectedDeviceIds = parseDeviceIdsFromDeviceWearerToggle(req.body['device-wearer-toggle'])
      const selectedTrackDeviceIds = parseTrackDeviceIds(req.body['device-wearer-tracks'])
      const { showConfidenceCircles, showLocationNumbering } = parseAnalysisToggles(req.body['analysis-toggles'])
      const capturedMapState = parseOptionalFormString(req.body.capturedMapState)

      req.session.exportProximityAlertState = {
        error: EXPORT_ERROR_MESSAGE,
        selectedDeviceIds,
        selectedTrackDeviceIds,
        showConfidenceCircles,
        showLocationNumbering,
        capturedMapState,
      }
      res.redirect(redirectUrl)
    }
  }
}
