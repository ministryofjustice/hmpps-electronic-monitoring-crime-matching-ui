import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { Page } from '../services/auditService'
import CrimeMappingController from '../controllers/crimeMapping'
import MapController from '../controllers/map'
import CrimeBatchesController from '../controllers/crimeMapping/crimeBatches'
import LegalController from '../controllers/legal'
import SubjectController from '../controllers/subjectController'

export default function routes({ auditService, crimeMappingService, mapService, subjectService }: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', async (req, res, next) => {
    await auditService.logPageView(Page.EXAMPLE_PAGE, { who: res.locals.user.username, correlationId: req.id })

    res.render('pages/index')
  })

  const crimeMappingController = new CrimeMappingController(crimeMappingService)
  const crimeBatchesController = new CrimeBatchesController()
  const legalController = new LegalController()
  const mapController = new MapController(mapService)
  const subjectController = new SubjectController(subjectService)

  get('/crime-mapping', crimeMappingController.view)
  get('/crime-mapping/crime-batches', crimeBatchesController.view)
  get('/legal', legalController.view)
  get('/map/token', mapController.token)

  get('/location-data/subjects', subjectController.getSearchResults)
  post('/location-data/subjects', subjectController.submitSearch)

  return router
}
