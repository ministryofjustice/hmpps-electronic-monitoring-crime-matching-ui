import { PageElement } from '../../page'
import FormComponent from '../formComponent'
import FormInputComponent from '../formInputComponent'

type SearchCrimeBatchesFormData = {
  searchTerm?: string
}

export default class SearchCrimeBatchesFormComponent extends FormComponent {
  constructor() {
    super('crime-batches-search-form')
  }

  // FIELDS

  get searchTermField(): FormInputComponent {
    const label = 'Search'
    return new FormInputComponent(this.form, label)
  }

  get searchButton(): PageElement {
    return this.form.contains('button', 'Search')
  }

  // HELPERS

  fillInWith = (data: SearchCrimeBatchesFormData): undefined => {
    if (data.searchTerm) {
      this.searchTermField.set(data.searchTerm)
    }
  }
}
