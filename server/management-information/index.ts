import { Router } from 'express'
import type { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import ManagementInformationController from './managementInformationController'
import DatasetController from './datasetController'
import DatasetExportController from './datasetExportController'
import URLS from '../constants/urls'
import { ROLES } from '../constants/roles'
import hasRole from '../middleware/hasRole'
import DatasetRegistry from './datasetRegistry'
import ZeroPrecisionCrimeMatches from './datasets/zeroPrecisionCrimeMatches'

const managementInformationRoutes = ({ crimeMatchingApiClient }: Services): Router => {
  const router = Router()
  const registry = new DatasetRegistry([new ZeroPrecisionCrimeMatches(crimeMatchingApiClient)])
  const datasetController = new DatasetController(registry)
  const datasetExportController = new DatasetExportController(registry)
  const managementInformationController = new ManagementInformationController(registry)

  router.use(URLS.MANAGEMENT_INFORMATION.VIEW, hasRole(ROLES.CRIME_MATCHING_HUB_MANAGER))

  router.get(URLS.MANAGEMENT_INFORMATION.VIEW, asyncMiddleware(managementInformationController.view))
  router.get(URLS.MANAGEMENT_INFORMATION.VIEW_DATASET, asyncMiddleware(datasetController.view))
  router.get(URLS.MANAGEMENT_INFORMATION.DOWNLOAD_DATASET, asyncMiddleware(datasetExportController.download))

  return router
}

export default managementInformationRoutes
