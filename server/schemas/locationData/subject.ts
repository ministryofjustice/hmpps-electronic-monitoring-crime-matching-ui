import { z } from 'zod/v4'
import DateTimeInputModel from '../formInput/dateTime'

const subjectQueryParametersSchema = z.object({
  from: z.string().default(''),
  to: z.string().default(''),
})

const subjectLocationsFormDataSchema = z
  .object({
    fromDate: DateTimeInputModel,
    toDate: DateTimeInputModel,
  })
  .transform(data => {
    return {
      fromDate: data.fromDate.toISOString(),
      toDate: data.toDate.toISOString(),
    }
  })

const createSubjectLocationsQueryDtoSchema = z.object({
  queryExecutionId: z.string(),
})

const getSubjectDtoSchema = z.object({
  locations: z.array(
    z.object({
      locationRef: z.number(),
      point: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }),
      confidenceCircle: z.number(),
      speed: z.number(),
      direction: z.number(),
      timestamp: z.string(),
      geolocationMechanism: z.number(),
      sequenceNumber: z.number(),
    }),
  ),
})

export {
  subjectQueryParametersSchema,
  subjectLocationsFormDataSchema,
  createSubjectLocationsQueryDtoSchema,
  getSubjectDtoSchema,
}
