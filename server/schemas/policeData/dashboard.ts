import { z } from 'zod/v4'
import { paginatedDtoSchema } from '../pagination'

const policeDataDashboardQuerySchema = z.object({
  policeForceArea: z.string().default(''),
  batchId: z.string().default(''),
  fromDate: z.string().default(''),
  toDate: z.string().default(''),
  page: z.string().default(''),
})

const policeDataDashboardExportQuerySchema = z.object({
  batchIds: z
    .union([z.string(), z.array(z.string())])
    .default([])
    .transform(v => (typeof v === 'string' ? [v] : v)),
})

const getIngestionAttemptDtoSchema = paginatedDtoSchema.extend({
  data: z.array(
    z.object({
      ingestionAttemptId: z.string(),
      ingestionStatus: z.string(),
      policeForceArea: z.string(),
      crimeBatchId: z.string(),
      batchId: z.string(),
      matches: z.number().nullable(),
      createdAt: z.string(),
    }),
  ),
})

export { getIngestionAttemptDtoSchema, policeDataDashboardQuerySchema, policeDataDashboardExportQuerySchema }
