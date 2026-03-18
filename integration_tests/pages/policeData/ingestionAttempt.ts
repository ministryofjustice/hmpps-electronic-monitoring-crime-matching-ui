import AppPage from '../appPage'
import DataTableComponent from '../components/dataTableComponent'

export default class PoliceDataIngestionAttemptPage extends AppPage {
  constructor() {
    super('Batch details')
  }

  get summaryTable(): DataTableComponent {
    return new DataTableComponent('.ingestion-attempt-summary-table')
  }

  checkOnPage(): void {
    super.checkOnPage()

    this.navigation.dataIngestionLink.shouldBeActive()
  }
}
