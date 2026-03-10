import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import CrimeMatchingClient from '../data/crimeMatchingClient'
import CrimeVersionSummary from '../types/crimeVersionSummary'
import { PaginatedServiceResult } from '../types/service'
import { getCrimeVersionsDtoSchema } from '../schemas/proximityAlert/crimeSearch'

class CrimeService {
  constructor(private readonly crimeMatchingApiClient: CrimeMatchingClient) {}

  private parsePageNumber(page: string): string | undefined {
    const pageNumber = parseInt(page.trim(), 10)

    if (!Number.isNaN(pageNumber)) {
      // API is 0-indexed, UI is 1-indexed
      return (pageNumber - 1).toString()
    }

    return undefined
  }

  async getCrimeVersions(
    username: string,
    crimeReference: string | null,
    page: string,
  ): Promise<PaginatedServiceResult<CrimeVersionSummary>> {
    const parsedPageNumber = this.parsePageNumber(page)

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

    const response = await this.crimeMatchingApiClient.getCrimeVersions(
      asSystem(username),
      crimeReference,
      parsedPageNumber,
    )

    return Promise.resolve({
      ok: true,
      ...getCrimeVersionsDtoSchema.parse(response),
    })
  }
}

export default CrimeService
