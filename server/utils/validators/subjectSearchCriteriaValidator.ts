import { ParsedSubjectSearchFormInput } from '../../models/subjectSearchFormInput'
import { ValidationResult } from '../../models/ValidationResult'

export default class SubjectSearchCriteriaValidator {
  static validateInput(data: ParsedSubjectSearchFormInput): ValidationResult {
    const validationErrors: ValidationResult = []

    const isEmpty = Object.values(data).every(value => value === '' || value === undefined)

    if (isEmpty) {
      validationErrors.push({
        field: 'emptyForm',
        message: 'You must enter a value for either Name or NOMIS ID',
      })
    }

    return validationErrors
  }
}
