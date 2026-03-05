import Page from '../../pages/page'
import PoliceDataDashboardPage from '../../pages/policeData/dashboard'

context('Police Data Dashboard', () => {
  context('Searching for ingestion attempts', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
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
      // Given an API response with many ingestion attempts
      cy.stubGetIngestionAttempts({
        status: 200,
        query: 'batchId=&policeForceArea=&fromDate=&toDate=',
        response: {
          data: [
            // Successful with matches
            {
              ingestionAttemptId: '6664c855-cd76-4674-8f38-34244ad77c5a',
              ingestionStatus: 'SUCCESSFUL',
              policeForceArea: 'METROPOLITAN',
              crimeBatchId: '3acc50a6-ecc4-4c40-8296-3fc8409c1765',
              batchId: 'MPS20251110',
              matches: 5,
              createdAt: '2025-01-01T11:23:34.000Z',
            },
            // Successful without matches
            {
              ingestionAttemptId: '6664c855-cd76-4674-8f38-34244ad77c5a',
              ingestionStatus: 'SUCCESSFUL',
              policeForceArea: 'METROPOLITAN',
              crimeBatchId: '4f493763-fd59-41a3-9f2d-688d6dbd82c8',
              batchId: 'MPS20251110',
              matches: 0,
              createdAt: '2025-01-01T11:23:34.000Z',
            },
            // Successful pending matching
            {
              ingestionAttemptId: '6664c855-cd76-4674-8f38-34244ad77c5a',
              ingestionStatus: 'SUCCESSFUL',
              policeForceArea: 'METROPOLITAN',
              crimeBatchId: '5494b24b-5972-492e-b3a0-e215fe0a9fc0',
              batchId: 'MPS20251110',
              matches: null,
              createdAt: '2025-01-01T11:23:34.000Z',
            },
            // Partial with matches
            {
              ingestionAttemptId: '0078f3f7-74dc-4165-8e43-dca9e10a1a39',
              ingestionStatus: 'PARTIAL',
              policeForceArea: 'AVON_AND_SOMERSET',
              crimeBatchId: 'a0fd61c2-c289-4acd-aef9-2d7d89a26d4f',
              batchId: 'MPS20251110',
              matches: 5,
              createdAt: '2025-01-01T11:23:34.000Z',
            },
            // Partial without matches
            {
              ingestionAttemptId: '0078f3f7-74dc-4165-8e43-dca9e10a1a39',
              ingestionStatus: 'PARTIAL',
              policeForceArea: 'AVON_AND_SOMERSET',
              crimeBatchId: '21c9124b-d90b-4830-bf6e-5327a690bff4',
              batchId: 'MPS20251110',
              matches: 0,
              createdAt: '2025-01-01T11:23:34.000Z',
            },
            // Partial pending matching
            {
              ingestionAttemptId: '0078f3f7-74dc-4165-8e43-dca9e10a1a39',
              ingestionStatus: 'PARTIAL',
              policeForceArea: 'AVON_AND_SOMERSET',
              crimeBatchId: '9ff5fdf8-5c8c-4e3b-bd6a-d0fe1407f0d8',
              batchId: 'MPS20251110',
              matches: null,
              createdAt: '2025-01-01T11:23:34.000Z',
            },
            // Failed
            {
              ingestionAttemptId: 'de5cd033-4a06-4f1b-b4af-c40879b1eda8',
              ingestionStatus: 'FAILED',
              policeForceArea: 'CITY_OF_LONDON',
              crimeBatchId: '6d869b08-7546-4ba7-8f26-2548f97f5a75',
              batchId: 'MPS20251110',
              matches: null,
              createdAt: '2025-01-01T11:23:34.000Z',
            },
            // Error
            {
              ingestionAttemptId: 'aae2d621-719d-4c53-b8cd-a2d847ee659d',
              ingestionStatus: 'ERROR',
              policeForceArea: 'CITY_OF_LONDON',
              crimeBatchId: '',
              batchId: '',
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
        [
          'Select batch-3acc50a6-ecc4-4c40-8296-3fc8409c1765',
          'Ingested',
          'Metropolitan',
          'MPS20251110',
          '5',
          '01/01/2025',
          '11:23:34',
        ],
        ['', 'Ingested', 'Metropolitan', 'MPS20251110', '0', '01/01/2025', '11:23:34'],
        ['', 'Ingested', 'Metropolitan', 'MPS20251110', 'In progress', '01/01/2025', '11:23:34'],
        [
          'Select batch-a0fd61c2-c289-4acd-aef9-2d7d89a26d4f',
          'Partially ingested',
          'Avon and Somerset',
          'MPS20251110',
          '5',
          '01/01/2025',
          '11:23:34',
        ],
        ['', 'Partially ingested', 'Avon and Somerset', 'MPS20251110', '0', '01/01/2025', '11:23:34'],
        ['', 'Partially ingested', 'Avon and Somerset', 'MPS20251110', 'In progress', '01/01/2025', '11:23:34'],
        ['', 'Failed ingestion', 'City of London', 'MPS20251110', 'N/A', '01/01/2025', '11:23:34'],
        ['', 'Error', 'City of London', 'Failed', 'N/A', '01/01/2025', '11:23:34'],
      ])
      page.dataTable.shouldNotHavePagination()

      // And the status column should have the correct tags
      page.dataTable.cell(0, 1).find('.govuk-tag').should('have.class', 'govuk-tag--green')
      page.dataTable.cell(1, 1).find('.govuk-tag').should('have.class', 'govuk-tag--green')
      page.dataTable.cell(2, 1).find('.govuk-tag').should('have.class', 'govuk-tag--green')
      page.dataTable.cell(3, 1).find('.govuk-tag').should('have.class', 'govuk-tag--yellow')
      page.dataTable.cell(4, 1).find('.govuk-tag').should('have.class', 'govuk-tag--yellow')
      page.dataTable.cell(5, 1).find('.govuk-tag').should('have.class', 'govuk-tag--yellow')
      page.dataTable.cell(6, 1).find('.govuk-tag').should('have.class', 'govuk-tag--orange')
      page.dataTable.cell(7, 1).find('.govuk-tag').should('have.class', 'govuk-tag--red')

      // And the batches column should have the correct links
      page.dataTable
        .cell(0, 3)
        .find('a')
        .should('have.attr', 'href', '/police-data/ingestion-attempts/6664c855-cd76-4674-8f38-34244ad77c5a')
      page.dataTable
        .cell(1, 3)
        .find('a')
        .should('have.attr', 'href', '/police-data/ingestion-attempts/6664c855-cd76-4674-8f38-34244ad77c5a')
      page.dataTable
        .cell(2, 3)
        .find('a')
        .should('have.attr', 'href', '/police-data/ingestion-attempts/6664c855-cd76-4674-8f38-34244ad77c5a')
      page.dataTable
        .cell(3, 3)
        .find('a')
        .should('have.attr', 'href', '/police-data/ingestion-attempts/0078f3f7-74dc-4165-8e43-dca9e10a1a39')
      page.dataTable
        .cell(4, 3)
        .find('a')
        .should('have.attr', 'href', '/police-data/ingestion-attempts/0078f3f7-74dc-4165-8e43-dca9e10a1a39')
      page.dataTable
        .cell(5, 3)
        .find('a')
        .should('have.attr', 'href', '/police-data/ingestion-attempts/0078f3f7-74dc-4165-8e43-dca9e10a1a39')
      page.dataTable
        .cell(6, 3)
        .find('a')
        .should('have.attr', 'href', '/police-data/ingestion-attempts/de5cd033-4a06-4f1b-b4af-c40879b1eda8')
      page.dataTable
        .cell(7, 3)
        .find('a')
        .should('have.attr', 'href', '/police-data/ingestion-attempts/aae2d621-719d-4c53-b8cd-a2d847ee659d')

      // And the matches column should have the correct formatting
      page.dataTable.cell(0, 4).should('not.have.class', 'table-cell--red table-cell--bold')
      page.dataTable.cell(1, 4).should('have.class', 'table-cell--red table-cell--bold')
      page.dataTable.cell(2, 4).should('not.have.class', 'table-cell--red table-cell--bold')
      page.dataTable.cell(3, 4).should('not.have.class', 'table-cell--red table-cell--bold')
      page.dataTable.cell(4, 4).should('have.class', 'table-cell--red table-cell--bold')
      page.dataTable.cell(5, 4).should('not.have.class', 'table-cell--red table-cell--bold')
      page.dataTable.cell(6, 4).should('have.class', 'table-cell--red table-cell--bold')
      page.dataTable.cell(7, 4).should('have.class', 'table-cell--red table-cell--bold')
    })

    it('should populate the form with query parameters', () => {
      // Given an API response with no results
      cy.stubGetIngestionAttempts()

      // When the user loads the page
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
            crimeBatchId: '5494b24b-5972-492e-b3a0-e215fe0a9fc0',
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

      // When the user loads the page
      cy.visit('/police-data/dashboard?batchId=abc')

      const page = Page.verifyOnPage(PoliceDataDashboardPage)

      // Then the table should have pagination
      page.dataTable.shouldHavePagination()
      page.dataTable.pagination.shouldHaveCurrentPage('1')
      page.dataTable.pagination.shouldHaveNextButton()
      page.dataTable.pagination.shouldNotHavePrevButton()

      // When the user navigates to the next page
      page.dataTable.pagination.next.click()

      // Then the url should include the page number and the original query
      cy.url().should('include', '?batchId=abc&page=2')

      // And the table should have pagination
      page.dataTable.shouldHavePagination()
      page.dataTable.pagination.shouldHaveCurrentPage('2')
      page.dataTable.pagination.shouldNotHaveNextButton()
      page.dataTable.pagination.shouldHavePrevButton()
    })
  })
})
