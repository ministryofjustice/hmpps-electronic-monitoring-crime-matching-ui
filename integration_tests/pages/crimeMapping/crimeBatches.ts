import AppPage from '../appPage'

export default class CrimeBatchesPage extends AppPage {
  constructor() {
    super('Crime Batches')
  }

  checkOnPage(): void {
    super.checkOnPage()

    this.navigation.crimeMappingLink.shouldBeActive()
  }
}
