import { z } from 'zod/v4'

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
  }),
})

export default getIngestionAttemptDtoSchema
