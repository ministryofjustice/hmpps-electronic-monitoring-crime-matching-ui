import Page from '../../pages/page'
import HelpPage from '../../pages/help/help'
import { hubCaseworker } from '../../fixtures/auth'

context('Help', () => {
  context('Index', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', hubCaseworker)
      cy.signIn()
    })

    it('should display the legal page', () => {
      cy.visit('/help')
      Page.verifyOnPage(HelpPage)
    })
  })
})
