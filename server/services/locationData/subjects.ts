import { asUser, RestClient, SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { ZodError } from 'zod/v4'
import {
  CreateSubjectsQueryRequestDto,
  CreateSubjectsQueryResponseDto,
  GetSubjectsQueryResponseDto,
} from '../../types/locationData/subjects'
import Result from '../../types/result'
import { ValidationResult, ValidationResultModel } from '../../models/ValidationResult'
import {
  createSubjectsQueryDtoSchema,
  getSubjectsQueryDtoSchema,
  subjectsFormDataSchema,
} from '../../schemas/locationData/subjects'
import { convertZodErrorToValidationError } from '../../utils/errors'

export default class SubjectsService {
  constructor(private readonly crimeMatchingApiClient: RestClient) {}

  async createQuery(
    userToken: string,
    input: CreateSubjectsQueryRequestDto,
  ): Promise<Result<CreateSubjectsQueryResponseDto, ValidationResult>> {
    try {
      const parsedFormData = subjectsFormDataSchema.parse(input)
      const res = await this.crimeMatchingApiClient.post(
        {
          path: '/subjects-query',
          data: parsedFormData,
        },
        asUser(userToken),
      )

      return {
        ok: true,
        data: createSubjectsQueryDtoSchema.parse(res),
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          ok: false,
          error: convertZodErrorToValidationError(error),
        }
      }

      const sanitisedError = error as SanitisedError

      if (sanitisedError.responseStatus === 400) {
        return {
          ok: false,
          error: ValidationResultModel.parse((error as SanitisedError).data),
        }
      }
      throw error
    }
  }

  async getQuery(userToken: string, queryId?: string, page?: string): Promise<GetSubjectsQueryResponseDto> {
    if (queryId === undefined) {
      return {
        data: [],
        pageCount: 1,
        pageNumber: 1,
        pageSize: 10,
      }
    }

    const res = await this.crimeMatchingApiClient.get(
      {
        path: `/subjects-query`,
        query: {
          id: queryId,
          page,
        },
      },
      asUser(userToken),
    )

    return getSubjectsQueryDtoSchema.parse(res)
  }
}
