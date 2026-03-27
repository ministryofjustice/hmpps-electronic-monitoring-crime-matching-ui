import { PageElement } from '../../page'
import FormComponent from '../formComponent'

class ExportValidationErrorsFormComponent extends FormComponent {
  constructor() {
    super('export-validation-errors-form')
  }

  // FIELDS

  get exportButton(): PageElement {
    return this.form.contains('button', 'Export')
  }

  // HELPERS
}

export default ExportValidationErrorsFormComponent
