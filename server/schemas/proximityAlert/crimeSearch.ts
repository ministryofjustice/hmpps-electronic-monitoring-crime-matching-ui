import { z } from 'zod/v4'

const crimeSearchQuerySchema = z.object({
  crimeReference: z.string().nullable().default(null),
})

export default crimeSearchQuerySchema
