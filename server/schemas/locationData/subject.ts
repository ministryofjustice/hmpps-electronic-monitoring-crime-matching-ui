import { z } from 'zod/v4'
import dayjs from 'dayjs'
import DateTimeInputModel from '../formInput/dateTime'

const VALID_PERSON = 'You must select a valid person ID'
const TO_AFTER_FROM = 'To date must be after From date'
const DATE_BETWEEN_ORDER = 'Date and time search window should be within Order date range'
const DATE_RANGE = 'Date and time search window should not exceed 48 hours'
const maxDateRange = 48 * 60 * 60 * 1000

const subjectQueryParametersSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
})

const subjectLocationsFormDataSchema = z
  .object({
    personId: z.string().min(1, VALID_PERSON),
    fromDate: DateTimeInputModel(),
    toDate: DateTimeInputModel(),
    orderStartDate: z.string(),
    orderEndDate: z.string().nullable(),
  })
  .check(ctx => {
    const fromDateTime = ctx.value.fromDate
    const toDateTime = ctx.value.toDate

    if (toDateTime.isBefore(fromDateTime)) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
        message: TO_AFTER_FROM,
        path: ['fromDate'],
      })
      return
    }

    if (toDateTime.valueOf() - fromDateTime.valueOf() > maxDateRange) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
        message: DATE_RANGE,
        path: ['fromDate'],
      })
      return
    }

    const orderStartDateTime = dayjs(ctx.value.orderStartDate)

    if (fromDateTime.isBefore(orderStartDateTime) || toDateTime.isBefore(orderStartDateTime)) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
        message: DATE_BETWEEN_ORDER,
        path: ['fromDate'],
      })
      return
    }

    if (ctx.value.orderEndDate) {
      const orderEndDateTime = dayjs(ctx.value.orderEndDate)
      if (fromDateTime.isAfter(orderEndDateTime) || toDateTime.isAfter(orderEndDateTime)) {
        ctx.issues.push({
          code: 'custom',
          input: ctx.value,
          message: DATE_BETWEEN_ORDER,
          path: ['fromDate'],
        })
      }
    }
  })
  .transform(data => {
    return {
      personId: data.personId,
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
