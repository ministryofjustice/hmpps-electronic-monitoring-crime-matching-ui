import { z } from 'zod/v4'
import deviceActivationSchema from './deviceActivation'

const personSchema = z.object({
  personId: z.string(),
  name: z.string(),
  nomisId: z.string(),
  address: z.string(),
  dateOfBirth: z.string(),
  deviceActivations: z.array(deviceActivationSchema),
})

export default personSchema
