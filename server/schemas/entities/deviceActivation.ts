import { z } from 'zod/v4'

const deviceActivationSchema = z.object({
  deviceActivationId: z.number(),
  deviceId: z.number(),
  deviceName: z.string(),
  personId: z.number(),
  deviceActivationDate: z.string(),
  deviceDeactivationDate: z.string().nullable(),
  orderStart: z.string(),
  orderEnd: z.string(),
})

export default deviceActivationSchema
