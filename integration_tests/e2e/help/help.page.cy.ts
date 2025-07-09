import Page from '../../pages/page'
import HelpPage from '../../pages/help/help'

context('Help', () => {
  context('Index', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should display the legal page', () => {
      cy.visit('/help')
      Page.verifyOnPage(HelpPage)
    })
  })
})
