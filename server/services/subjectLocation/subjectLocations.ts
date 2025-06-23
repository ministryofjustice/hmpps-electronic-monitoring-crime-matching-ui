import { asUser, RestClient, SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { ValidationResult, ValidationResultModel } from '../../models/ValidationResult'
import { CreateSubjectLocationsQueryRequestDto, CreateSubjectLocationsQueryResponseDto } from '../../types/subjectLocation/subjectLocations'
import Result from '../../types/result'
import { createSubjectLocationsQueryDtoSchema, subjectLocationsFormDataSchema } from '../../schemas/subjectLocation/subjectLocations'
import { ZodError } from 'zod/v4'
import { convertZodErrorToValidationError } from '../../utils/errors'

export default class SubjectLocationService {
  constructor(private readonly crimeMatchingApiClient: RestClient) {}

  async createQuery(
    userToken: string,
    input: CreateSubjectLocationsQueryRequestDto,
  ): Promise<Result<CreateSubjectLocationsQueryResponseDto, ValidationResult>> {
    try {
      const parsedFormData = subjectLocationsFormDataSchema.parse(input)
      const res = await this.crimeMatchingApiClient.post(
        {
          path: `/subjects/${input.nomisId}/locations-query/`,
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
}
