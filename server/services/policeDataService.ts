import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import CrimeMatchingClient from '../data/crimeMatchingClient'
import policeForceAreas from '../data/policeForceAreas'
import IngestionAttemptSummary from '../types/ingestionAttemptSummary'
import { PaginatedServiceResult } from '../types/service'
import { parseDateTimeFromComponents } from '../utils/date'
import { getIngestionAttemptDtoSchema } from '../schemas/policeData/dashboard'
import Result from '../types/result'

class PoliceDataService {
  constructor(private readonly crimeMatchingApiClient: CrimeMatchingClient) {}

  private parsePageNumber(page: string): string | undefined {
    const pageNumber = parseInt(page.trim(), 10)

    if (!Number.isNaN(pageNumber)) {
      // API is 0-indexed, UI is 1-indexed
      return (pageNumber - 1).toString()
    }

    return undefined
  }

  private parsePoliceForceArea(policeForceArea: string): Result<string, string> {
    const area = policeForceArea.trim()

    if (area.length === 0 || policeForceAreas.has(area)) {
      return { ok: true, data: area }
    }

    return { ok: false, error: 'Please select a valid police force area.' }
  }

  private parseDateToLocalString(
    dateString: string,
    hour: string,
    minute: string,
    second: string,
  ): Result<string, string> {
    const trimmed = dateString.trim()

    if (trimmed.length === 0) {
      return { ok: true, data: trimmed }
    }

    const date = parseDateTimeFromComponents(trimmed, hour, minute, second)

    if (date.isValid()) {
      return { ok: true, data: date.format('YYYY-MM-DDTHH:mm:ss') }
    }

    return { ok: false, error: 'Please enter a valid date.' }
  }

  async getIngestionAttemptSummaries(
    username: string,
    batchId: string,
    policeForceArea: string,
    fromDate: string,
    toDate: string,
    page: string,
  ): Promise<PaginatedServiceResult<IngestionAttemptSummary>> {
    const validationErrors: Record<string, string> = {}
    const parsedBatchId = batchId.trim()
    const parsedPoliceForceArea = this.parsePoliceForceArea(policeForceArea)
    const parsedFromDate = this.parseDateToLocalString(fromDate, '0', '0', '0')
    const parsedToDate = this.parseDateToLocalString(toDate, '23', '59', '59')
    const parsedPageNumber = this.parsePageNumber(page)

    if (!parsedPoliceForceArea.ok) {
      validationErrors.policeForceArea = parsedPoliceForceArea.error
    }

    if (!parsedFromDate.ok) {
      validationErrors.fromDate = parsedFromDate.error
    }

    if (!parsedToDate.ok) {
      validationErrors.toDate = parsedToDate.error
    }

    if (Object.keys(validationErrors).length > 0) {
      return {
        ok: false,
        validationErrors,
      }
    }

    const response = await this.crimeMatchingApiClient.getIngestionAttempts(
      asSystem(username),
      parsedBatchId || undefined,
      parsedPoliceForceArea.ok ? parsedPoliceForceArea.data || undefined : undefined,
      parsedFromDate.ok ? parsedFromDate.data || undefined : undefined,
      parsedToDate.ok ? parsedToDate.data || undefined : undefined,
      parsedPageNumber,
    )

    return {
      ok: true,
      ...getIngestionAttemptDtoSchema.parse(response),
    }
  }
}

export default PoliceDataService
