import { PageElement } from '../../page'
import FormComponent from '../formComponent'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ExportProximityAlertFormDate = {}

class ExportProximityAlertFormComponent extends FormComponent {
  constructor() {
    super('exportProximityAlertForm')
  }

  // FIELDS

  get exportButton(): PageElement {
    return this.form.contains('button', 'Export proximity alert')
  }

  // HELPERS

  // eslint-disable-next-line no-empty-function, @typescript-eslint/no-unused-vars
  fillInWith(data: ExportProximityAlertFormDate) {}
}

export default ExportProximityAlertFormComponent
