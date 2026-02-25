import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { Page } from '../services/auditService'
import CrimeMappingController from '../controllers/crimeMapping'
import CrimeBatchesController from '../controllers/crimeMapping/crimeBatches'
import LegalController from '../controllers/legal'
import HelpController from '../controllers/help'
import PersonsController from '../controllers/locationData/persons'
import PoliceDataDashboardController from '../controllers/policeData/dashboard'
import populateSessionData from '../middleware/populateSessionData'
import locationDataRoutes from './location-data'
import PoliceDataIngestionAttemptController from '../controllers/policeData/ingestionAttempt'

export default function routes(services: Services): Router {
  const { auditService, crimeBatchesService, crimeMappingService, personsService, policeDataService } = services
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
  const policeDataDashboardController = new PoliceDataDashboardController(policeDataService)
  const policeDataIngestionAttemptController = new PoliceDataIngestionAttemptController(policeDataService)

  router.use(populateSessionData)

  get('/crime-mapping', crimeMappingController.view)

  get('/help', helpController.view)
  get('/legal', legalController.view)

  get('/crime-mapping/crime-batches', crimeBatchesController.view)
  post('/crime-mapping/crime-batches', crimeBatchesController.search)

  get('/location-data/persons', personsController.view)
  post('/location-data/persons', personsController.search)

  get('/police-data/dashboard', policeDataDashboardController.view)
  get('/police-data/ingestion-attempts/:ingestionAttemptId', policeDataIngestionAttemptController.view)

  router.use('/location-data', locationDataRoutes(services))

  return router
}
