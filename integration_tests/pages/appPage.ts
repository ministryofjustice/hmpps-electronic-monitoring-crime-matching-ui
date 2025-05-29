import Page from './page'

import PageHeaderComponent from './components/pageHeaderComponent'
import NavigationComponent from './components/navigationComponent'

export default class AppPage extends Page {
  constructor(title: string) {
    super(title)
  }

  get header(): PageHeaderComponent {
    return new PageHeaderComponent()
  }

  get navigation(): NavigationComponent {
    return new NavigationComponent()
  }

  checkOnPage(): void {
    super.checkOnPage()

    this.header.checkHasHeader()
    this.navigation.checkHasNavigation()
  }
}
