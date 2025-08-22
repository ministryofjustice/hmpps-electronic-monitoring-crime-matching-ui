import AppPage from '../appPage'
import DataTableComponent from '../components/dataTableComponent'
import SearchDeviceActivationPositionsFormComponent from '../components/forms/searchDeviceActivationPositions'
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

  get locationsForm(): SearchDeviceActivationPositionsFormComponent {
    return new SearchDeviceActivationPositionsFormComponent()
  }

  checkOnPage(): void {
    super.checkOnPage()

    this.navigation.locationDataLink.shouldBeActive()
    this.form.checkHasForm()
    this.locationsForm.checkHasForm()
  }
}
