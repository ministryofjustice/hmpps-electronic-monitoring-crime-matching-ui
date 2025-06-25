import { z } from 'zod/v4'
import { paginatedDtoSchema } from '../pagination'

const crimeBatchesQueryParametersSchema = z.object({
  queryId: z.string().optional(),
  page: z
    .string()
    .regex(/^\d{1,2}$/)
    .optional(),
})

const crimeBatchesFormDataSchema = z.object({
  searchTerm: z.string().default(''),
})

const createCrimeBatchesQueryDtoSchema = z.object({
  queryExecutionId: z.string(),
})

const getCrimeBatchesQueryDtoSchema = paginatedDtoSchema.extend({
  data: z.array(
    z.object({
      policeForce: z.string(),
      batch: z.string(),
      start: z.string(),
      end: z.string(),
      time: z.number(),
      matches: z.number(),
      ingestionDate: z.string(),
      caseloadMappingDate: z.string(),
      crimeMatchingAlgorithmVersion: z.string(),
    }),
  ),
})

export {
  crimeBatchesQueryParametersSchema,
  createCrimeBatchesQueryDtoSchema,
  getCrimeBatchesQueryDtoSchema,
  crimeBatchesFormDataSchema,
}
