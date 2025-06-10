import { asUser, RestClient, SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { z } from 'zod'
import { ValidationResult, ValidationResultModel } from '../../models/ValidationResult'
import Result from '../../types/result'

type CrimeBatch = {
  policeForce: string
  batch: string
  start: string
  end: string
  time: number
  distance: number
  matches: number
}

type GetCrimeBatchesQueryDto = Array<CrimeBatch>

const getCrimeBatchesQueryDtoSchema = z.array(
  z.object({
    policeForce: z.string(),
    batch: z.string(),
    start: z.string(),
    end: z.string(),
    time: z.number(),
    distance: z.number(),
    matches: z.number(),
  }),
)

const createCrimeBatchesQueryDtoSchema = z.object({
  queryExecutionId: z.string(),
})

type CreateCrimeBatchesQueryDto = {
  queryExecutionId: string
}

export default class CrimeBatchesService {
  constructor(private readonly crimeMatchingApiClient: RestClient) {}

  async createQuery(userToken: string, input: any): Promise<Result<CreateCrimeBatchesQueryDto, ValidationResult>> {
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

  async getQuery(userToken: string, queryId?: string): Promise<GetCrimeBatchesQueryDto> {
    if (queryId === undefined) {
      return []
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
