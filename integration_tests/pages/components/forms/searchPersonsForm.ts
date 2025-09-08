import { PageElement } from '../../page'
import FormComponent from '../formComponent'
import FormInputComponent from '../formInputComponent'
import FormRadiosComponent from '../formRadiosComponent'

type SearchPersonsFormData = {
  nomisId?: string
  personName?: string
  deviceId?: string
}

export default class SearchPersonsFormComponent extends FormComponent {
  constructor() {
    super('person-search-form')
  }
  // FIELDS

  get searchNomisIdField(): FormInputComponent {
    const label = 'Nomis ID'
    return new FormInputComponent(this.form, label)
  }

  get searchPersonNameField(): FormInputComponent {
    const label = 'Name'
    return new FormInputComponent(this.form, label)
  }

  get searchDeviceIdField(): FormInputComponent {
    const label = 'Device ID'
    return new FormInputComponent(this.form, label)
  }

  get searchButton(): PageElement {
    return this.form.contains('button', 'Search')
  }

  get personsSearchField(): FormRadiosComponent {
    return new FormRadiosComponent(this.form, 'PoP Search')
  }

  // HELPERS

  fillInWith = (data: SearchPersonsFormData): undefined => {
    if (data.nomisId) {
      this.personsSearchField.set('nomisId')
      this.personsSearchField.setInputField('nomisId', data.nomisId)
    }
    if (data.personName) {
      this.personsSearchField.set('personName')
      this.personsSearchField.setInputField('personName', data.personName)
    }
    if (data.deviceId) {
      this.personsSearchField.set('deviceId')
      this.personsSearchField.setInputField('deviceId', data.deviceId)
    }
  }
}
