import { PageElement } from '../../page'
import FormComponent from '../formComponent'
import FormDateComponent from '../formDateComponent'
import FormSelectComponent from '../formSelectComponent'

type FilterDatasetFormData = {
  from?: string
  policeForceArea?: string
  to?: string
}

export default class FilterDatasetFormComponent extends FormComponent {
  constructor() {
    super('filter-dataset-form')
  }
  // FIELDS

  get submitButton(): PageElement<HTMLButtonElement> {
    return this.form.contains('button', 'View data')
  }

  get fromField(): FormDateComponent {
    return new FormDateComponent(this.form, 'From')
  }

  get toField(): FormDateComponent {
    return new FormDateComponent(this.form, 'To')
  }

  get policeForceAreaField(): FormSelectComponent {
    return new FormSelectComponent(this.form, 'Police force area', [
      'Avon and Somerset',
      'Bedfordshire',
      'Cheshire',
      'City of London',
      'Cumbria',
      'Derbyshire',
      'Durham',
      'Essex',
      'Gloucestershire',
      'Gwent',
      'Hampshire',
      'Hertfordshire',
      'Humberside',
      'Kent',
      'Metropolitan',
      'North Wales',
      'Nottinghamshire',
      'Sussex',
      'West Midlands',
    ])
  }

  // HELPERS

  fillInWith = (data: FilterDatasetFormData): undefined => {
    if (data.from) {
      this.fromField.set(data.from)
    }

    if (data.policeForceArea) {
      this.policeForceAreaField.set(data.policeForceArea)
    }

    if (data.to) {
      this.toField.set(data.to)
    }
  }
}
