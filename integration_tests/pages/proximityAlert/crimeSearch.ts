import AppPage from '../appPage'
import DataTableComponent from '../components/dataTableComponent'
import SearchCrimeVersionsFormComponent from '../components/forms/searchCrimeVersionsForm'

export default class CrimeSearchPage extends AppPage {
  constructor() {
    super('Search crimes')
  }

  get dataTable(): DataTableComponent {
    return new DataTableComponent()
  }

  get searchForm(): SearchCrimeVersionsFormComponent {
    return new SearchCrimeVersionsFormComponent()
  }

  checkOnPage(): void {
    super.checkOnPage()

    this.navigation.proximityAlertLink.shouldBeActive()
    this.searchForm.checkHasForm()
  }
}
