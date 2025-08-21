import { Router } from 'express'
import type { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import populateSessionData from '../middleware/populateSessionData'
import populateDeviceActivation from '../middleware/populateDeviceActivation'
import SubjectController from '../controllers/locationData/subject'

const locationDataRoutes = ({ deviceActivationsService, subjectService, validationService }: Services): Router => {
  const router = Router()
  const subjectController = new SubjectController(subjectService, deviceActivationsService, validationService)

  router.use(populateSessionData)
  router.param('deviceActivationId', populateDeviceActivation(deviceActivationsService))

  router.get('/device-activations/:deviceActivationId', asyncMiddleware(subjectController.view))
  router.post('/subject', asyncMiddleware(subjectController.search))

  return router
}

export default locationDataRoutes
