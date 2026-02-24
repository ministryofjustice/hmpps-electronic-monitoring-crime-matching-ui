import IngestionAttemptSummary from '../types/ingestionAttemptSummary'
import PaginatedServiceResult from '../types/service'

class PoliceDataService {
  constructor() {}

  async getIngestionAttemptSummaries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    batchId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    policeForceArea: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fromDate: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toDate: string,
  ): Promise<PaginatedServiceResult<IngestionAttemptSummary>> {
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
