import { z } from 'zod/v4'
import { parse } from 'date-fns'

const VALID_SUBJECT = 'You must select a valid subject ID'
const VALID_DATE = 'You must enter a valid value for search date'
const TO_AFTER_FROM = 'To date must be after From date'
const DATE_BETWEEN_ORDER = 'Date and time search window should be within Order date range'
const DATE_RANGE = 'Date and time search window should not exceed 48 hours'
const maxDateRange = 48 * 60 * 60 * 1000

const subjectLocationsQueryParametersSchema = z.object({
  queryId: z.string().optional(),
})

const subjectLocationsFormDataSchema = z
  .object({
    nomisId: z.string().min(1, VALID_SUBJECT),
    fromDate: z.string(),
    fromHour: z.string(),
    fromMinute: z.string(),
    fromSecond: z.string(),
    toDate: z.string(),
    toHour: z.string(),
    toMinute: z.string(),
    toSecond: z.string(),
    orderStartDate: z.string(),
    orderEndDate: z.string().nullable(),
  }).check(ctx => {

    if (Object.values(ctx.value).some(value => value === '' || value === undefined)) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
        message: VALID_DATE,
        path: ['date'],
      })
      return
    }

    const fromDateTime = formatDate(ctx.value.fromDate, ctx.value.fromHour, ctx.value.fromMinute, ctx.value.fromSecond)

    if (Number.isNaN(fromDateTime.getTime())) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
        message: VALID_DATE,
        path: ['date'],
      })
      return
    }

    const toDateTime = formatDate(ctx.value.toDate, ctx.value.toHour, ctx.value.toMinute, ctx.value.toSecond)

    if (Number.isNaN(toDateTime.getTime())) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
        message: VALID_DATE,
        path: ['date'],
      })
      return
    }

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

    if(ctx.value.orderEndDate) {
      const orderEndDate = new Date(ctx.value.orderEndDate)
      if (fromDateTime > orderEndDate || toDateTime > orderEndDate) {
        ctx.issues.push({
          code: 'custom',
          input: ctx.value,
          message: DATE_BETWEEN_ORDER,
          path: ['date'],
        })
        return
      }
    }

    ctx.value.fromDate = fromDateTime.toISOString()
    ctx.value.toDate = toDateTime.toISOString()

  })

function formatDate(date: string, hour: string, minute: string, second: string) {
  const dateDt = parse(date, 'dd/MM/yyyy', new Date())
  dateDt.setHours(parseInt(hour))
  dateDt.setMinutes(parseInt(minute))
  dateDt.setSeconds(parseInt(second))
  return dateDt
}

const createSubjectLocationsQueryDtoSchema = z.object({
  queryExecutionId: z.string(),
})

export {
  subjectLocationsQueryParametersSchema,
  subjectLocationsFormDataSchema,
  createSubjectLocationsQueryDtoSchema,
}