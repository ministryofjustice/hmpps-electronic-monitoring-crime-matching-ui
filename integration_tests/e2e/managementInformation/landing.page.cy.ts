import { hubManager } from '../../fixtures/auth'
import ManagementInformationLandingPage from '../../pages/managementInformation/landing'
import Page from '../../pages/page'

context('Management Information', () => {
  context('Landing page', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', hubManager)
      cy.signIn()
    })

    it('should display the management information landing page', () => {
      // When the user loads the page
      cy.visit('/management-information')

      const page = Page.verifyOnPage(ManagementInformationLandingPage)

      // Then the page should display the management information datasets
      page.datasets.should('deep.equal', [
        {
          text: 'Crime matches with zero-precision positions',
          link: '/management-information/zero-precision-crime-matches',
        },
      ])
    })
  })
})
