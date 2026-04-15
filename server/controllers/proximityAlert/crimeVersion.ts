import { RequestHandler } from 'express'
import createError from 'http-errors'
import logger from '../../../logger'
import config from '../../config'
import CrimeService from '../../services/crimeService'
import PlaywrightBrowserService from '../../services/proximityAlert/playwrightBrowserService'
import { renderProximityAlertReportImages } from '../../services/proximityAlert/mapImageRenderer'
import { buildProximityAlertReportDocx } from '../../services/proximityAlert/proximityAlertReportDocx'
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

export default class CrimeVersionController {
  constructor(
    private readonly crimeService: CrimeService,
    private readonly playwrightBrowserService: PlaywrightBrowserService,
  ) {}

  view: RequestHandler = async (req, res, next) => {
    const { username } = res.locals.user
    const { crimeVersionId } = req.params
    const result = await this.crimeService.getCrimeVersion(username, crimeVersionId)

    if (result.ok) {
      const exportError = req.session.exportProximityAlertError
      delete req.session.exportProximityAlertError

      const alerts: Array<MojAlert> = []
      if (exportError) {
        const alert = createMojAlertWarning(exportError)
        alert.dismissible = true
        alerts.push(alert)
      }

      res.render('pages/proximityAlert/crimeVersion', {
        usesInternalOverlays: false,
        crimeVersion: presentCrimeVersion(result.data),
        positions: toProximityAlertMapPositions(result.data),
        alerts,
        exportProximityAlertForm: {
          url: `/proximity-alert/${encodeURIComponent(crimeVersionId)}/export-proximity-alert`,
        },
      })
      return
    }

    next(createError(404, 'Not found'))
  }

  exportProximityAlert: RequestHandler = async (req, res, next) => {
    const { username } = res.locals.user
    const { crimeVersionId } = req.params

    try {
      const result = await this.crimeService.getCrimeVersion(username, crimeVersionId)

      if (!result.ok) {
        return next(createError(404, 'Not found'))
      }

      const formData = exportProximityAlertFormSchema.safeParse(req.body)

      if (!formData.success) {
        logger.warn(
          {
            crimeVersionId,
            issues: formData.error.issues,
          },
          'Invalid proximity alert export request',
        )

        req.session.exportProximityAlertError = INVALID_EXPORT_REQUEST_ERROR
        return res.redirect(`/proximity-alert/${encodeURIComponent(crimeVersionId)}`)
      }

      const { deviceIds, capturedMapState } = formData.data

      if (deviceIds.length === 0) {
        req.session.exportProximityAlertError = NO_DEVICE_WEARERS_SELECTED_ERROR_MESSAGE
        return res.redirect(`/proximity-alert/${encodeURIComponent(crimeVersionId)}`)
      }

      const browser = await this.playwrightBrowserService.getBrowser()

      const images = await renderProximityAlertReportImages({
        browser,
        pageUrl: `${config.ingressUrl}/proximity-alert/${encodeURIComponent(crimeVersionId)}`,
        baseUrlForCookies: config.ingressUrl,
        cookieHeader: req.headers.cookie,
        selectedDeviceIds: deviceIds,
        capturedMapState,
      })

      const docxBuffer = await buildProximityAlertReportDocx({
        crimeVersion: result.data,
        deviceIds,
        capturedMapState,
        images,
      })

      res.setHeader('Content-Type', DOCX_CONTENT_TYPE)
      res.setHeader('Content-Disposition', `attachment; filename="proximity-alert-${crimeVersionId}.docx"`)
      return res.send(docxBuffer)
    } catch (error) {
      logger.error(
        {
          crimeVersionId,
          error,
        },
        'Failed to export proximity alert report',
      )

      req.session.exportProximityAlertError = EXPORT_ERROR_MESSAGE
      return res.redirect(`/proximity-alert/${encodeURIComponent(crimeVersionId)}`)
    }
  }
}
