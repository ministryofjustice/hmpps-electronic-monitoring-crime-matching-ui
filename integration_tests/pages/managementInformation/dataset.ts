import AppPage from '../appPage'
import DataTableComponent from '../components/dataTableComponent'
import FilterDatasetFormComponent from '../components/forms/filterDatasetForm'

export default class DatasetPage extends AppPage {
  get dataTable(): DataTableComponent {
    return new DataTableComponent()
  }

  get form(): FilterDatasetFormComponent {
    return new FilterDatasetFormComponent()
  }

  checkOnPage(): void {
    super.checkOnPage()

    this.form.checkHasForm()
  }
}
