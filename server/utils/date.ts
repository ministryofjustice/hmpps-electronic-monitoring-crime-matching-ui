import dayjs, { Dayjs } from 'dayjs'

const parseDateTimeFromComponents = (date: string, hour: string, minute: string, second?: string) => {
  const dateTimeString = second ? `${date} ${hour}:${minute}:${second}` : `${date} ${hour}:${minute}`

  const formats = [
    'D/M/YYYY H:m',
    'DD/MM/YYYY H:m',
    'D/M/YYYY HH:mm',
    'DD/MM/YYYY HH:mm',
    'D/M/YYYY H:m:s',
    'DD/MM/YYYY H:m:s',
    'D/M/YYYY HH:mm:ss',
    'DD/MM/YYYY HH:mm:ss',
  ]
  const validationDate = dayjs(dateTimeString, formats, true)

  if (!validationDate.isValid()) {
    return dayjs(null)
  }

  return dayjs.tz(dateTimeString, second ? 'D/M/YYYY H:m:s' : 'D/M/YYYY H:m', 'Europe/London')
}

const parseDateTimeFromISOString = (dateString: string) => {
  return dayjs(dateString)
}

const getDateComponents = (date: Dayjs) => {
  if (date.isValid()) {
    const londonDate = date.tz('Europe/London')
    return {
      date: londonDate.format('DD/MM/YYYY'),
      hour: londonDate.format('HH'),
      minute: londonDate.format('mm'),
      second: londonDate.format('ss'),
    }
  }

  return {
    date: 'Invalid date',
    hour: '',
    minute: '',
    second: '',
  }
}

const formatDateTime = (dateString: string | null | undefined, format: string): string => {
  if (!dateString) {
    return ''
  }

  const date = dayjs(dateString)

  if (!date.isValid()) {
    return ''
  }

  return date.format(format)
}

export { parseDateTimeFromComponents, parseDateTimeFromISOString, getDateComponents, formatDateTime }
