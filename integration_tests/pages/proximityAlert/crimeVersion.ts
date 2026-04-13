import AppPage from '../appPage'
import MapComponent from '../components/mapComponent'

export default class CrimeVersionPage extends AppPage {
  constructor() {
    super(null)
  }

  get map(): MapComponent {
    return new MapComponent()
  }

  checkOnPage(): void {
    super.checkOnPage()

    this.navigation.proximityAlertLink.shouldBeActive()
  }
}
