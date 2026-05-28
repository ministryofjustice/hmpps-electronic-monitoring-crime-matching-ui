import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import LegalController from '../controllers/legal'
import HelpController from '../controllers/help'
import PersonsController from '../controllers/locationData/persons'
import populateSessionData from '../middleware/populateSessionData'
import locationDataRoutes from './location-data'
import policeDataRoutes from './police-data'
import proximityAlertRoutes from './proximity-alert'
import hubManagersRoutes from './hubManagers'
import HomepageController from '../controllers/homepage'

export default function routes(services: Services): Router {
  const { auditService, featuresService, personsService } = services
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const homepageController = new HomepageController(auditService, featuresService)
  const helpController = new HelpController()
  const legalController = new LegalController()
  const personsController = new PersonsController(personsService)

  router.use(populateSessionData)

  get('/', homepageController.view)
  get('/help', helpController.view)
  get('/legal', legalController.view)

  get('/location-data/persons', personsController.view)
  post('/location-data/persons', personsController.search)

  router.use('/location-data', locationDataRoutes(services))
  router.use(policeDataRoutes(services))
  router.use(proximityAlertRoutes(services))
  router.use(hubManagersRoutes(services))

  return router
}
