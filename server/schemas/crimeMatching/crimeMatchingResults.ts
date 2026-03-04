import { z } from 'zod/v4'

const getCrimeMatchingResultsDtoSchema = z.object({
  data: z.array(
    z.object({
      policeForce: z.string(),
      batchId: z.string(),
      crimeRef: z.string(),
      crimeType: z.string(),
      crimeDateTimeFrom: z.string(),
      crimeDateTimeTo: z.string(),
      crimeLatitude: z.number(),
      crimeLongitude: z.number(),
      crimeText: z.string(),
      deviceId: z.number(),
      deviceName: z.string(),
      subjectId: z.string(),
      subjectName: z.string(),
      subjectNomisId: z.string(),
      subjectPncRef: z.string(),
      subjectAddress: z.string(),
      subjectDateOfBirth: z.string(),
      subjectManager: z.string(),
    }),
  ),
})

export default getCrimeMatchingResultsDtoSchema
