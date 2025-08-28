import { Router } from 'express'
import type { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import populateDeviceActivation from '../middleware/populateDeviceActivation'
import SubjectController from '../controllers/locationData/subject'

const locationDataRoutes = ({ deviceActivationsService, validationService }: Services): Router => {
  const router = Router()
  const subjectController = new SubjectController(deviceActivationsService, validationService)

  router.param('deviceActivationId', populateDeviceActivation(deviceActivationsService))

  router.get('/device-activations/:deviceActivationId', asyncMiddleware(subjectController.view))
  router.post('/device-activations/:deviceActivationId', asyncMiddleware(subjectController.search))
  router.get('/device-activations/:deviceActivationId/download', asyncMiddleware(subjectController.download))

  return router
}

export default locationDataRoutes
