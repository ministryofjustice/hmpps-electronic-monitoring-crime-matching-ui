import { Component } from 'govuk-frontend'

class Card extends Component {
  constructor($root: Element) {
    super($root)

    // Handle events
    if (this.link) {
      this.$root.addEventListener('click', _ => this.handleClick())
    }
  }

  get link(): HTMLAnchorElement | null {
    return this.$root.querySelector('a')
  }

  handleClick() {
    this.link?.click()
  }

  static moduleName = 'card'
}

export default Card
