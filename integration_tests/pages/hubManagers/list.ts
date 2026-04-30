import AppPage from '../appPage'
import DataTableComponent from '../components/dataTableComponent'
import { PageElement } from '../page'

export default class ListHubManagersPage extends AppPage {
  constructor() {
    super('Hub managers')
  }

  get createHubManagerButton(): PageElement {
    return cy.get('a[href="/hub-managers/create"]')
  }

  get dataTable(): DataTableComponent {
    return new DataTableComponent()
  }

  checkOnPage(): void {
    super.checkOnPage()

    this.createHubManagerButton.should('exist')
  }
}
