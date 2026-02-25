import { Router, type Request, type Response } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import ProximityAlertController from '../controllers/proximityAlert'
import type { Services } from '../services'

const proximityAlertRoutes = ({ playwrightBrowserService }: Services): Router => {
  const router = Router({ mergeParams: true })
  const controller = new ProximityAlertController(playwrightBrowserService)

  router.get('/', asyncMiddleware(controller.view))

  // Ensure that when signing in, the redirected route doesn't land the user on the export route
  router.get('/export-proximity-alert', (req: Request<{ id: string }>, res: Response) => {
    res.redirect(`/proximity-alert/${encodeURIComponent(req.params.id)}`)
  })

  router.post('/export-proximity-alert', asyncMiddleware(controller.exportProximityAlert))

  return router
}

export default proximityAlertRoutes
