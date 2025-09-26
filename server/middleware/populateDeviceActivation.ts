import { NextFunction, Request, RequestParamHandler, Response } from 'express'
import logger from '../../logger'
import DeviceActivationsService from '../services/deviceActivationsService'

const populateDeviceActivation =
  (deviceActivationsService: DeviceActivationsService): RequestParamHandler =>
  async (req: Request, res: Response, next: NextFunction, deviceActivationId: string) => {
    try {
      const { username } = res.locals.user
      const deviceActivation = await deviceActivationsService.getDeviceActivation(username, deviceActivationId)

      req.deviceActivation = deviceActivation
      next()
    } catch (error) {
      logger.error(error, `Failed to populate device activation for: ${deviceActivationId}`)
      next(error)
    }
  }

export default populateDeviceActivation
