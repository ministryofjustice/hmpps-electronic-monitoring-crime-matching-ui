import AppPage from '../appPage'

export default class LegalPage extends AppPage {
  constructor() {
    super('Legal')
  }

  checkOnPage(): void {
    super.checkOnPage()

    this.navigation.legalLink.shouldBeActive()
  }
}
