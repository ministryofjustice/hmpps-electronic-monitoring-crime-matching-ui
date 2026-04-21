import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import CrimeMatchingClient from '../data/crimeMatchingClient'
import CrimeVersionSummary from '../types/crimeVersionSummary'
import { CrimeVersion } from '../types/crimeVersion'
import { PaginatedServiceResult, ServiceResult } from '../types/service'
import { getCrimeVersionsDtoSchema } from '../schemas/proximityAlert/crimeSearch'
import getCrimeVersionDtoSchema from '../schemas/proximityAlert/crimeVersion'

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

  async getCrimeVersion(username: string, crimeVersionId: string): Promise<ServiceResult<CrimeVersion>> {
    const response = await this.crimeMatchingApiClient.getCrimeVersion(asSystem(username), crimeVersionId)

    return {
      ok: true,
      data: getCrimeVersionDtoSchema.parse(response).data,
    }
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
          crimeReference: 'Enter a crime reference.',
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
