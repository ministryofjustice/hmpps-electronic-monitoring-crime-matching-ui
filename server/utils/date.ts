import dayjs from 'dayjs'

const parseISODate = (dateString: string) => {
  return dayjs(dateString, ['YYYY-MM-DDTHH:mm:ss[Z]', 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'], true)
}

const isValidISODate = (dateString: string) => {
  return parseISODate(dateString).isValid()
}

const getDateComponents = (dateString: string) => {
  const d = parseISODate(dateString)

  if (d.isValid()) {
    return {
      date: d.format('DD/MM/YYYY'),
      hour: d.hour().toString().padStart(2, '0'),
      minute: d.minute().toString().padStart(2, '0'),
      second: d.second().toString().padStart(2, '0'),
    }
  }

  return {
    date: 'Invalid date',
    hour: '',
    minute: '',
    second: '',
  }
}

export { getDateComponents, parseISODate, isValidISODate }
