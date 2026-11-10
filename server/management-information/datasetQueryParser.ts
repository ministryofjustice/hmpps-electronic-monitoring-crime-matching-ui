import type { ParsedQs } from 'qs'
import type { DatasetFilter, DatasetQuery } from './dataset'
import type Result from '../types/result'
import { policeForceAreas } from '../data/policeForceAreas'

type QueryParam = ParsedQs[string]

type DatasetQueryErrors = Partial<Record<DatasetFilter, string>>

type DatasetQueryParseResult = Result<DatasetQuery, DatasetQueryErrors>

class DatasetQueryParser {
  parse(query: ParsedQs, enabledFilters: DatasetFilter[]): DatasetQueryParseResult {
    const parsedQuery: DatasetQuery = {}
    const errors: DatasetQueryErrors = {}

    if (enabledFilters.includes('from') && query.from !== undefined) {
      const result = this.parseFrom(query.from)

      if (result.ok) {
        if (result.data) {
          parsedQuery.from = result.data
        }
      } else {
        errors.from = result.error
      }
    }

    if (enabledFilters.includes('to') && query.to !== undefined) {
      const result = this.parseTo(query.to)

      if (result.ok) {
        if (result.data) {
          parsedQuery.to = result.data
        }
      } else {
        errors.to = result.error
      }
    }

    if (enabledFilters.includes('policeForceArea') && query.policeForceArea !== undefined) {
      const result = this.parsePoliceForceArea(query.policeForceArea)

      if (result.ok) {
        if (result.data) {
          parsedQuery.policeForceArea = result.data
        }
      } else {
        errors.policeForceArea = result.error
      }
    }

    if (parsedQuery.from && parsedQuery.to && parsedQuery.from > parsedQuery.to) {
      errors.to = 'To date must be on or after from date'
    }

    if (query.page !== undefined) {
      const result = this.parsePage(query.page)

      if (result.ok) {
        parsedQuery.page = result.data
      }
    }

    return Object.keys(errors).length === 0 ? { data: parsedQuery, ok: true } : { error: errors, ok: false }
  }

  private parseFrom(value: QueryParam): Result<string, string> {
    return this.parseDate(value, 'Enter a valid from date')
  }

  private parseTo(value: QueryParam): Result<string, string> {
    const result = this.parseDate(value, 'Enter a valid to date')

    if (!result.ok || !result.data) {
      return result
    }

    const nextDay = new Date(result.data)
    nextDay.setUTCDate(nextDay.getUTCDate() + 1)

    return {
      ok: true,
      data: nextDay.toISOString(),
    }
  }

  private parseDate(value: QueryParam, errorMessage: string): Result<string, string> {
    if (value === '') {
      return { ok: true, data: '' }
    }

    if (typeof value !== 'string') {
      return { ok: false, error: errorMessage }
    }

    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)

    if (!match) {
      return { ok: false, error: errorMessage }
    }

    const [, day, month, year] = match
    const isoDate = `${year}-${month}-${day}T00:00:00.000Z`
    const date = new Date(`${isoDate}`)

    if (
      Number.isNaN(date.getTime()) ||
      date.getUTCFullYear() !== Number(year) ||
      date.getUTCMonth() + 1 !== Number(month) ||
      date.getUTCDate() !== Number(day)
    ) {
      return { ok: false, error: errorMessage }
    }

    return { ok: true, data: isoDate }
  }

  private parsePoliceForceArea(value: QueryParam): Result<string, string> {
    if (value === '') {
      return { ok: true, data: '' }
    }

    if (typeof value !== 'string') {
      return {
        ok: false,
        error: 'Select a valid police force area',
      }
    }

    if (!policeForceAreas.has(value)) {
      return {
        ok: false,
        error: 'Select a valid police force area',
      }
    }

    return { ok: true, data: value }
  }

  private parsePage(value: QueryParam): Result<number, string> {
    if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
      return { ok: false, error: 'Invalid page number' }
    }

    const page = Number(value)

    if (!Number.isSafeInteger(page)) {
      return { ok: false, error: 'Invalid page number' }
    }

    return { ok: true, data: page - 1 }
  }
}

export type { DatasetQueryErrors, DatasetQueryParseResult }
export default DatasetQueryParser
