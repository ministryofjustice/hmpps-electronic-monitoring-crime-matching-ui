import dayjs, { Dayjs } from 'dayjs'

const parseDateTimeFromComponents = (date: string, hour: string, minute: string, second: string) => {
  return dayjs(`${date} ${hour}:${minute}:${second}`, ['D/M/YYYY H:m:s', 'DD/MM/YYYY H:m:s'], true).tz('Europe/London')
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
