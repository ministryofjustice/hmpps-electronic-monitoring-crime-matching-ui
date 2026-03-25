import { z } from 'zod/v4'

const policeDataIngestionAttemptQuerySchema = z.object({
  returnTo: z.string().default('/police-data/dashboard'),
})

const getIngestionAttemptDtoSchema = z.object({
  data: z.object({
    ingestionAttemptId: z.string(),
    ingestionStatus: z.string(),
    policeForceArea: z.string(),
    batchId: z.string(),
    matches: z.number().nullable(),
    createdAt: z.string(),
    fileName: z.string().nullable(),
    submitted: z.number(),
    successful: z.number(),
    failed: z.number(),
    crimesByCrimeType: z.array(
      z.object({
        crimeType: z.string(),
        submitted: z.number(),
        failed: z.number(),
        successful: z.number(),
      }),
    ),
    validationErrors: z.array(
      z.object({
        crimeReference: z.string(),
        errorType: z.string(),
        requiredAction: z.string(),
      }),
    ),
  }),
})

export { getIngestionAttemptDtoSchema, policeDataIngestionAttemptQuerySchema }
