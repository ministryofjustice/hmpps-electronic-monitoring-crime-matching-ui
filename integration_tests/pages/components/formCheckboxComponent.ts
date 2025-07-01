import { v4 as uuidv4 } from 'uuid'
import { PageElement } from '../page'

export default class FormCheckboxComponent {
  private elementCacheId: string = uuidv4()

  constructor(
    private readonly parent: PageElement,
    private readonly label: string,
  ) {
    this.parent.getByLegend(this.label, { log: false }).as(`${this.elementCacheId}-element`)
  }

  // PROPERTIES

  get element(): PageElement {
    return cy.get(`@${this.elementCacheId}-element`, { log: false })
  }

  // HELPERS

  click(): void {
    this.element.find('input').click()
  }

  shouldExist(): void {
    this.element.should('exist')
  }

  shouldBeChecked(): void {
    this.element.find('input').should('be.checked')
  }

  shouldNotBeChecked(): void {
    this.element.find('input').should('not.be.checked')
  }
}
