import { Router } from 'express'
import type { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import PoliceDataDashboardController from '../controllers/policeData/dashboard'
import PoliceDataIngestionAttemptController from '../controllers/policeData/ingestionAttempt'
import populateBackLink from '../middleware/populateBackLink'
import URLS from '../constants/urls'

const policeDataRoutes = ({ crimeMatchingResultsService, policeDataService, auditService }: Services): Router => {
  const router = Router()
  const policeDataDashboardController = new PoliceDataDashboardController(
    auditService,
    policeDataService,
    crimeMatchingResultsService,
  )
  const policeDataIngestionAttemptController = new PoliceDataIngestionAttemptController(auditService, policeDataService)

  // Dashboard
  router.get(URLS.POLICE_DATA.INGESTION_ATTEMPTS.VIEW, asyncMiddleware(policeDataDashboardController.view))
  router.post(URLS.POLICE_DATA.INGESTION_ATTEMPTS.VIEW, asyncMiddleware(policeDataDashboardController.search))
  router.get(
    URLS.POLICE_DATA.INGESTION_ATTEMPTS.EXPORT_MATCHING_RESULTS,
    asyncMiddleware(policeDataDashboardController.export),
  )

  // Ingestion attempt
  router.get(
    URLS.POLICE_DATA.INGESTION_ATTEMPT.VIEW,
    populateBackLink(URLS.POLICE_DATA.INGESTION_ATTEMPTS.VIEW),
    asyncMiddleware(policeDataIngestionAttemptController.view),
  )
  router.get(
    URLS.POLICE_DATA.INGESTION_ATTEMPT.EXPORT_VALIDATION_ERRORS,
    asyncMiddleware(policeDataIngestionAttemptController.export),
  )

  return router
}

export default policeDataRoutes
