export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T extends Page, Args extends unknown[]>(constructor: new (...args: Args) => T, ...args: Args): T {
    return new constructor(...args)
  }

  protected constructor(private readonly title: string | null) {
    this.checkOnPage()
  }

  checkOnPage(): void {
    // Map pages don't have an h1
    if (this.title !== null) {
      cy.get('h1').contains(this.title)
    }
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => {
    return cy.get('body').then($body => {
      // HMPPS MOJ header pattern
      if ($body.find('[data-qa=manageDetails]').length) {
        return cy.get('[data-qa=manageDetails]')
      }

      // Probation Components header pattern
      if ($body.find('a.probation-common-header__submenu-link').length) {
        return cy.contains('a.probation-common-header__submenu-link', /account/i)
      }

      // Fallback header (no manage link)
      cy.log('No manage details link found in current header variant')
      return cy.wrap(null, { log: false })
    })
  }
}
