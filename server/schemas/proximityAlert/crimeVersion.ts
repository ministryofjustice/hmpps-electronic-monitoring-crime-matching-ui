import { z } from 'zod/v4'

const getCrimeVersionDtoSchema = z.object({
  data: z.object({
    crimeVersionId: z.string(),
    latestCrimeVersionId: z.string().nullable(),
    crimeReference: z.string(),
    batchId: z.string(),
    crimeTypeDescription: z.string(),
    crimeTypeId: z.string(),
    crimeDateTimeFrom: z.string(),
    crimeDateTimeTo: z.string(),
    crimeText: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    versionLabel: z.string(),
    matching: z
      .object({
        deviceWearers: z.array(
          z.object({
            deviceId: z.number(),
            name: z.string(),
            nomisId: z.string(),
            positions: z.array(
              z.object({
                capturedDateTime: z.string(),
                direction: z.number(),
                latitude: z.number(),
                longitude: z.number(),
                precision: z.number(),
                sequenceLabel: z.string(),
                speed: z.number(),
              }),
            ),
          }),
        ),
      })
      .nullable(),
  }),
})

export default getCrimeVersionDtoSchema
