import AppPage from '../appPage'

export default class HelpPage extends AppPage {
  constructor() {
    super('Help')
  }

  checkOnPage(): void {
    super.checkOnPage()

    this.navigation.helpLink.shouldBeActive()
  }
}
