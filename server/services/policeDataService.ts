import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import CrimeMatchingClient from '../data/crimeMatchingClient'
import policeForceAreas from '../data/policeForceAreas'
import IngestionAttemptSummary from '../types/ingestionAttemptSummary'
import PaginatedServiceResult from '../types/service'
import { parseDateTimeFromComponents } from '../utils/date'
import { getIngestionAttemptDtoSchema } from '../schemas/policeData/dashboard'
import Result from '../types/result'

class PoliceDataService {
  constructor(private readonly crimeMatchingApiClient: CrimeMatchingClient) {}

  private parsePoliceForceArea(policeForceArea: string): Result<string, string> {
    const area = policeForceArea.trim()

    if (area.length === 0 || policeForceAreas.has(area)) {
      return { ok: true, data: area }
    }

    return { ok: false, error: 'Please select a valid police force area.' }
  }

  private parseDateToISOString(dateString: string): Result<string, string> {
    const trimmed = dateString.trim()

    if (trimmed.length === 0) {
      return { ok: true, data: trimmed }
    }

    const date = parseDateTimeFromComponents(trimmed, '0', '0')

    if (date.isValid()) {
      return { ok: true, data: date.toISOString() }
    }

    return { ok: false, error: 'Please enter a valid date.' }
  }

  async getIngestionAttemptSummaries(
    username: string,
    batchId: string,
    policeForceArea: string,
    fromDate: string,
    toDate: string,
  ): Promise<PaginatedServiceResult<IngestionAttemptSummary>> {
    const validationErrors: Record<string, string> = {}
    const parsedBatchId = batchId.trim()
    const parsedPoliceForceArea = this.parsePoliceForceArea(policeForceArea)
    const parsedFromDate = this.parseDateToISOString(fromDate)
    const parsedToDate = this.parseDateToISOString(toDate)

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
      parsedBatchId,
      parsedPoliceForceArea.ok ? parsedPoliceForceArea.data : '',
      parsedFromDate.ok ? parsedFromDate.data : '',
      parsedToDate.ok ? parsedToDate.data : '',
    )

    return {
      ok: true,
      ...getIngestionAttemptDtoSchema.parse(response),
    }
  }
}

export default PoliceDataService
