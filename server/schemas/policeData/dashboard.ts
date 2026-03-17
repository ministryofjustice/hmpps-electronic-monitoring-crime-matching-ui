import { z } from 'zod/v4'
import { paginatedDtoSchema } from '../pagination'
import { ingestionStatusSchema } from '../../types/ingestionStatus'

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

const ingestionAttemptDetailDtoSchema = z.object({
  ingestionAttemptId: z.string(),
  ingestionStatus: ingestionStatusSchema,
  policeForceArea: z.string(),
  crimeBatchId: z.string(),
  batchId: z.string(),
  filename: z.string(),
  matches: z.number().nullable(),
  createdAt: z.string(),
  isCrimeBatch: z.boolean(),
  failureSubCategory: z.string().nullable(),
  breakdownByCrimeType: z.array(
    z.object({
      crimeType: z.string(),
      submitted: z.number(),
      ingested: z.number(),
      failedValidation: z.number(),
    }),
  ),
  validationErrors: z.array(
    z.object({
      crimeReference: z.string(),
      errorType: z.string(),
      requiredAction: z.string(),
    }),
  ),
})

type IngestionAttemptDetail = z.infer<typeof ingestionAttemptDetailDtoSchema>

export { getIngestionAttemptDtoSchema, ingestionAttemptDetailDtoSchema, ingestionStatusSchema, policeDataDashboardQuerySchema, policeDataDashboardExportQuerySchema }

export type { IngestionAttemptDetail }
