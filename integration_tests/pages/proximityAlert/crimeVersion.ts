import AppPage from '../appPage'
import MapComponent from '../components/mapComponent'
import { PageElement } from '../page'

export default class CrimeVersionPage extends AppPage {
  constructor() {
    super(null)
  }

  get backLink(): PageElement {
    return cy.get('a.govuk-back-link')
  }

  get map(): MapComponent {
    return new MapComponent()
  }

  get exportProximityAlertButton(): PageElement<HTMLButtonElement> {
    return cy.contains('button[type=button]', 'Export proximity alert')
  }

  checkOnPage(): void {
    super.checkOnPage()

    this.navigation.proximityAlertLink.shouldBeActive()
  }
}
