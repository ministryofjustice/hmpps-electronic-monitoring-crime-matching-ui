import { asUser, RestClient, SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { ValidationResult, ValidationResultModel } from '../../models/ValidationResult'
import Result from '../../types/result'
import {
  createCrimeBatchesQueryDtoSchema,
  getCrimeBatchesQueryDtoSchema,
} from '../../schemas/crimeMapping/crimeBatches'
import {
  CreateCrimeBatchesQueryRequestDto,
  CreateCrimeBatchesQueryResponseDto,
  GetCrimeBatchesQueryResponseDto,
} from '../../types/crimeMapping/crimeBatches'

export default class CrimeBatchesService {
  constructor(private readonly crimeMatchingApiClient: RestClient) {}

  async createQuery(
    userToken: string,
    input: CreateCrimeBatchesQueryRequestDto,
  ): Promise<Result<CreateCrimeBatchesQueryResponseDto, ValidationResult>> {
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
        data: createCrimeBatchesQueryDtoSchema.parse(response),
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

  async getQuery(userToken: string, queryId?: string): Promise<GetCrimeBatchesQueryResponseDto> {
    if (queryId === undefined) {
      return {
        data: [],
        pageCount: 1,
        pageNumber: 1,
        pageSize: 10,
      }
    }

    const response = await this.crimeMatchingApiClient.get(
      {
        path: `/crime-batches-query?id=${queryId}`,
      },
      asUser(userToken),
    )

    return getCrimeBatchesQueryDtoSchema.parse(response)
  }
}
