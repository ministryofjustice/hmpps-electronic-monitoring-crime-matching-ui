import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { Page } from '../services/auditService'
import LegalController from '../controllers/legal'
import HelpController from '../controllers/help'
import PersonsController from '../controllers/locationData/persons'
import populateSessionData from '../middleware/populateSessionData'
import locationDataRoutes from './location-data'
import policeDataRoutes from './police-data'

export default function routes(services: Services): Router {
  const { auditService, personsService } = services
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', async (req, res, next) => {
    await auditService.logPageView(Page.EXAMPLE_PAGE, { who: res.locals.user.username, correlationId: req.id })

    res.render('pages/index')
  })

  const helpController = new HelpController()
  const legalController = new LegalController()
  const personsController = new PersonsController(personsService)

  router.use(populateSessionData)

  get('/help', helpController.view)
  get('/legal', legalController.view)

  get('/location-data/persons', personsController.view)
  post('/location-data/persons', personsController.search)

  router.use('/location-data', locationDataRoutes(services))
  router.use('/police-data', policeDataRoutes(services))

  return router
}
