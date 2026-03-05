import { z } from 'zod/v4'

const crimeSearchQuerySchema = z.object({
  crimeReference: z.string().default(''),
})

export default crimeSearchQuerySchema
