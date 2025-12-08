import { z } from 'zod/v4'
import { parseDateTimeFromComponents } from '../../utils/date'

const VALID_DATE = 'You must enter a valid value for date'

const DateTimeInputModel = z
  .object({
    date: z.string(),
    hour: z.string(),
    minute: z.string(),
    second: z.string().optional().default('00'),
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

    const formattedDateTime = parseDateTimeFromComponents(
      ctx.value.date,
      ctx.value.hour,
      ctx.value.minute,
      ctx.value.second ?? '00',
    )

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
    return parseDateTimeFromComponents(value.date, value.hour, value.minute, value.second)
  })

export default DateTimeInputModel
