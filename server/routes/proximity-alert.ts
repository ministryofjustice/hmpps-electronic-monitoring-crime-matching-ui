import { Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import ProximityAlertController from '../controllers/proximityAlert'

const proximityAlertRoutes = (): Router => {
  const router = Router({ mergeParams: true })
  const controller = new ProximityAlertController()

  router.get('/', asyncMiddleware(controller.view))
  router.get('/generate-map-images', asyncMiddleware(controller.generateMapImages))

  // We'll add this later:
  // router.get('/download-images', asyncMiddleware(controller.downloadImages))

  return router
}

export default proximityAlertRoutes
