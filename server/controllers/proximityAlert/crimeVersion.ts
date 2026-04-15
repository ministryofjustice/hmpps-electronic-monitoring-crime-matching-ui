import { RequestHandler } from 'express'
import createError from 'http-errors'
import logger from '../../../logger'
import CrimeService from '../../services/crimeService'
import presentCrimeVersion from '../../presenters/crimeVersion'
import toProximityAlertMapPositions from '../../presenters/proximityAlert/mapPositions'
import exportProximityAlertFormSchema from '../../schemas/proximityAlert/exportProximityAlert'
import { createMojAlertWarning } from '../../utils/alerts'
import type { MojAlert } from '../../types/govUk/mojAlert'

const EXPORT_ERROR_MESSAGE = 'Could not export Proximity Alert report. Please try again.'
const NO_DEVICE_WEARERS_SELECTED_ERROR_MESSAGE =
  'Select at least one device wearer to export the Proximity Alert report.'
const INVALID_EXPORT_REQUEST_ERROR = 'Invalid export request.'

export default class CrimeVersionController {
  constructor(private readonly crimeService: CrimeService) {}

  view: RequestHandler = async (req, res, next) => {
    const { username } = res.locals.user
    const { crimeVersionId } = req.params
    const result = await this.crimeService.getCrimeVersion(username, crimeVersionId)

    if (result.ok) {
      const exportError = req.session.proximityAlertExportProximityAlertError
      delete req.session.proximityAlertExportProximityAlertError

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

        req.session.proximityAlertExportProximityAlertError = INVALID_EXPORT_REQUEST_ERROR
        return res.redirect(`/proximity-alert/${encodeURIComponent(crimeVersionId)}`)
      }

      const { deviceIds } = formData.data

      if (deviceIds.length === 0) {
        req.session.proximityAlertExportProximityAlertError = NO_DEVICE_WEARERS_SELECTED_ERROR_MESSAGE
        return res.redirect(`/proximity-alert/${encodeURIComponent(crimeVersionId)}`)
      }

      logger.info(
        {
          crimeVersionId,
          deviceIds,
        },
        'Accepted proximity alert export request',
      )

      req.session.proximityAlertExportProximityAlertError = EXPORT_ERROR_MESSAGE
      return res.redirect(`/proximity-alert/${encodeURIComponent(crimeVersionId)}`)
    } catch (error) {
      logger.error(
        {
          crimeVersionId,
          error,
        },
        'Failed to bootstrap proximity alert export request',
      )

      req.session.proximityAlertExportProximityAlertError = EXPORT_ERROR_MESSAGE
      return res.redirect(`/proximity-alert/${encodeURIComponent(crimeVersionId)}`)
    }
  }
}
