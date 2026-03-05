import CrimeSummary from '../types/crimeSummary'
import { PaginatedServiceResult } from '../types/service'

class CrimeService {
  constructor() {}

  async getCrimes(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    crimeReference: string,
  ): Promise<PaginatedServiceResult<CrimeSummary>> {
    return Promise.resolve({
      ok: true,
      data: [],
      pageCount: 1,
      pageNumber: 1,
      pageSize: 0,
    })
  }
}

export default CrimeService
