import { z } from 'zod/v4'

const getCrimeVersionDtoSchema = z.object({
  data: z.object({
    crimeVersionId: z.string(),
    crimeReference: z.string(),
    crimeType: z.string(),
    crimeDateTimeFrom: z.string(),
    crimeDateTimeTo: z.string(),
    crimeText: z.string(),
    matching: z
      .object({
        deviceWearers: z.array(
          z.object({
            name: z.string(),
            deviceId: z.number(),
            nomisId: z.string(),
            positions: z.array(
              z.object({
                latitude: z.number(),
                longitude: z.number(),
                sequenceLabel: z.string(),
                confidence: z.number(),
                capturedDateTime: z.string(),
              }),
            ),
          }),
        ),
      })
      .nullable(),
  }),
})

export default getCrimeVersionDtoSchema
