import dayjs, { Dayjs } from 'dayjs'

const parseDateTimeFromComponents = (date: string, hour: string, minute: string, second: string) => {
  const dateTimeString = `${date} ${hour}:${minute}:${second}`
  const formats = ['D/M/YYYY H:m:s', 'DD/MM/YYYY H:m:s', 'D/M/YYYY HH:mm:ss', 'DD/MM/YYYY HH:mm:ss']

  const validationDate = dayjs(dateTimeString, formats, true)

  if (!validationDate.isValid()) {
    return dayjs(null)
  }

  return dayjs.tz(dateTimeString, 'D/M/YYYY H:m:s', 'Europe/London')
}

const parseDateTimeFromISOString = (dateString: string) => {
  return dayjs(dateString, ['YYYY-MM-DDTHH:mm:ss[Z]', 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'], true)
}

const getDateComponents = (date: Dayjs) => {
  if (date.isValid()) {
    return {
      date: date.format('DD/MM/YYYY'),
      hour: date.hour().toString().padStart(2, '0'),
      minute: date.minute().toString().padStart(2, '0'),
      second: date.second().toString().padStart(2, '0'),
    }
  }

  return {
    date: 'Invalid date',
    hour: '',
    minute: '',
    second: '',
  }
}

export { parseDateTimeFromComponents, parseDateTimeFromISOString, getDateComponents }
