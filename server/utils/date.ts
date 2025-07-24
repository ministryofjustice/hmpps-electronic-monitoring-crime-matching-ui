import dayjs from 'dayjs'
import { date } from 'zod/v4'

const parseISODate = (dateString: string) => {
  return dayjs(dateString, 'YYYY-MM-DDTHH:mm:ss[Z]', true)
}

const isValidISODate = (dateString: string) => {
  return parseISODate(dateString).isValid()
}

const getDateComponents = (dateString: string) => {
  const d = parseISODate(dateString)

  return {
    date: d.format('DD/MM/YYYY'),
    hour: d.hour().toString().padStart(2, '0'),
    minute: d.minute().toString().padStart(2, '0'),
    second: d.second().toString().padStart(2, '0'),
  }
}

export { getDateComponents }
