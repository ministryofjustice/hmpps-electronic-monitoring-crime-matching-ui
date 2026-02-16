import { Router, type Request, type Response } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import ProximityAlertController from '../controllers/proximityAlert'

const proximityAlertRoutes = (): Router => {
  const router = Router({ mergeParams: true })
  const controller = new ProximityAlertController()

  router.get('/', asyncMiddleware(controller.view))

  // Ensure that when signing in, the redirected route doesn't land the user on the export route
  router.get('/generate-map-images', (req: Request<{ id: string }>, res: Response) => {
    res.redirect(`/proximity-alert/${encodeURIComponent(req.params.id)}`)
  })

  router.post('/generate-map-images', asyncMiddleware(controller.generateMapImages))

  return router
}

export default proximityAlertRoutes
