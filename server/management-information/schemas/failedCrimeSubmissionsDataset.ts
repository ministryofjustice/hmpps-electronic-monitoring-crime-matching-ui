import { z } from 'zod/v4'
import { paginatedDtoSchema } from '../../schemas/pagination'

const failedCrimeSubmissionsSchema = z.object({
  total: z.number().int().nonnegative(),
  failures: z.array(
    z.object({
      reasonForFailure: z.string(),
      failureCount: z.number().int().nonnegative(),
    }),
  ),
})

const failedCrimeSubmissionsDatasetSchema = paginatedDtoSchema.extend({
  data: z.array(failedCrimeSubmissionsSchema),
})

type FailedCrimeSubmissionsDataset = z.infer<typeof failedCrimeSubmissionsDatasetSchema>

export { failedCrimeSubmissionsDatasetSchema, FailedCrimeSubmissionsDataset }
