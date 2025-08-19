import { z } from 'zod/v4'
import dayjs from 'dayjs'

const VALID_DATE = 'You must enter a valid value for date'

const DateTimeInputModel = z
  .object({
    date: z.string(),
    hour: z.string(),
    minute: z.string(),
    second: z.string(),
  })
  .check(ctx => {
    if (Object.values(ctx.value).some(value => value === '' || value === undefined)) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
        message: VALID_DATE,
        path: [],
      })
      return
    }

    const formattedDateTime = formatDate(ctx.value.date, ctx.value.hour, ctx.value.minute, ctx.value.second)

    if (!formattedDateTime.isValid()) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
        message: VALID_DATE,
        path: [],
      })
    }
  })
  .transform(value => {
    return formatDate(value.date, value.hour, value.minute, value.second)
  })

function formatDate(date: string, hour: string, minute: string, second: string) {
  return dayjs(`${date} ${hour}:${minute}:${second}`, ['D/M/YYYY H:m:s', 'DD/MM/YYYY H:m:s'], true).tz('Europe/London')
}

export default DateTimeInputModel
