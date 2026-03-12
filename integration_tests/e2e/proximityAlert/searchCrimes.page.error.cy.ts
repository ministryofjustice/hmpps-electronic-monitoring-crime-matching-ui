import ErrorPage from '../../pages/error'
import Page from '../../pages/page'
import CrimeSearchPage from '../../pages/proximityAlert/crimeSearch'

context('Search Crimes', () => {
  context('Error states', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should display validation errors if invalid data in query', () => {
      // Given an API response with no results
      cy.stubGetCrimeVersions()

      // When the user loads the page with an empty crime reference
      cy.visit('/proximity-alert?crimeReference=')

      const page = Page.verifyOnPage(CrimeSearchPage)

      // Then the filters should have validation errors
      page.searchForm.crimeReferenceField.shouldHaveValue('')
      page.searchForm.crimeReferenceField.shouldHaveValidationMessage('Enter a crime reference.')

      // And the table should have 1 row
      page.dataTable.shouldHaveColumns([
        'Matched',
        'Crime reference',
        'Police force area,\nBatch ID',
        'Crime type',
        'Crime date',
        'Ingestion date,\ntime',
        'Updates',
        'Versions',
      ])
      page.dataTable.shouldHaveRows([['Enter a crime reference and click search.']])
      page.dataTable.shouldNotHavePagination()
    })

    it('should display an error if the api returns 500 when creating a query', () => {
      // Given a failing get ingestion attempts request
      cy.stubGetCrimeVersions({
        query: '.*',
        status: 500,
        response: 'Internal Server Error',
      })

      // When the user loads the page
      cy.visit('/proximity-alert?crimeReference=abc', { failOnStatusCode: false })

      // Then they should be shown an error page
      Page.verifyOnPage(ErrorPage, 'Internal Server Error')
    })
  })
})
