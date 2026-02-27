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
      page.dataTable.shouldNotHavePagination()
    })

    it('should display ingestion attempts', () => {
      // Given an API response with three ingestion attempts
      cy.stubGetIngestionAttempts({
        status: 200,
        query: 'batchId=&policeForceArea=&fromDate=&toDate=',
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
              ingestionAttemptId: '0078f3f7-74dc-4165-8e43-dca9e10a1a39',
              ingestionStatus: 'PARTIAL',
              policeForceArea: 'AVON_AND_SOMERSET',
              batchId: 'MPS20251110',
              matches: 0,
              createdAt: '2025-01-01T11:23:34.000Z',
            },
            {
              ingestionAttemptId: 'de5cd033-4a06-4f1b-b4af-c40879b1eda8',
              ingestionStatus: 'FAILED',
              policeForceArea: 'METROPOLITAN',
              batchId: 'MPS20251110',
              matches: null,
              createdAt: '2025-01-01T11:23:34.000Z',
            },
          ],
          pageCount: 1,
          pageNumber: 0,
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

      // And the table should have 3 rows
      page.dataTable.shouldHaveColumns(['', 'Status', 'Police force area', 'Batch', 'Matches', 'Date', 'Time'])
      page.dataTable.shouldHaveRows([
        ['', 'Ingested', 'City of London', 'MPS20251110', '5', '01/01/2025', '11:23:34'],
        ['', 'Partially ingested', 'Avon and Somerset', 'MPS20251110', '0', '01/01/2025', '11:23:34'],
        ['', 'Failed ingestion', 'Metropolitan', 'MPS20251110', 'N/A', '01/01/2025', '11:23:34'],
      ])
      page.dataTable.shouldNotHavePagination()

      // And the status column should have the correct tags
      page.dataTable.cell(0, 1).find('.govuk-tag').should('have.class', 'govuk-tag--green')
      page.dataTable.cell(1, 1).find('.govuk-tag').should('have.class', 'govuk-tag--yellow')
      page.dataTable.cell(2, 1).find('.govuk-tag').should('have.class', 'govuk-tag--red')

      // And the batches column should have the correct links
      page.dataTable
        .cell(0, 3)
        .find('a')
        .should('have.attr', 'href', '/police-data/ingestion-attempts/6664c855-cd76-4674-8f38-34244ad77c5a')
      page.dataTable
        .cell(1, 3)
        .find('a')
        .should('have.attr', 'href', '/police-data/ingestion-attempts/0078f3f7-74dc-4165-8e43-dca9e10a1a39')
      page.dataTable
        .cell(2, 3)
        .find('a')
        .should('have.attr', 'href', '/police-data/ingestion-attempts/de5cd033-4a06-4f1b-b4af-c40879b1eda8')

      // And the matches column should have the correct formatting
      page.dataTable.cell(0, 4).should('not.have.class', 'table-cell--red table-cell--bold')
      page.dataTable.cell(1, 4).should('have.class', 'table-cell--red table-cell--bold')
      page.dataTable.cell(2, 4).should('have.class', 'table-cell--red table-cell--bold')
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
      page.dataTable.shouldNotHavePagination()
    })

    it('should show allow the user to navigate to other pages in the result set', () => {
      const response = {
        data: [
          {
            ingestionAttemptId: '6664c855-cd76-4674-8f38-34244ad77c5a',
            ingestionStatus: 'SUCCESSFUL',
            policeForceArea: 'CITY_OF_LONDON',
            batchId: 'MPS20251110',
            matches: 5,
            createdAt: '2025-01-01T11:23:34.000Z',
          },
        ],
        pageCount: 2,
        pageNumber: 0,
        pageSize: 30,
      }

      // Stub first page response
      cy.stubGetIngestionAttempts({
        status: 200,
        query: 'batchId=abc&policeForceArea=&fromDate=&toDate=',
        response,
      })

      // Stub second page response
      cy.stubGetIngestionAttempts({
        status: 200,
        query: 'batchId=abc&policeForceArea=&fromDate=&toDate=&page=1',
        response: {
          ...response,
          pageNumber: 1,
        },
      })

      // When the user loads the page with no query params
      cy.visit('/police-data/dashboard?batchId=abc')

      const page = Page.verifyOnPage(PoliceDataDashboardPage)

      // Then the table should have pagination
      page.dataTable.shouldHavePagination()
      page.dataTable.pagination.shouldHaveCurrentPage('1')
      page.dataTable.pagination.shouldHaveNextButton()
      page.dataTable.pagination.shouldNotHavePrevButton()

      // When the user navigates to the next page
      page.dataTable.pagination.next.click()

      // Then the url should include the page number
      cy.url().should('include', '?batchId=abc&page=2')

      // And the table should have pagination
      page.dataTable.shouldHavePagination()
      page.dataTable.pagination.shouldHaveCurrentPage('2')
      page.dataTable.pagination.shouldNotHaveNextButton()
      page.dataTable.pagination.shouldHavePrevButton()
    })
  })
})
