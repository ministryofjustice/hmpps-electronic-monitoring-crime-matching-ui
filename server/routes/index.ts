import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { Page } from '../services/auditService'
import CrimeMappingController from '../controllers/crimeMapping'
import MapController from '../controllers/map'
import CrimeBatchesController from '../controllers/crimeMapping/crimeBatches'
import LegalController from '../controllers/legal'
import HelpController from '../controllers/help'
import SubjectsController from '../controllers/locationData/subjects'
import populateSessionData from '../middleware/populateSessionData'
import SubjectController from '../controllers/locationData/subject'

export default function routes({
  auditService,
  crimeBatchesService,
  crimeMappingService,
  mapService,
  personsService,
  subjectService,
}: Services): Router {
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
  const mapController = new MapController(mapService)
  const subjectsController = new SubjectsController(personsService)
  const subjectController = new SubjectController(subjectService)

  router.use(populateSessionData)

  get('/crime-mapping', crimeMappingController.view)

  get('/help', helpController.view)
  get('/legal', legalController.view)
  get('/map/token', mapController.token)

  get('/crime-mapping/crime-batches', crimeBatchesController.view)
  post('/crime-mapping/crime-batches', crimeBatchesController.search)

  get('/location-data/subjects', subjectsController.view)
  post('/location-data/subjects', subjectsController.search)

  get('/location-data/:personId', subjectController.view)
  post('/location-data/subject', subjectController.search)

  return router
}
