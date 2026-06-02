import { Router } from 'express'
import type { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import ListHubManagersController from '../controllers/hubManagers/list'
import CreateHubManagersController from '../controllers/hubManagers/create'
import URLS from '../constants/urls'
import { ROLES } from '../constants/roles'
import hasRole from '../middleware/hasRole'

const hubManagersRoutes = ({ hubManagersService }: Services): Router => {
  const router = Router()
  const listController = new ListHubManagersController(hubManagersService)
  const createController = new CreateHubManagersController(hubManagersService)

  router.use(URLS.HUB_MANAGERS.VIEW, hasRole(ROLES.CRIME_MATCHING_HUB_MANAGER))

  router.get(URLS.HUB_MANAGERS.VIEW, asyncMiddleware(listController.view))
  router.post(URLS.HUB_MANAGERS.DELETE, asyncMiddleware(listController.delete))

  router.get(URLS.HUB_MANAGERS.CREATE, asyncMiddleware(createController.view))
  router.post(URLS.HUB_MANAGERS.CREATE, asyncMiddleware(createController.submit))

  return router
}

export default hubManagersRoutes
