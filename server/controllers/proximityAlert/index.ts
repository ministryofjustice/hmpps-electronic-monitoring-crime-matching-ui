/* eslint-disable no-console */
import type { RequestHandler } from 'express'
import config from '../../config'
import { toProximityAlertReportData } from '../../services/proximityAlert/proximityAlertReportData'
import { buildProximityAlertReportDocx } from '../../services/proximityAlert/proximityAlertReportDocx'
import toProximityAlertMapPositions from '../../presenters/proximityAlert/mapPositions'
import { loadProximityAlertFixtureById } from '../../services/proximityAlert/proximityAlertData'
import { renderProximityAlertReportImages } from '../../services/proximityAlert/mapImageRenderer'
import type PlaywrightBrowserService from '../../services/proximityAlert/playwrightBrowserManager'

// Spike: hardcode local URL for now
// The real UI will need to work in deployed environments
const LOCAL_BASE_URL = 'http://localhost:3000'
const EXPORT_ERROR_MESSAGE = 'Could not export Proximity Alert report. Please try again (see server logs for details).'

const DOCX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(v => String(v)).filter(Boolean)
  if (typeof value === 'string' && value.length > 0) return [value]
  return []
}

function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const s = value.trim()
  return s.length ? s : undefined
}

export default class ProximityAlertController {
  constructor(private readonly playwrightBrowserService: PlaywrightBrowserService) {}

  view: RequestHandler = async (req, res) => {
    const id = String(req.params.id)

    const { fixtureName, matchingResult } = loadProximityAlertFixtureById(id)
    const positions = toProximityAlertMapPositions(matchingResult)

    const exportError = req.session.proximityAlertExportProximityAlertError
    delete req.session.proximityAlertExportProximityAlertError

    const alerts = []
    if (exportError) {
      alerts.push({
        variant: 'warning',
        title: 'Could not export Proximity Alert',
        message: exportError,
      })
    }

    const matchedDeviceWearers =
      (
        matchingResult as unknown as {
          matchedDeviceWearers?: Array<{ deviceWearerId: string; name?: string }>
        }
      ).matchedDeviceWearers ?? []

    res.render('pages/proximityAlert/index', {
      apiKey: config.maps.apiKey,
      cspNonce: res.locals.cspNonce,
      usesInternalOverlays: false,
      positions,
      alerts,
      selectedFixture: fixtureName,
      selectedFixtureId: id,
      matchedDeviceWearers,
      exportProximityAlertForm: {
        url: `/proximity-alert/${id}/export-proximity-alert`,
      },
    })
  }

  exportProximityAlert: RequestHandler = async (req, res) => {
    const id = String(req.params.id)

    const pageUrl = `${LOCAL_BASE_URL}/proximity-alert/${encodeURIComponent(id)}`
    const docxFileName = `proximity-alert-${id}.docx`

    console.log('[exportProximityAlert] start', { id, pageUrl })

    const browser = await this.playwrightBrowserService.getBrowser()

    try {
      const { matchingResult } = loadProximityAlertFixtureById(id)
      const selectedFromForm = toStringArray((req.body as unknown as { deviceWearerIds?: unknown })?.deviceWearerIds)

      // Default to ALL wearers if none selected (spike-friendly)
      const allWearerIds =
        (
          matchingResult as unknown as {
            matchedDeviceWearers?: Array<{ deviceWearerId: string }>
          }
        ).matchedDeviceWearers?.map(w => String(w.deviceWearerId)) ?? []

      const selectedDeviceWearerIds = selectedFromForm.length > 0 ? selectedFromForm : allWearerIds

      const image1State = toOptionalString((req.body as unknown as { image1State?: unknown })?.image1State)

      // Render map images
      const images = await renderProximityAlertReportImages({
        browser,
        pageUrl,
        baseUrlForCookies: LOCAL_BASE_URL,
        cookieHeader: req.headers.cookie,
        selectedDeviceWearerIds,
        image1StateJson: image1State,
      })

      // Build report data filtered to selected wearers
      const report = toProximityAlertReportData(matchingResult, { selectedDeviceWearerIds })

      // Build the DOCX (in-memory)
      const docxBuffer = await buildProximityAlertReportDocx({ report, images })

      res.setHeader('Content-Type', DOCX_CONTENT_TYPE)
      res.setHeader('Content-Disposition', `attachment; filename="${docxFileName}"`)
      res.send(docxBuffer)

      console.log('[exportProximityAlert] complete', { id, bytes: docxBuffer.length })
    } catch (err) {
      console.error('[exportProximityAlert] failed:', err)

      req.session.proximityAlertExportProximityAlertError = EXPORT_ERROR_MESSAGE
      res.redirect(`/proximity-alert/${encodeURIComponent(id)}`)
    }
  }
}
