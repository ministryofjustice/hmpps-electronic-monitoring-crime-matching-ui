import AppPage from '../appPage'
import DataTableComponent from '../components/dataTableComponent'
import SearchSubjectLocationsFormComponent from '../components/forms/searchSubjectLocationsForm'
import SearchSubjectsFormComponent from '../components/forms/searchSubjectsForm'

export default class SubjectsPage extends AppPage {
  constructor() {
    super('Subject Search')
  }

  get dataTable(): DataTableComponent {
    return new DataTableComponent()
  }

  get form(): SearchSubjectsFormComponent {
    return new SearchSubjectsFormComponent()
  }

  get locationsForm(): SearchSubjectLocationsFormComponent {
    return new SearchSubjectLocationsFormComponent()
  }

  checkOnPage(): void {
    super.checkOnPage()

    this.navigation.locationDataLink.shouldBeActive()
    this.form.checkHasForm()
    this.locationsForm.checkHasForm()
  }
}
