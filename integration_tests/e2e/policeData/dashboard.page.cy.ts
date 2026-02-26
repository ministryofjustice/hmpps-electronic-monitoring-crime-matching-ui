import Page from '../../pages/page'
import PoliceDataDashboardPage from '../../pages/policeData/dashboard'

context('Police Data Dashboard', () => {
  context('Searching for ingestion attempts', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()

      cy.stubMapMiddleware()
    })

    it('should display an empty table', () => {
      // Given an API response with no results
      cy.stubGetIngestionAttempts()

      // When the user loads the page with no query params
      cy.visit('/police-data/dashboard')

      const page = Page.verifyOnPage(PoliceDataDashboardPage)

      // Then the filters should be empty
      page.searchForm.batchIdField.shouldHaveValue('')
      page.searchForm.policeForceAreaField.shouldHaveValue('')
      page.searchForm.fromDateField.shouldHaveValue('')
      page.searchForm.toDateField.shouldHaveValue('')

      // And the table should have 1 row
      page.dataTable.shouldHaveColumns(['', 'Status', 'Police force area', 'Batch', 'Matches', 'Date', 'Time'])
      page.dataTable.shouldHaveRows([['', 'No results found for applied filters.']])
    })

    it('should display ingestion attempts', () => {
      // Given an API response with three ingestion attempts
      cy.stubGetIngestionAttempts({
        status: 200,
        query: '?batchId=&policeForceArea=&fromDate=&toDate=',
        response: {
          data: [
            {
              ingestionAttemptId: '6664c855-cd76-4674-8f38-34244ad77c5a',
              ingestionStatus: 'SUCCESSFUL',
              policeForceArea: 'CITY_OF_LONDON',
              batchId: 'MPS20251110',
              matches: 5,
              createdAt: '2025-01-01T11:23:34.000Z',
            },
            {
              ingestionAttemptId: '6664c855-cd76-4674-8f38-34244ad77c5a',
              ingestionStatus: 'PARTIAL',
              policeForceArea: 'AVON_AND_SOMERSET',
              batchId: 'MPS20251110',
              matches: 0,
              createdAt: '2025-01-01T11:23:34.000Z',
            },
            {
              ingestionAttemptId: '6664c855-cd76-4674-8f38-34244ad77c5a',
              ingestionStatus: 'FAILED',
              policeForceArea: 'METROPOLITAN',
              batchId: 'MPS20251110',
              matches: null,
              createdAt: '2025-01-01T11:23:34.000Z',
            },
          ],
          pageCount: 1,
          pageNumber: 1,
          pageSize: 30,
        },
      })

      // When the user loads the page with no query params
      cy.visit('/police-data/dashboard')

      const page = Page.verifyOnPage(PoliceDataDashboardPage)

      // Then the filters should be empty
      page.searchForm.batchIdField.shouldHaveValue('')
      page.searchForm.policeForceAreaField.shouldHaveValue('')
      page.searchForm.fromDateField.shouldHaveValue('')
      page.searchForm.toDateField.shouldHaveValue('')

      // And the table should have 1 row
      page.dataTable.shouldHaveColumns(['', 'Status', 'Police force area', 'Batch', 'Matches', 'Date', 'Time'])
      page.dataTable.shouldHaveRows([
        ['', 'Ingested', 'City of London', 'MPS20251110', '5', '01/01/2025', '11:23:34'],
        ['', 'Partially ingested', 'Avon and Somerset', 'MPS20251110', '0', '01/01/2025', '11:23:34'],
        ['', 'Failed ingestion', 'Metropolitan', 'MPS20251110', 'N/A', '01/01/2025', '11:23:34'],
      ])
    })

    it('should populate the form with query parameters', () => {
      // Given an API response with no results
      cy.stubGetIngestionAttempts()

      // When the user loads the page with no query params
      cy.visit(
        '/police-data/dashboard?batchId=abc&policeForceArea=METROPOLITAN&fromDate=19%2F2%2F2026&toDate=20%2F2%2F2026',
      )

      const page = Page.verifyOnPage(PoliceDataDashboardPage)

      // Then the filters should not be empty
      page.searchForm.batchIdField.shouldHaveValue('abc')
      page.searchForm.policeForceAreaField.shouldHaveValue('METROPOLITAN')
      page.searchForm.fromDateField.shouldHaveValue('19/2/2026')
      page.searchForm.toDateField.shouldHaveValue('20/2/2026')

      // And the table should have 1 row
      page.dataTable.shouldHaveColumns(['', 'Status', 'Police force area', 'Batch', 'Matches', 'Date', 'Time'])
      page.dataTable.shouldHaveRows([['', 'No results found for applied filters.']])
    })
  })
})
