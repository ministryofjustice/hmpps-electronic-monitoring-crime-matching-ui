import { stringify } from 'csv-stringify/sync'
import ValidationError from '../../types/validationError'

const headers = ['Crime reference', 'Error type', 'Required action']

const getRow = (validationError: ValidationError): Array<string> => {
  return [validationError.crimeReference, validationError.errorType, validationError.requiredAction]
}

const getRows = (validationErrors: Array<ValidationError>): Array<Array<string>> => {
  return validationErrors.map(getRow)
}

const generateValidationErrorsExport = (validationErrors: Array<ValidationError>): string => {
  return stringify([headers, ...getRows(validationErrors)])
}

export default generateValidationErrorsExport
