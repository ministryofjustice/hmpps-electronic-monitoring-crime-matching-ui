import { hubCaseworker } from '../../fixtures/auth'
import Page from '../../pages/page'
import CrimeVersionPage from '../../pages/proximityAlert/crimeVersion'
import { crimeVersionId, hubManager, crimeVersionWithManyMatches } from './fixtures'

context('Crime Version', () => {
  context('Exporting a proximity alert', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', hubCaseworker)
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
      page.exportProximityAlertButton.click()
      page.map.sidebar.exportProximityAlertForm.exportButton.click()

      // Then the page should have reloaded
      cy.url().should('include', `/proximity-alert/${crimeVersionId}`)
      page = Page.verifyOnPage(CrimeVersionPage)

      // And should have validation messages
      page.map.sidebar.element.scrollTo('bottom')
      page.map.sidebar.exportProximityAlertForm.authorisingManagerField.element.should('be.visible')
      page.map.sidebar.exportProximityAlertForm.authorisingManagerField.shouldHaveValidationMessage(
        'Select an authorising manager',
      )
    })

    it('should emit the expected audit message when exporting a proximity alert', () => {
      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`)

      const page = Page.verifyOnPage(CrimeVersionPage)

      // And clicks export
      page.exportProximityAlertButton.click()
      page.map.sidebar.exportProximityAlertForm.fillInWith({
        authorisingManager: 'a6e61168-f7ca-4056-8a2d-7db0fd77fb62',
      })
      page.map.sidebar.exportProximityAlertForm.exportButton.click()

      // Then the expected audit message was sent
      cy.expectAuditEvents([
        {
          who: 'USER1',
          details: '{"params":{"crimeVersionId":"64d41bd9-5450-4bbb-89d4-42ba75659f49"}}',
          what: 'EXPORT_PROXIMITY_ALERT_CRIME_VERSION',
          service: 'hmpps-electronic-monitoring-crime-matching-ui',
        },
      ])
    })
  })
})
