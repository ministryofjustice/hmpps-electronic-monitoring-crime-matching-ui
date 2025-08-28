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

const formatDate = (datetime?: string | null): string => {
  if (!datetime) {
    return ''
  }

  const date = dayjs(datetime)

  if (!date.isValid()) {
    return ''
  }

  return date.tz('Europe/London').format('DD/MM/YYYY HH:mm')
}

export { parseDateTimeFromComponents, parseDateTimeFromISOString, getDateComponents, formatDate }
