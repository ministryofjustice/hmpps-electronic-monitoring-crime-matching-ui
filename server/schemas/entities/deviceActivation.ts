import { z } from 'zod/v4'

const deviceActivationSchema = z.object({
  deviceActivationId: z.number(),
  deviceId: z.number(),
  personId: z.number(),
  deviceActivationDate: z.string(),
  deviceDeactivationDate: z.string().nullable(),
})

export default deviceActivationSchema
