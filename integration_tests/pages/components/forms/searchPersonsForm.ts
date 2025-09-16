import { PageElement } from '../../page'
import FormComponent from '../formComponent'
import FormRadiosComponent from '../formRadiosComponent'

type SearchPersonsFormData = {
  nomisId?: string
  name?: string
  deviceId?: string
}

export default class SearchPersonsFormComponent extends FormComponent {
  constructor() {
    super('person-search-form')
  }
  // FIELDS

  get searchButton(): PageElement {
    return this.form.contains('button', 'Search')
  }

  get personsSearchField(): FormRadiosComponent {
    return new FormRadiosComponent(this.form, 'Search')
  }

  // HELPERS

  fillInWith = (data: SearchPersonsFormData): undefined => {
    if (data.nomisId) {
      this.personsSearchField.set('nomisId')
      this.personsSearchField.setInputField('nomisId', data.nomisId)
    }
    if (data.name) {
      this.personsSearchField.set('name')
      this.personsSearchField.setInputField('name', data.name)
    }
    if (data.deviceId) {
      this.personsSearchField.set('deviceId')
      this.personsSearchField.setInputField('deviceId', data.deviceId)
    }
  }
}
