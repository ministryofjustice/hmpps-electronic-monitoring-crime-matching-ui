import AppPage from '../appPage'
import DataTableComponent from '../components/dataTableComponent'

export default class CrimeBatchesPage extends AppPage {
  constructor() {
    super('Crime Batches')
  }

  get dataTable(): DataTableComponent {
    return new DataTableComponent()
  }

  checkOnPage(): void {
    super.checkOnPage()

    this.navigation.crimeMappingLink.shouldBeActive()
  }
}
