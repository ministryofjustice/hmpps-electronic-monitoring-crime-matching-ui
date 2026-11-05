import { Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import ManagementInformationController from './managementInformationController'
import URLS from '../constants/urls'
import { ROLES } from '../constants/roles'
import hasRole from '../middleware/hasRole'
import DatasetRegistry from './datasetRegistry'

const managementInformationRoutes = (): Router => {
  const router = Router()
  const registry = new DatasetRegistry()
  const managementInformationController = new ManagementInformationController(registry)

  router.use(URLS.MANAGEMENT_INFORMATION.VIEW, hasRole(ROLES.CRIME_MATCHING_HUB_MANAGER))

  router.get(URLS.MANAGEMENT_INFORMATION.VIEW, asyncMiddleware(managementInformationController.view))

  return router
}

export default managementInformationRoutes
