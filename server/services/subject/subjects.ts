import { asUser, RestClient, SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { ZodError } from 'zod'
import {
  CreateSubjectsQueryRequestDto,
  CreateSubjectsQueryResponseDto,
  GetSubjectsQueryResponseDto,
  Subject,
} from '../../types/subject/subjects'
import Result from '../../types/result'
import { ValidationResult, ValidationResultModel } from '../../models/ValidationResult'
import {
  createSubjectsQueryDtoSchema,
  getSubjectsQueryDtoSchema,
  subjectsFormDataSchema,
} from '../../schemas/subject/subject'
import { convertZodErrorToValidationError } from '../../utils/errors'

export default class SubjectService {
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

  async getQuery(userToken: string, queryId?: string): Promise<GetSubjectsQueryResponseDto> {
    if (queryId === undefined) {
      return []
    }

    const res = await this.crimeMatchingApiClient.get(
      {
        path: `/subjects-query?id=${queryId}`,
      },
      asUser(userToken),
    )

    return getSubjectsQueryDtoSchema.parse(res)
  }
}
