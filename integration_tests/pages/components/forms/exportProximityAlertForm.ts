import { PageElement } from '../../page'
import FormComponent from '../formComponent'
import FormRadiosComponent from '../formRadiosComponent'

type ExportProximityAlertFormData = {
  authorisingManager: string
}

class ExportProximityAlertFormComponent extends FormComponent {
  constructor() {
    super('exportProximityAlertForm')
  }

  // FIELDS

  get authorisingManagerField(): FormRadiosComponent {
    return new FormRadiosComponent(this.form, 'Assign to authorising manager')
  }

  get exportButton(): PageElement<HTMLButtonElement> {
    return this.form.contains('button[type=submit]', 'Export')
  }

  // HELPERS

  fillInWith(data: ExportProximityAlertFormData) {
    if (data.authorisingManager) {
      this.authorisingManagerField.set(data.authorisingManager)
    }
  }
}

export default ExportProximityAlertFormComponent
