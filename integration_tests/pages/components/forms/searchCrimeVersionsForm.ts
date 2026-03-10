import { PageElement } from '../../page'
import FormComponent from '../formComponent'
import FormInputComponent from '../formInputComponent'

type SearchCrimeVersionsFormData = {
  crimeReference?: string
}

export default class SearchCrimeVersionsFormComponent extends FormComponent {
  constructor() {
    super('search-crime-versions-form')
  }
  // FIELDS

  get crimeReferenceField(): FormInputComponent {
    return new FormInputComponent(this.form, 'Crime reference')
  }

  get searchButton(): PageElement {
    return this.form.contains('button', 'Search')
  }

  // HELPERS

  fillInWith = (data: SearchCrimeVersionsFormData): undefined => {
    if (data.crimeReference) {
      this.crimeReferenceField.set(data.crimeReference)
    }
  }
}
