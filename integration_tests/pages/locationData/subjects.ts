import AppPage from '../appPage'

export default class SubjectsPage extends AppPage {
  constructor() {
    super('Subject Search')
  }

  checkOnPage(): void {
    super.checkOnPage()

    this.navigation.locationDataLink.shouldBeActive()
  }
}
