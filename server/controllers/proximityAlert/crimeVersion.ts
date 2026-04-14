import { RequestHandler } from 'express'
import createError from 'http-errors'
import config from '../../config'
import CrimeService from '../../services/crimeService'
import presentCrimeVersion from '../../presenters/crimeVersion'
import toProximityAlertMapPositions from '../../presenters/proximityAlert/mapPositions'
import { createMojAlertWarning } from '../../utils/alerts'
import type { MojAlert } from '../../types/govUk/mojAlert'
import logger from '../../../logger'

type ExportProximityAlertFormBody = {
  deviceIds?: string | string[]
  capturedMapState?: string
}

const EXPORT_ERROR_MESSAGE = 'Could not export Proximity Alert report. Please try again.'

function parseFormStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(arrayValue => String(arrayValue)).filter(Boolean)
  if (typeof value === 'string' && value.length > 0) return [value]
  return []
}

function parseFormOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

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
        alerts.push(createMojAlertWarning(exportError))
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
        next(createError(404, 'Not found'))
        return
      }

      const crimeVersion = result.data
      const body = req.body as ExportProximityAlertFormBody

      const selectedDeviceIdsFromForm = parseFormStringArray(body.deviceIds)
      const capturedMapStateJson = parseFormOptionalString(body.capturedMapState)

      const allDeviceIds = crimeVersion.matching?.deviceWearers.map(deviceWearer => String(deviceWearer.deviceId)) ?? []

      const selectedDeviceIds = selectedDeviceIdsFromForm.length > 0 ? selectedDeviceIdsFromForm : allDeviceIds

      logger.info(
        {
          crimeVersionId,
          selectedDeviceIds,
          hasCapturedMapState: Boolean(capturedMapStateJson),
        },
        'Bootstrapped proximity alert export request',
      )

      req.session.proximityAlertExportProximityAlertError = 'Export not implemented yet.'
      res.redirect(`/proximity-alert/${encodeURIComponent(crimeVersionId)}`)
    } catch {
      req.session.proximityAlertExportProximityAlertError = EXPORT_ERROR_MESSAGE
      res.redirect(`/proximity-alert/${encodeURIComponent(crimeVersionId)}`)
    }
  }
}
