import { convertToTitleCase, formatDate, initialiseName } from './utils'

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

describe('formatDate', () => {
  it.each([
    ['Undefined', undefined, ''],
    ['Null', null, ''],
    ['Empty string', '', ''],
    ['Invalid date', 'foo', ''],
    ['GMT', '2025-02-01T00:00:00.000Z', '01/02/2025 00:00'],
    ['BST', '2025-08-01T12:15:00.000Z', '01/08/2025 13:15'],
  ])('%s formatDate(%s)', (_: string, datetime: string | undefined | null, expected: string) => {
    expect(formatDate(datetime)).toEqual(expected)
  })
})
