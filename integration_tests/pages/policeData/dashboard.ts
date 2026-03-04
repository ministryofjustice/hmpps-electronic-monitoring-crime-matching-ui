import AppPage from '../appPage'
import DataTableComponent from '../components/dataTableComponent'
import ExportCrimeMatchingResultsFormComponent from '../components/forms/exportCrimeMatchingResultsForm'
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

  get exportForm(): ExportCrimeMatchingResultsFormComponent {
    return new ExportCrimeMatchingResultsFormComponent()
  }

  checkOnPage(): void {
    super.checkOnPage()

    this.navigation.dataIngestionLink.shouldBeActive()
    this.searchForm.checkHasForm()
  }
}
