import { z } from 'zod/v4'
import { paginatedDtoSchema } from '../../schemas/pagination'

const zeroPrecisionCrimeMatchSchema = z.object({
  policeForceArea: z.string(),
  batchId: z.string(),
  crimeReference: z.string(),
  deviceSerialNumber: z.string(),
  matchedAt: z.string().datetime({ offset: true }),
  zeroPrecisionPositionCount: z.number().int().nonnegative(),
})

const zeroPrecisionCrimeMatchDatasetSchema = paginatedDtoSchema.extend({
  data: z.array(zeroPrecisionCrimeMatchSchema),
})

type ZeroPrecisionCrimeMatchesDataset = z.infer<typeof zeroPrecisionCrimeMatchDatasetSchema>

export { zeroPrecisionCrimeMatchDatasetSchema, ZeroPrecisionCrimeMatchesDataset }
