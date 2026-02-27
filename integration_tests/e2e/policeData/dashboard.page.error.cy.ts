import ErrorPage from '../../pages/error'
import Page from '../../pages/page'
import PoliceDataDashboardPage from '../../pages/policeData/dashboard'

context('Police Data Dashboard', () => {
  context('Error states', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should display validation errors if invalid data in query', () => {
      // Given an API response with no results
      cy.stubGetIngestionAttempts()

      // When the user loads the page with invalid query params
      cy.visit('/police-data/dashboard?&policeForceArea=MET&fromDate=abc&toDate=abc')

      const page = Page.verifyOnPage(PoliceDataDashboardPage)

      // Then the filters should have validation errors
      page.searchForm.batchIdField.shouldHaveValue('')
      page.searchForm.policeForceAreaField.shouldHaveValue('')
      page.searchForm.policeForceAreaField.shouldHaveValidationMessage('Please select a valid police force area.')
      page.searchForm.fromDateField.shouldHaveValue('abc')
      page.searchForm.fromDateField.shouldHaveValidationMessage('Please enter a valid date.')
      page.searchForm.toDateField.shouldHaveValue('abc')
      page.searchForm.toDateField.shouldHaveValidationMessage('Please enter a valid date.')

      // And the table should have 1 row
      page.dataTable.shouldHaveColumns(['', 'Status', 'Police force area', 'Batch', 'Matches', 'Date', 'Time'])
      page.dataTable.shouldHaveRows([['', 'No results found for applied filters.']])
    })

    it('should display an error if the api returns 500 when creating a query', () => {
      // Given a failing get ingestion attempts request
      cy.stubGetIngestionAttempts({
        query: '.*',
        status: 500,
        response: 'Internal Server Error',
      })

      // When the user loads the page
      cy.visit('/police-data/dashboard', { failOnStatusCode: false })

      // Then they should be shown an error page
      Page.verifyOnPage(ErrorPage, 'Internal Server Error')
    })
  })
})
