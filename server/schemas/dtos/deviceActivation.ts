import { z } from 'zod/v4'
import positionSchema from '../entities/position'
import deviceActivationSchema from '../entities/deviceActivation'

const getDeviceActivationDtoSchema = z.object({
  data: deviceActivationSchema,
})

const getDeviceActivationPositionsDtoSchema = z.object({
  data: z.array(positionSchema),
})

export { getDeviceActivationDtoSchema, getDeviceActivationPositionsDtoSchema }
