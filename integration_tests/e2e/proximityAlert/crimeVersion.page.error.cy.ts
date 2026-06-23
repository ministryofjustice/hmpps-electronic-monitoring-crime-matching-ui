import { hubCaseworker } from '../../fixtures/auth'
import ErrorPage from '../../pages/error'
import Page from '../../pages/page'
import { crimeVersionWithOneMatch, crimeVersionId, hubManager } from './fixtures'

context('Crime Version', () => {
  context('Error states', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', hubCaseworker)
      cy.signIn()
    })

    it('should display an error if the api returns 404 when fetching a crime version', () => {
      // Given a successful GET /hub-managers request
      cy.stubGetHubManagers({
        status: 200,
        response: {
          data: [hubManager],
        },
      })

      // And an unsuccessful GET /crime-versions/{id} request
      cy.stubGetCrimeVersion({
        crimeVersionId,
        status: 404,
        response: 'Not Found',
      })

      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`, { failOnStatusCode: false })

      // Then they should be shown an error page
      Page.verifyOnPage(ErrorPage, 'Not Found')

      // And the expected audit message was sent
      cy.expectAuditEvents([
        {
          who: 'USER1',
          details: '{"params":{"crimeVersionId":"64d41bd9-5450-4bbb-89d4-42ba75659f49"},"query":{}}',
          what: 'PAGE_VIEW_ATTEMPT_PROXIMITY_ALERT_CRIME_VERSION',
          service: 'hmpps-electronic-monitoring-crime-matching-ui',
        },
      ])
    })

    it('should display an error if the api returns 500 when fetching a crime version', () => {
      // Given a successful GET /hub-managers request
      cy.stubGetHubManagers({
        status: 200,
        response: {
          data: [hubManager],
        },
      })

      // And an unsuccessful GET /crime-versions/{id} request
      cy.stubGetCrimeVersion({
        crimeVersionId,
        status: 500,
        response: 'Internal Server Error',
      })

      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`, { failOnStatusCode: false })

      // Then they should be shown an error page
      Page.verifyOnPage(ErrorPage, 'Internal Server Error')

      // And the expected audit message was sent
      cy.expectAuditEvents([
        {
          who: 'USER1',
          details: '{"params":{"crimeVersionId":"64d41bd9-5450-4bbb-89d4-42ba75659f49"},"query":{}}',
          what: 'PAGE_VIEW_ATTEMPT_PROXIMITY_ALERT_CRIME_VERSION',
          service: 'hmpps-electronic-monitoring-crime-matching-ui',
        },
      ])
    })

    it('should display an error if the api returns 500 when fetching hub managers', () => {
      // Given an unsuccessful GET /hub-managers request
      cy.stubGetHubManagers({
        status: 500,
        response: 'Internal Server Error',
      })

      // And a successful GET /crime-versions/{id} request
      cy.stubGetCrimeVersion({
        crimeVersionId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
        status: 200,
        response: {
          data: crimeVersionWithOneMatch,
        },
      })

      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`, { failOnStatusCode: false })

      // Then they should be shown an error page
      Page.verifyOnPage(ErrorPage, 'Internal Server Error')

      // And the expected audit message was sent
      cy.expectAuditEvents([
        {
          who: 'USER1',
          details: '{"params":{"crimeVersionId":"64d41bd9-5450-4bbb-89d4-42ba75659f49"},"query":{}}',
          what: 'PAGE_VIEW_ATTEMPT_PROXIMITY_ALERT_CRIME_VERSION',
          service: 'hmpps-electronic-monitoring-crime-matching-ui',
        },
      ])
    })
  })
})
