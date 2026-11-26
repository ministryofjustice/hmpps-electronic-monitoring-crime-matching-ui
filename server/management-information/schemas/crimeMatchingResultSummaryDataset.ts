import { z } from 'zod/v4'
import { paginatedDtoSchema } from '../../schemas/pagination'

const crimeMatchingResultSummarySchema = z.object({
  policeForceArea: z.string(),
  batchId: z.string(),
  automatedMatches: z.number().int(),
})

const crimeMatchingResultSummaryDatasetSchema = paginatedDtoSchema.extend({
  data: z.array(crimeMatchingResultSummarySchema),
})

type CrimeMatchingResultSummaryDataset = z.infer<typeof crimeMatchingResultSummaryDatasetSchema>

export { crimeMatchingResultSummaryDatasetSchema, CrimeMatchingResultSummaryDataset }
