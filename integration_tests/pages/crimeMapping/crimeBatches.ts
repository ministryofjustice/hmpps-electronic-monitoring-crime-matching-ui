import AppPage from '../appPage'
import DataTableComponent from '../components/dataTableComponent'
import SearchCrimeBatchesFormComponent from '../components/forms/searchCrimeBatchesForm'

export default class CrimeBatchesPage extends AppPage {
  constructor() {
    super('Crime Batches')
  }

  get dataTable(): DataTableComponent {
    return new DataTableComponent()
  }

  get form(): SearchCrimeBatchesFormComponent {
    return new SearchCrimeBatchesFormComponent()
  }

  checkOnPage(): void {
    super.checkOnPage()

    this.navigation.crimeMappingLink.shouldBeActive()
    this.form.checkHasForm()
  }
}
