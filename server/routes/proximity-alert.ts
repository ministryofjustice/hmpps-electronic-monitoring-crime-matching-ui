import { Router, type Request, type Response } from 'express'
import type { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import CrimeSearchController from '../controllers/proximityAlert/crimeSearch'
import CrimeVersionController from '../controllers/proximityAlert/crimeVersion'

const proximityAlertRoutes = ({ crimeService, playwrightBrowserService }: Services): Router => {
  const router = Router()
  const crimeSearchController = new CrimeSearchController(crimeService)
  const crimeVersionController = new CrimeVersionController(crimeService, playwrightBrowserService)

  router.get('/', asyncMiddleware(crimeSearchController.view))
  router.post('/', asyncMiddleware(crimeSearchController.search))

  router.get('/:crimeVersionId', asyncMiddleware(crimeVersionController.view))

  router.get('/:crimeVersionId/export-proximity-alert', (req: Request<{ crimeVersionId: string }>, res: Response) => {
    res.redirect(`/proximity-alert/${encodeURIComponent(req.params.crimeVersionId)}`)
  })

  router.post('/:crimeVersionId/export-proximity-alert', asyncMiddleware(crimeVersionController.exportProximityAlert))

  return router
}

export default proximityAlertRoutes
