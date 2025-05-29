import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { Page } from '../services/auditService'
import CrimeMappingController from '../controllers/crimeMapping'
import MapController from '../controllers/map'
import CrimeBatchesController from '../controllers/crimeMapping/crimeBatches'

export default function routes({ auditService, crimeMappingService, mapService }: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', async (req, res, next) => {
    await auditService.logPageView(Page.EXAMPLE_PAGE, { who: res.locals.user.username, correlationId: req.id })

    res.render('pages/index')
  })

  const crimeMappingController = new CrimeMappingController(crimeMappingService)
  const crimeBatchesController = new CrimeBatchesController()
  const mapController = new MapController(mapService)

  get('/crime-mapping', crimeMappingController.view)
  get('/crime-mapping/crime-batches', crimeBatchesController.view)
  get('/map/token', mapController.token)

  return router
}
