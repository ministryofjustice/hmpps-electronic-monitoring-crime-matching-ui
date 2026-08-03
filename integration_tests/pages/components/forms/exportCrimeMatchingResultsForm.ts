import { PageElement } from '../../page'
import FormComponent from '../formComponent'

class ExportCrimeMatchingResultsFormComponent extends FormComponent {
  constructor() {
    super('export-crime-matching-results-form')
  }

  // FIELDS

  get exportButton(): PageElement<HTMLButtonElement> {
    return this.form.contains('button', 'Export')
  }

  // HELPERS
}

export default ExportCrimeMatchingResultsFormComponent
