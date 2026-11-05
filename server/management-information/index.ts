import { Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import ManagementInformationController from './managementInformationController'
import DatasetController from './datasetController'
import URLS from '../constants/urls'
import { ROLES } from '../constants/roles'
import hasRole from '../middleware/hasRole'
import DatasetRegistry from './datasetRegistry'

const managementInformationRoutes = (): Router => {
  const router = Router()
  const registry = new DatasetRegistry()
  const datasetController = new DatasetController(registry)
  const managementInformationController = new ManagementInformationController(registry)

  router.use(URLS.MANAGEMENT_INFORMATION.VIEW, hasRole(ROLES.CRIME_MATCHING_HUB_MANAGER))

  router.get(URLS.MANAGEMENT_INFORMATION.VIEW, asyncMiddleware(managementInformationController.view))
  router.get(URLS.MANAGEMENT_INFORMATION.VIEW_DATASET, asyncMiddleware(datasetController.view))

  return router
}

export default managementInformationRoutes
