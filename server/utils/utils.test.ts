import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { convertToTitleCase, initialiseName } from './utils'
import { formatDateTime } from './date'

dayjs.extend(utc)
dayjs.extend(timezone)

describe('convert to title case', () => {
  it.each([
    ['empty string', '', ''],
    ['Lower case', 'robert', 'Robert'],
    ['Upper case', 'ROBERT', 'Robert'],
    ['Mixed case', 'RoBErT', 'Robert'],
    ['Multiple words', 'RobeRT SMiTH', 'Robert Smith'],
    ['Leading spaces', '  RobeRT', '  Robert'],
    ['Trailing spaces', 'RobeRT  ', 'Robert  '],
    ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
  ])('%s convertToTitleCase(%s, %s)', (_: string, a: string, expected: string) => {
    expect(convertToTitleCase(a)).toEqual(expected)
  })
})

describe('initialise name', () => {
  it.each([
    [undefined, undefined, null],
    ['Empty string', '', null],
    ['One word', 'robert', 'r. robert'],
    ['Two words', 'Robert James', 'R. James'],
    ['Three words', 'Robert James Smith', 'R. Smith'],
    ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
  ])('%s initialiseName(%s, %s)', (_: string | undefined, a: string | undefined, expected: string | null) => {
    expect(initialiseName(a)).toEqual(expected)
  })
})

describe('formatDateTime', () => {
  it.each([
    ['Undefined', undefined, 'DD/MM/YYYY HH:mm', ''],
    ['Null', null, 'DD/MM/YYYY HH:mm', ''],
    ['Empty string', '', 'DD/MM/YYYY HH:mm', ''],
    ['Invalid date', 'foo', 'DD/MM/YYYY HH:mm', ''],
    ['GMT', '2025-02-01T00:00:00.000Z', 'DD/MM/YYYY HH:mm', '01/02/2025 00:00'],
    ['BST', '2025-08-01T12:15:00.000Z', 'DD/MM/YYYY HH:mm', '01/08/2025 13:15'],
    ['ISO date only', '2000-12-01', 'DD/MM/YYYY', '01/12/2000'],
    ['Midnight UTC (date of birth stored as timestamp)', '2000-12-01T00:00:00.000Z', 'DD/MM/YYYY', '01/12/2000'],
    ['Midnight UTC during BST', '2000-08-01T00:00:00.000Z', 'DD/MM/YYYY', '01/08/2000'],
  ])('%s formatDateTime(%s)', (_: string, datetime: string | undefined | null, format: string, expected: string) => {
    expect(formatDateTime(datetime, format)).toEqual(expected)
  })
})
