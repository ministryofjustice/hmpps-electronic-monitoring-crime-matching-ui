import { PageElement } from '../../page'
import FormComponent from '../formComponent'
import FormDateTimeComponent, { FormDateTimeData } from '../formDateTimeComponent'

type SearchDeviceActivationPositionsFormData = {
  fromDate?: FormDateTimeData
  toDate?: FormDateTimeData
}

export default class SearchDeviceActivationPositionsFormComponent extends FormComponent {
  // FIELDS

  get fromDateField(): FormDateTimeComponent {
    return new FormDateTimeComponent(this.form, '#from-date', 'Date from')
  }

  get toDateField(): FormDateTimeComponent {
    return new FormDateTimeComponent(this.form, '#to-date', 'Date to')
  }

  get continueButton(): PageElement {
    return this.form.contains('button', 'Continue')
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
