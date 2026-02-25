import policeForceAreas from '../data/policeForceAreas'
import IngestionAttemptSummary from '../types/ingestionAttemptSummary'
import PaginatedServiceResult from '../types/service'
import { parseDateTimeFromComponents } from '../utils/date'

class PoliceDataService {
  constructor() {}

  private isValidPoliceForceArea(policeForceArea: string) {
    const area = policeForceArea.trim()

    if (area) {
      return policeForceAreas.has(area)
    }

    return true
  }

  private isValidDate(dateString: string) {
    const date = dateString.trim()

    if (date) {
      return parseDateTimeFromComponents(date, '0', '0').isValid()
    }

    return true
  }

  async getIngestionAttemptSummaries(
    batchId: string,
    policeForceArea: string,
    fromDate: string,
    toDate: string,
  ): Promise<PaginatedServiceResult<IngestionAttemptSummary>> {
    const validationErrors: Record<string, string> = {}

    if (!this.isValidPoliceForceArea(policeForceArea)) {
      validationErrors.policeForceArea = 'Please select a valid police force area.'
    }

    if (!this.isValidDate(fromDate)) {
      validationErrors.fromDate = 'Please enter a valid date.'
    }

    if (!this.isValidDate(toDate)) {
      validationErrors.toDate = 'Please enter a valid date.'
    }

    if (Object.keys(validationErrors).length > 0) {
      return {
        ok: false,
        validationErrors,
      }
    }

    return Promise.resolve({
      ok: true,
      data: [],
      pageCount: 1,
      pageNumber: 1,
      pageSize: 0,
    })
  }
}

export default PoliceDataService
