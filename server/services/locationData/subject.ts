import { asUser, RestClient, SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { ZodError } from 'zod/v4'
import { ValidationResult, ValidationResultModel } from '../../models/ValidationResult'
import {
  CreateSubjectLocationsQueryRequestDto,
  CreateSubjectLocationsQueryResponseDto,
  GetSubjectLocationQueryResponseDto,
} from '../../types/locationData/subject'
import Result from '../../types/result'
import {
  createSubjectLocationsQueryDtoSchema,
  getSubjectLocationQueryDtoSchema,
  subjectLocationsFormDataSchema,
} from '../../schemas/locationData/subject'
import { convertZodErrorToValidationError } from '../../utils/errors'

export default class SubjectService {
  constructor(private readonly crimeMatchingApiClient: RestClient) {}

  async createQuery(
    userToken: string,
    input: CreateSubjectLocationsQueryRequestDto,
  ): Promise<Result<CreateSubjectLocationsQueryResponseDto, ValidationResult>> {
    try {
      const parsedFormData = subjectLocationsFormDataSchema.parse(input)
      const res = await this.crimeMatchingApiClient.post(
        {
          path: `/subject/location-query`,
          data: parsedFormData,
        },
        asUser(userToken),
      )

      return {
        ok: true,
        data: createSubjectLocationsQueryDtoSchema.parse(res),
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

  async getQuery(userToken: string, queryId?: string, page?: string): Promise<GetSubjectLocationQueryResponseDto> {
    if (queryId === undefined) {
      return {
        locations: [],
      }
    }

    const res = await this.crimeMatchingApiClient.get(
      {
        path: `/subject/location-query`,
        query: {
          id: queryId,
          page,
        },
      },
      asUser(userToken),
    )

    return getSubjectLocationQueryDtoSchema.parse(res)
  }
}
