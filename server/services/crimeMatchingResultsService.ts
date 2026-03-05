import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import CrimeMatchingClient from '../data/crimeMatchingClient'
import { ServiceResult } from '../types/service'
import CrimeMatchingResult from '../types/crimeMatchingResult'
import getCrimeMatchingResultsDtoSchema from '../schemas/crimeMatching/crimeMatchingResults'

class CrimeMatchingResultsService {
  constructor(private readonly crimeMatchingApiClient: CrimeMatchingClient) {}

  async getCrimeMatchingResultsForBatches(
    username: string,
    batchIds: Array<string>,
  ): Promise<ServiceResult<Array<CrimeMatchingResult>>> {
    if (batchIds.length === 0) {
      return {
        ok: false,
        validationErrors: {
          batchIds: 'At least one batch must be selected for export.',
        },
      }
    }

    const response = await this.crimeMatchingApiClient.getCrimeMatchingResults(asSystem(username), batchIds)
    const parsedResponse = getCrimeMatchingResultsDtoSchema.parse(response)

    if (parsedResponse.data.length === 0) {
      return {
        ok: false,
        validationErrors: {},
        error: 'No results',
      }
    }

    return {
      ok: true,
      ...parsedResponse,
    }
  }
}

export default CrimeMatchingResultsService
