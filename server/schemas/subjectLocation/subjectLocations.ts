import { z } from 'zod/v4'
import DateTimeInputModel from '../formInput/dateTime'

const VALID_PERSON = 'You must select a valid person ID'
const TO_AFTER_FROM = 'To date must be after From date'
const DATE_BETWEEN_ORDER = 'Date and time search window should be within Order date range'
const DATE_RANGE = 'Date and time search window should not exceed 48 hours'
const maxDateRange = 48 * 60 * 60 * 1000

const subjectLocationsQueryParametersSchema = z.object({
  queryId: z.string().optional(),
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
    const fromDateTime = ctx.value.fromDate.toDate()
    const toDateTime = ctx.value.toDate.toDate()

    if (toDateTime < fromDateTime) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
        message: TO_AFTER_FROM,
        path: ['date'],
      })
      return
    }

    if (toDateTime.getTime() - fromDateTime.getTime() > maxDateRange) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
        message: DATE_RANGE,
        path: ['date'],
      })
      return
    }

    const orderStartDate = new Date(ctx.value.orderStartDate)

    if (fromDateTime < orderStartDate || toDateTime < orderStartDate) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
        message: DATE_BETWEEN_ORDER,
        path: ['date'],
      })
      return
    }

    if (ctx.value.orderEndDate) {
      const orderEndDate = new Date(ctx.value.orderEndDate)
      if (fromDateTime > orderEndDate || toDateTime > orderEndDate) {
        ctx.issues.push({
          code: 'custom',
          input: ctx.value,
          message: DATE_BETWEEN_ORDER,
          path: ['date'],
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

export { subjectLocationsQueryParametersSchema, subjectLocationsFormDataSchema, createSubjectLocationsQueryDtoSchema }
