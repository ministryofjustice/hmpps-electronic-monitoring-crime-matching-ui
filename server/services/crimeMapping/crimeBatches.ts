import { asUser, RestClient, SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { z } from 'zod'
import { ValidationResult, ValidationResultModel } from '../../models/ValidationResult'
import Result from '../../types/result'

type CrimeBatch = {
  prisonName: string
}

type CrimeBatchesSearchResult = {
  data: Array<CrimeBatch>
}

const crimeBatchSearchResult = z.object({
  data: z.array(
    z.object({
      prisonName: z.string(),
    }),
  ),
})

const CreateCrimeBatchQueryDto = z.object({
  queryExecutionId: z.string(),
})

type CreateCrimeBatchQueryDto = {
  queryExecutionId: string
}

export default class CrimeBatchesService {
  constructor(private readonly crimeMatchingApiClient: RestClient) {}

  async createQuery(userToken: string, input: any): Promise<Result<CreateCrimeBatchQueryDto, ValidationResult>> {
    try {
      const response = await this.crimeMatchingApiClient.post(
        {
          path: '/crime-batches-query',
          data: input,
        },
        asUser(userToken),
      )

      return {
        ok: true,
        data: CreateCrimeBatchQueryDto.parse(response),
      }
    } catch (e) {
      const sanitisedError = e as SanitisedError

      if (sanitisedError.responseStatus === 400) {
        return {
          ok: false,
          error: ValidationResultModel.parse((e as SanitisedError).data),
        }
      }

      throw e
    }
  }

  async getQuery(userToken: string, queryId?: string): Promise<CrimeBatchesSearchResult> {
    if (queryId === undefined) {
      return {
        data: [],
      }
    }

    const response = await this.crimeMatchingApiClient.get(
      {
        path: `/crime-batches-query?id=${queryId}`,
      },
      asUser(userToken),
    )

    return crimeBatchSearchResult.parse(response)
  }
}
