import { Router } from 'express'
import type { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import ListHubManagersController from '../controllers/hubManagers/list'
import CreateHubManagersController from '../controllers/hubManagers/create'
import URLS from '../constants/urls'

const hubManagersRoutes = ({ hubManagersService }: Services): Router => {
  const router = Router()
  const listController = new ListHubManagersController(hubManagersService)
  const createController = new CreateHubManagersController(hubManagersService)

  router.get(URLS.HUB_MANAGERS__LIST, asyncMiddleware(listController.view))
  router.post(URLS.HUB_MANAGERS__DELETE, asyncMiddleware(listController.delete))

  router.get(URLS.HUB_MANAGERS__CREATE, asyncMiddleware(createController.view))
  router.post(URLS.HUB_MANAGERS__CREATE, asyncMiddleware(createController.submit))

  return router
}

export default hubManagersRoutes
