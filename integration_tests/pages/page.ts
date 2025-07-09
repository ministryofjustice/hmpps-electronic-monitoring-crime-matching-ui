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

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')
}
