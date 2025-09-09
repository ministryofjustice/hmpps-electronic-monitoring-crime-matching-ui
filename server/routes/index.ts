import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { Page } from '../services/auditService'
import CrimeMappingController from '../controllers/crimeMapping'
import CrimeBatchesController from '../controllers/crimeMapping/crimeBatches'
import LegalController from '../controllers/legal'
import HelpController from '../controllers/help'
import PersonsController from '../controllers/locationData/persons'
import populateSessionData from '../middleware/populateSessionData'
import locationDataRoutes from './location-data'

export default function routes(services: Services): Router {
  const { auditService, crimeBatchesService, crimeMappingService, personsService } = services
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', async (req, res, next) => {
    await auditService.logPageView(Page.EXAMPLE_PAGE, { who: res.locals.user.username, correlationId: req.id })

    res.render('pages/index')
  })

  const crimeMappingController = new CrimeMappingController(crimeMappingService)
  const crimeBatchesController = new CrimeBatchesController(crimeBatchesService)
  const helpController = new HelpController()
  const legalController = new LegalController()
  const personsController = new PersonsController(personsService)

  router.use(populateSessionData)

  get('/crime-mapping', crimeMappingController.view)

  get('/help', helpController.view)
  get('/legal', legalController.view)

  get('/crime-mapping/crime-batches', crimeBatchesController.view)
  post('/crime-mapping/crime-batches', crimeBatchesController.search)

  get('/location-data/persons', personsController.view)
  post('/location-data/persons', personsController.search)

  router.use('/location-data', locationDataRoutes(services))

  return router
}
