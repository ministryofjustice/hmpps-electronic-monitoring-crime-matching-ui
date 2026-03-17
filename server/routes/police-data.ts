import { Router } from 'express'
import type { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import PoliceDataDashboardController from '../controllers/policeData/dashboard'
import PoliceDataIngestionAttemptController from '../controllers/policeData/ingestionAttempt'

const policeDataRoutes = ({ crimeMatchingResultsService, policeDataService }: Services): Router => {
  const router = Router()
  const policeDataDashboardController = new PoliceDataDashboardController(
    policeDataService,
    crimeMatchingResultsService,
  )
  const policeDataIngestionAttemptController = new PoliceDataIngestionAttemptController(policeDataService)

  router.get('/dashboard', asyncMiddleware(policeDataDashboardController.view))
  router.post('/dashboard', asyncMiddleware(policeDataDashboardController.search))
  router.get('/dashboard/export', asyncMiddleware(policeDataDashboardController.export))

  router.get('/ingestion-attempts/:ingestionAttemptId', asyncMiddleware(policeDataIngestionAttemptController.view))

  router.get(
    '/ingestion-attempts/:ingestionAttemptId/export-validation-errors',
    asyncMiddleware(policeDataIngestionAttemptController.exportValidationErrors),
  )

  return router
}

export default policeDataRoutes
