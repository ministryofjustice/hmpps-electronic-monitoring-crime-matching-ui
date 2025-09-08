import AppPage from '../appPage'
import DataTableComponent from '../components/dataTableComponent'
import SearchDeviceActivationPositionsFormComponent from '../components/forms/searchDeviceActivationPositions'
import SearchPersonsFormComponent from '../components/forms/searchPersonsForm'

export default class PersonsPage extends AppPage {
  constructor() {
    super('PoP Search')
  }

  get dataTable(): DataTableComponent {
    return new DataTableComponent()
  }

  get form(): SearchPersonsFormComponent {
    return new SearchPersonsFormComponent()
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
