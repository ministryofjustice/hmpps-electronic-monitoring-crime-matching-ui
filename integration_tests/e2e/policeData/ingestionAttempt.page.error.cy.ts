import { hubCaseworker } from '../../fixtures/auth'
import ErrorPage from '../../pages/error'
import Page from '../../pages/page'

context('Police Data Ingestion Attempt', () => {
  context('Error states', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', hubCaseworker)
      cy.signIn()
    })

    it('should display an error if the api returns 404 when fetching an ingestion attempt', () => {
      // Given a not found get ingestion attempt request
      cy.stubGetIngestionAttempt({
        ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
        status: 404,
        response: 'Not Found',
      })

      // When the user loads the page
      cy.visit('/police-data/ingestion-attempts/64d41bd9-5450-4bbb-89d4-42ba75659f49', { failOnStatusCode: false })

      // Then they should be shown an error page
      Page.verifyOnPage(ErrorPage, 'Not Found')

      // And the expected audit message was sent
      cy.expectAuditEvents([
        {
          who: 'USER1',
          details: '{"params":{"ingestionAttemptId":"64d41bd9-5450-4bbb-89d4-42ba75659f49"},"query":{}}',
          what: 'PAGE_VIEW_ATTEMPT_POLICE_DATA_INGESTION_ATTEMPT',
          service: 'hmpps-electronic-monitoring-crime-matching-ui',
        },
      ])
    })

    it('should display an error if the api returns 500 when fetching an ingestion attempt', () => {
      // Given a failing get ingestion attempt request
      cy.stubGetIngestionAttempt({
        ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
        status: 500,
        response: 'Internal Server Error',
      })

      // When the user loads the page
      cy.visit('/police-data/ingestion-attempts/64d41bd9-5450-4bbb-89d4-42ba75659f49', { failOnStatusCode: false })

      // Then they should be shown an error page
      Page.verifyOnPage(ErrorPage, 'Internal Server Error')

      // And the expected audit message was sent
      cy.expectAuditEvents([
        {
          who: 'USER1',
          details: '{"params":{"ingestionAttemptId":"64d41bd9-5450-4bbb-89d4-42ba75659f49"},"query":{}}',
          what: 'PAGE_VIEW_ATTEMPT_POLICE_DATA_INGESTION_ATTEMPT',
          service: 'hmpps-electronic-monitoring-crime-matching-ui',
        },
      ])
    })
  })
})
