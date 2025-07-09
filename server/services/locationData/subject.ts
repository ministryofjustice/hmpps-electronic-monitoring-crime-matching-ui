import { asUser, RestClient, SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { ZodError } from 'zod/v4'
import {
  CreateSubjectLocationsQueryRequestDto,
  CreateSubjectLocationsQueryResponseDto,
  GetSubjectDto,
} from '../../types/locationData/subject'
import Result from '../../types/result'
import {
  createSubjectLocationsQueryDtoSchema,
  getSubjectDtoSchema,
  subjectLocationsFormDataSchema,
} from '../../schemas/locationData/subject'
import { convertZodErrorToValidationError } from '../../utils/errors'
import { ValidationResult, ValidationResultModel } from '../../models/ValidationResult'

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

  async getLocationData(userToken: string, personId?: string, from?: string, to?: string): Promise<GetSubjectDto> {
    if (personId === undefined) {
      return {
        locations: [],
      }
    }

    const res = await this.crimeMatchingApiClient.get(
      {
        path: `/subjects/${personId}`,
        query: {
          from,
          to,
        },
      },
      asUser(userToken),
    )

    return getSubjectDtoSchema.parse(res)
  }
}
