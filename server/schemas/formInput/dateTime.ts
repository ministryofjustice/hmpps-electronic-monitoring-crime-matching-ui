import { z } from 'zod/v4'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

const VALID_DATE = 'You must enter a valid value for date'

const DateTimeInputModel = () => {
  return z
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
          path: ['date'],
        })
        return
      }

      const formattedDateTime = formatDate(ctx.value.date, ctx.value.hour, ctx.value.minute, ctx.value.second)

      if (!formattedDateTime.isValid()) {
        ctx.issues.push({
          code: 'custom',
          input: ctx.value,
          message: VALID_DATE,
          path: ['date'],
        })
      }
    })
    .transform(value => {
      return formatDate(value.date, value.hour, value.minute, value.second)
    })
}

function formatDate(date: string, hour: string, minute: string, second: string) {
  return dayjs(`${date} ${hour}:${minute}:${second}`, 'DD/MM/YYYY H:m:s', true)
}

export default DateTimeInputModel
