export type PageElement<TElement = HTMLElement> = Cypress.Chainable<JQuery<TElement>>

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

  manageDetails = (): Cypress.Chainable<JQuery<HTMLElement> | null> => {
    return cy.get('body').then(($body): Cypress.Chainable<JQuery<HTMLElement> | null> => {
      // HMPPS MOJ header pattern
      const mojLink = $body.find('[data-qa=manageDetails]').first()
      if (mojLink.length) {
        return cy.wrap<JQuery<HTMLElement> | null>(mojLink, { log: false })
      }

      // Probation Components header pattern
      const probationLink = $body
        .find('a.probation-common-header__submenu-link')
        .filter((_, el) => /account/i.test(el.textContent ?? ''))
        .first()
      if (probationLink.length) {
        return cy.wrap<JQuery<HTMLElement> | null>(probationLink, { log: false })
      }

      // Fallback header (no manage link)
      cy.log('No manage details link found in current header variant')
      return cy.wrap<JQuery<HTMLElement> | null>(null, { log: false })
    })
  }
}
