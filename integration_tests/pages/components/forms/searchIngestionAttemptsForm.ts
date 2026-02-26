import { PageElement } from '../../page'
import FormComponent from '../formComponent'
import FormDateComponent from '../formDateComponent'
import FormInputComponent from '../formInputComponent'
import FormSelectComponent from '../formSelectComponent'

type SearchIngestionAttemptsFormData = {
  batchId?: string
  policeForceArea?: string
  fromDate?: string
  toDate?: string
}

export default class SearchIngestionAttemptsFormComponent extends FormComponent {
  constructor() {
    super('search-ingestion-attempts-form')
  }
  // FIELDS

  get batchIdField(): FormInputComponent {
    return new FormInputComponent(this.form, 'Batch ID')
  }

  get policeForceAreaField(): FormSelectComponent {
    return new FormSelectComponent(this.form, 'Police force area', [])
  }

  get fromDateField(): FormDateComponent {
    return new FormDateComponent(this.form, 'Date from')
  }

  get toDateField(): FormDateComponent {
    return new FormDateComponent(this.form, 'Date to')
  }

  get searchButton(): PageElement {
    return this.form.contains('button', 'Search')
  }

  // HELPERS

  fillInWith = (data: SearchIngestionAttemptsFormData): undefined => {
    if (data.batchId) {
      this.batchIdField.set(data.batchId)
    }

    if (data.policeForceArea) {
      this.policeForceAreaField.set(data.policeForceArea)
    }

    if (data.fromDate) {
      this.fromDateField.set(data.fromDate)
    }

    if (data.toDate) {
      this.toDateField.set(data.toDate)
    }
  }
}
