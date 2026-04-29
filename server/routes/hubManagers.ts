import { Router } from 'express'
import type { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import ListHubManagersController from '../controllers/hubManagers/list'
import CreateHubManagersController from '../controllers/hubManagers/create'

const hubManagersRoutes = ({ hubManagersService }: Services): Router => {
  const router = Router()
  const listController = new ListHubManagersController(hubManagersService)
  const createController = new CreateHubManagersController(hubManagersService)

  router.get('/', asyncMiddleware(listController.view))
  router.get('/:id/delete', asyncMiddleware(listController.delete))

  router.get('/create', asyncMiddleware(createController.view))
  router.post('/create', asyncMiddleware(createController.submit))

  return router
}

export default hubManagersRoutes
