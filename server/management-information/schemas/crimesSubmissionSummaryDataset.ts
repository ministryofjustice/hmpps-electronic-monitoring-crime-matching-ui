import { z } from 'zod/v4'
import { paginatedDtoSchema } from '../../schemas/pagination'

const crimesSubmissionSummarySchema = z.object({
  crimeType: z.string(),
  submitted: z.number().int().nonnegative(),
  ingested: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  notIngestedPercentage: z.number().nonnegative(),
})

const crimesSubmissionSummaryDatasetSchema = paginatedDtoSchema.extend({
  data: z.array(crimesSubmissionSummarySchema),
})

type CrimeSubmissionSummaryDataset = z.infer<typeof crimesSubmissionSummaryDatasetSchema>

export { crimesSubmissionSummaryDatasetSchema, CrimeSubmissionSummaryDataset }
