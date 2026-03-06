import CrimeSummary from '../types/crimeSummary'
import Result from '../types/result'
import { PaginatedServiceResult } from '../types/service'

class CrimeService {
  constructor() {}

  private parseCrimeReference(crimeReference: string | null): Result<string, string> {
    if (crimeReference === null) {
      return { ok: true, data: '' }
    }

    if (crimeReference.trim().length === 0) {
      return { ok: false, error: 'Enter a crime number.' }
    }

    return { ok: true, data: crimeReference }
  }

  async getCrimes(crimeReference: string | null): Promise<PaginatedServiceResult<CrimeSummary>> {
    const parsedCrimeRef = this.parseCrimeReference(crimeReference)

    if (!parsedCrimeRef.ok) {
      return {
        ok: false,
        validationErrors: {
          crimeReference: parsedCrimeRef.error,
        },
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

export default CrimeService
