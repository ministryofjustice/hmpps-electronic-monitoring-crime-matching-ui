import { PageElement } from '../../page'
import FormComponent from '../formComponent'
import FormRadiosComponent from '../formRadiosComponent'

type ExportLocationDataFormData = {
  reportType: 'condensed' | 'full'
}

class ExportLocationDataFormComponent extends FormComponent {
  constructor() {
    super('exportLocationDataForm')
  }

  // FIELDS

  get reportTypeField(): FormRadiosComponent {
    return new FormRadiosComponent(this.form, 'Export trail data')
  }

  get exportButton(): PageElement {
    return this.form.contains('button', 'Export')
  }

  // HELPERS

  fillInWith(data: ExportLocationDataFormData) {
    if (data.reportType) {
      this.reportTypeField.set(data.reportType)
    }
  }
}

export default ExportLocationDataFormComponent
