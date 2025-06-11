import { ValidationError } from '../models/ValidationResult'
import { GovUkErrorMessage } from '../types/govUk'

const createGovUkErrorMessage = (error: ValidationError): GovUkErrorMessage => ({
  text: error.message,
})

// eslint-disable-next-line import/prefer-default-export
export { createGovUkErrorMessage }
