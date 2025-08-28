import { PageElement } from '../../page'
import FormComponent from '../formComponent'
import FormInputComponent from '../formInputComponent'

type SearchSubjectsFormData = {
  nomisId?: string
  name?: string
}

export default class SearchSubjectsFormComponent extends FormComponent {
  constructor() {
    super('subject-search-form')
  }
  // FIELDS

  get searchNomisIdField(): FormInputComponent {
    const label = 'NOMIS ID'
    return new FormInputComponent(this.form, label)
  }

  get searchNameField(): FormInputComponent {
    const label = 'Name'
    return new FormInputComponent(this.form, label)
  }

  get searchButton(): PageElement {
    return this.form.contains('button', 'Search')
  }

  // HELPERS

  fillInWith = (data: SearchSubjectsFormData): undefined => {
    if (data.nomisId) {
      this.searchNomisIdField.set(data.nomisId)
    }
    if (data.name) {
      this.searchNameField.set(data.name)
    }
  }
}
