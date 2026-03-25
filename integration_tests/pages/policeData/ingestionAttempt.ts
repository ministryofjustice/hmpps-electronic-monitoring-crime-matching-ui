import AppPage from '../appPage'
import DataTableComponent from '../components/dataTableComponent'
import { PageElement } from '../page'

export default class PoliceDataIngestionAttemptPage extends AppPage {
  constructor() {
    super('Batch details')
  }

  get backLink(): PageElement {
    return cy.get('a.govuk-back-link')
  }

  get summaryTable(): DataTableComponent {
    return new DataTableComponent('.ingestion-attempt-summary-table')
  }

  get crimeBreakdownTable(): DataTableComponent {
    return new DataTableComponent('.ingestion-attempt-crime-breakdown-table')
  }

  get validationErrorsTable(): DataTableComponent {
    return new DataTableComponent('.ingestion-attempt-validation-errors-table')
  }

  get failedIngestionSection(): PageElement {
    return cy.get('.govuk-grid-row').filter(':has(h2:contains("Failed ingestion"))')
  }

  checkOnPage(): void {
    super.checkOnPage()

    this.navigation.dataIngestionLink.shouldBeActive()
  }
}
