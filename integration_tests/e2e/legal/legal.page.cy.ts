import Page from '../../pages/page'
import LegalPage from '../../pages/legal/legal'

context('Legal', () => {
  context('Index', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should display the legal page', () => {
      cy.visit('/legal')
      Page.verifyOnPage(LegalPage)
    })
  })
})
