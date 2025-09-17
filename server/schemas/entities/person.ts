import { z } from 'zod/v4'
import deviceActivationSchema from './deviceActivation'

const personSchema = z.object({
  personId: z.number(),
  name: z.string(),
  nomisId: z.string(),
  pncRef: z.string(),
  address: z.string(),
  dateOfBirth: z.string(),
  probationPractitioner: z.string(),
  deviceActivations: z.array(deviceActivationSchema),
})

export default personSchema
