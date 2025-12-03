import { PageElement } from '../../page'
import FormComponent from '../formComponent'
import FormDateTimeComponent, { FormDateTimeData } from '../formDateTimeComponent'

type SearchDeviceActivationPositionsFormData = {
  fromDate?: FormDateTimeData
  toDate?: FormDateTimeData
}

export default class SearchDeviceActivationPositionsFormComponent extends FormComponent {
  constructor() {
    super('dateFilterForm')
  }

  // FIELDS

  get fromDateField(): FormDateTimeComponent {
    return new FormDateTimeComponent(this.form, '#from-date', 'fromDate', 'Date from')
  }

  get toDateField(): FormDateTimeComponent {
    return new FormDateTimeComponent(this.form, '#to-date', 'toDate', 'Date to')
  }

  get continueButton(): PageElement {
    return this.form.contains('button', 'Apply')
  }

  get resetButton(): PageElement {
    return this.form.contains('button', 'Reset')
  }

  // HELPERS

  fillInWith(data: SearchDeviceActivationPositionsFormData) {
    if (data.fromDate) {
      this.fromDateField.set(data.fromDate)
    }

    if (data.toDate) {
      this.toDateField.set(data.toDate)
    }
  }
}
