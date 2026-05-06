import { Component } from 'govuk-frontend'

class RevealableContent extends Component {
  constructor($root: Element) {
    super($root)

    this.$button.addEventListener('click', _ => this.handleClick())
  }

  private get $button(): HTMLButtonElement {
    return this.$root.querySelector("button[type='button']") as HTMLButtonElement
  }

  private get $content(): HTMLDivElement {
    return this.$root.querySelector('div.revealable-content__content') as HTMLDivElement
  }

  private handleClick() {
    this.$content.classList.toggle('revealable-content__content--hidden')
  }

  static moduleName = 'revealable-content'
}

export default RevealableContent
