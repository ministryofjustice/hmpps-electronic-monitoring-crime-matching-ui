import Page from '../../pages/page'
import CrimeVersionPage from '../../pages/proximityAlert/crimeVersion'
import { crimeVersionId, hubManager, crimeVersionWithManyMatches } from './fixtures'

context('Crime Version', () => {
  context('Exporting a proximity alert', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()

      cy.stubMapMiddleware()
      cy.stubGetHubManagers({
        status: 200,
        response: {
          data: [hubManager],
        },
      })
      cy.stubGetCrimeVersion({
        status: 200,
        crimeVersionId,
        response: {
          data: crimeVersionWithManyMatches,
        },
      })
    })

    it('should show a validation error if no authorising manager selected', () => {
      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`)

      let page = Page.verifyOnPage(CrimeVersionPage)

      // And clicks export
      page.map.sidebar.exportProximityAlertForm.exportButton.click()

      // Then the page should have reloaded
      cy.url().should('include', `/proximity-alert/${crimeVersionId}`)
      page = Page.verifyOnPage(CrimeVersionPage)

      // And should have validation messages
      page.map.sidebar.exportProximityAlertForm.authorisingManagerField.shouldHaveValidationMessage(
        'Select an authorising manager',
      )
    })
  })
})
