import { Router } from 'express'
import type { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import CrimeSearchController from '../controllers/proximityAlert/crimeSearch'

const proximityAlertRoutes = ({ crimeService }: Services): Router => {
  const router = Router()
  const crimeSearchController = new CrimeSearchController(crimeService)

  router.get('/', asyncMiddleware(crimeSearchController.view))
  router.post('/', asyncMiddleware(crimeSearchController.search))

  return router
}

export default proximityAlertRoutes
