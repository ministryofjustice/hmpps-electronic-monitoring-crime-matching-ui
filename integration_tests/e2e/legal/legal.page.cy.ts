import Page from '../../pages/page'
import LegalPage from '../../pages/legal/legal'
import { hubCaseworker } from '../../fixtures/auth'

context('Legal', () => {
  context('Index', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', hubCaseworker)
      cy.signIn()
    })

    it('should display the legal page', () => {
      cy.visit('/legal')
      Page.verifyOnPage(LegalPage)
    })
  })
})
