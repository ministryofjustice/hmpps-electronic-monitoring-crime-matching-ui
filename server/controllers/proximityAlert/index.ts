import type { RequestHandler } from 'express'
import archiver from 'archiver'
import config from '../../config'
import toProximityAlertMapPositions from '../../presenters/proximityAlert/mapPositions'
import { loadProximityAlertFixtureById } from '../../services/proximityAlert/proximityAlertData'
import { renderProximityAlertMapImages } from '../../services/proximityAlert/mapImageRenderer'

// Spike: hardcode local URL for now
// The real UI will need to work in deployed environments
const LOCAL_BASE_URL = 'http://localhost:3000'
const EXPORT_ERROR_MESSAGE = 'Map image generation failed. Please try again (see server logs for details).'

export default class ProximityAlertController {
  view: RequestHandler = async (req, res) => {
    const id = String(req.params.id)

    const { fixtureName, matchingResult } = loadProximityAlertFixtureById(id)
    const positions = toProximityAlertMapPositions(matchingResult)
    const exportError = req.session.proximityAlertExportMapImagesError
    delete req.session.proximityAlertExportMapImagesError

    const alerts = []
    if (exportError) {
      alerts.push({
        variant: 'warning',
        title: 'Could not generate map images',
        message: exportError,
      })
    }

    res.render('pages/proximityAlert/index', {
      apiKey: config.maps.apiKey,
      cspNonce: res.locals.cspNonce,
      usesInternalOverlays: false,
      positions,
      alerts,
      selectedFixture: fixtureName,
      generateMapImagesForm: {
        url: `/proximity-alert/${id}/generate-map-images`,
      },
    })
  }

  generateMapImages: RequestHandler = async (req, res) => {
    const id = String(req.params.id)

    const pageUrl = `${LOCAL_BASE_URL}/proximity-alert/${encodeURIComponent(id)}`
    const zipFileName = `proximity-alert-${id}-map-images.zip`

    console.log('[generateMapImages] start', { id, pageUrl })

    try {
      // Render images
      const { image1Jpg, image2Jpg } = await renderProximityAlertMapImages({
        pageUrl,
        baseUrlForCookies: LOCAL_BASE_URL,
        cookieHeader: req.headers.cookie,
      })

      // Success: stream a valid zip
      res.setHeader('Content-Type', 'application/zip')
      res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`)

      const archive = archiver('zip', { zlib: { level: 9 } })

      archive.on('warning', err => {
        console.warn('[generateMapImages] archive warning:', err)
      })

      archive.on('error', err => {
        console.error('[generateMapImages] archive error:', err)
        try {
          res.end()
        } catch {
          // ignore
        }
      })

      archive.on('finish', () => console.log('[generateMapImages] archive finish event'))
      archive.on('close', () => console.log('[generateMapImages] archive close event'))

      archive.pipe(res)

      archive.append(image1Jpg, { name: 'image-1.jpg' })
      archive.append(image2Jpg, { name: 'image-2.jpg' })

      console.log('[generateMapImages] finalising archive')
      archive.finalize()
    } catch (err) {
      console.error('[generateMapImages] failed:', err)

      // Store one-time error and redirect back to the view page
      req.session.proximityAlertExportMapImagesError = EXPORT_ERROR_MESSAGE
      res.redirect(`/proximity-alert/${encodeURIComponent(id)}`)
    }
  }
}
