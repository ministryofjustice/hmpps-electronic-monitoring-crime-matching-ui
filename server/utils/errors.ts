import { ValidationError } from '../models/ValidationResult'
import { GovUkErrorMessage } from '../types/govUk'

const createGovUkErrorMessage = (error: ValidationError): GovUkErrorMessage => ({
  text: error.message,
})

export { createGovUkErrorMessage }
