import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import CrimeMatchingClient from '../data/crimeMatchingClient'
import { ServiceResult } from '../types/service'

type CrimeMatchingResult = {}

class CrimeMatchingResultsService {
  constructor(private readonly crimeMatchingApiClient: CrimeMatchingClient) {}

  async getCrimeMatchingResultsForBatches(
    username: string,
    batchIds: Array<string>,
  ): Promise<ServiceResult<Array<CrimeMatchingResult>>> {
    return {
      ok: true,
      data: [],
    }
  }
}

export default CrimeMatchingResultsService
