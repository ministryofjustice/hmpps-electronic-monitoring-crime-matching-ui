import AppPage from '../appPage'
import DataTableComponent from '../components/dataTableComponent'
import SearchIngestionAttemptsFormComponent from '../components/forms/searchIngestionAttemptsForm'

export default class PoliceDataDashboardPage extends AppPage {
  constructor() {
    super('Data ingestion / export')
  }

  get dataTable(): DataTableComponent {
    return new DataTableComponent()
  }

  get searchForm(): SearchIngestionAttemptsFormComponent {
    return new SearchIngestionAttemptsFormComponent()
  }

  checkOnPage(): void {
    super.checkOnPage()

    this.navigation.dataIngestionLink.shouldBeActive()
    this.searchForm.checkHasForm()
  }
}
