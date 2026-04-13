import ErrorPage from '../../pages/error'
import Page from '../../pages/page'

context('Crime Version', () => {
  context('Error states', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should display an error if the api returns 404 when fetching a crime version', () => {
      // Given a not found get crime version
      cy.stubGetCrimeVersion({
        crimeVersionId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
        status: 404,
        response: 'Not Found',
      })

      // When the user loads the page
      cy.visit('/proximity-alert/64d41bd9-5450-4bbb-89d4-42ba75659f49', { failOnStatusCode: false })

      // Then they should be shown an error page
      Page.verifyOnPage(ErrorPage, 'Not Found')
    })

    it('should display an error if the api returns 500 when fetching a crime version', () => {
      // Given a failing get crime version request
      cy.stubGetCrimeVersion({
        crimeVersionId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
        status: 500,
        response: 'Internal Server Error',
      })

      // When the user loads the page
      cy.visit('/proximity-alert/64d41bd9-5450-4bbb-89d4-42ba75659f49', { failOnStatusCode: false })

      // Then they should be shown an error page
      Page.verifyOnPage(ErrorPage, 'Internal Server Error')
    })
  })
})
