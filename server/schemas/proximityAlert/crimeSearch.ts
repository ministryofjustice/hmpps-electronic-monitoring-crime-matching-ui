import { z } from 'zod/v4'
import { paginatedDtoSchema } from '../pagination'

const crimeSearchQuerySchema = z.object({
  crimeReference: z.string().nullable().default(null),
})

const getCrimeVersionsDtoSchema = paginatedDtoSchema.extend({
  data: z.array(
    z.object({
      crimeVersionId: z.string(),
      crimeReference: z.string(),
      policeForceArea: z.string(),
      crimeType: z.string(),
      crimeDate: z.string(),
      batchId: z.string(),
      ingestionDateTime: z.string(),
      matched: z.boolean(),
      versionLabel: z.string(),
      updates: z.string(),
    }),
  ),
})

export { crimeSearchQuerySchema, getCrimeVersionsDtoSchema }
