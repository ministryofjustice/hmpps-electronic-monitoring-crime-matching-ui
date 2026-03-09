import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import CrimeMatchingClient from '../data/crimeMatchingClient'
import CrimeVersionSummary from '../types/crimeVersionSummary'
import { PaginatedServiceResult } from '../types/service'
import { getCrimeVersionsDtoSchema } from '../schemas/proximityAlert/crimeSearch'

class CrimeService {
  constructor(private readonly crimeMatchingApiClient: CrimeMatchingClient) {}

  async getCrimeVersions(
    username: string,
    crimeReference: string | null,
  ): Promise<PaginatedServiceResult<CrimeVersionSummary>> {
    if (crimeReference === null) {
      return {
        ok: true,
        data: [],
        pageCount: 1,
        pageNumber: 0,
        pageSize: 0,
      }
    }

    if (crimeReference.trim().length === 0) {
      return {
        ok: false,
        validationErrors: {
          crimeReference: 'Enter a crime number.',
        },
      }
    }

    const response = await this.crimeMatchingApiClient.getCrimeVersions(asSystem(username), crimeReference)

    return Promise.resolve({
      ok: true,
      ...getCrimeVersionsDtoSchema.parse(response),
    })
  }
}

export default CrimeService
