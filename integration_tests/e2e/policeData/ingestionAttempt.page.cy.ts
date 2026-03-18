import Page from '../../pages/page'
import PoliceDataIngestionAttemptPage from '../../pages/policeData/ingestionAttempt'

context('Police Data Ingestion Attempt', () => {
  context('Searching for ingestion attempts', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should display a successful ingestion awaiting matching', () => {
      // Given an API response containing an successful ingestion attempt
      cy.stubGetIngestionAttempt({
        ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
        response: {
          data: {
            ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
            ingestionStatus: 'SUCCESSFUL',
            policeForceArea: 'CUMBRIA',
            batchId: 'CMB20250710',
            matches: null,
            createdAt: '2026-03-17T11:33:38.483121',
            fileName: '20260101000000.csv',
            submitted: 2,
            successful: 2,
            failed: 0,
          },
        },
        status: 200,
      })

      // When the user loads the page
      cy.visit('/police-data/ingestion-attempts/64d41bd9-5450-4bbb-89d4-42ba75659f49')

      const page = Page.verifyOnPage(PoliceDataIngestionAttemptPage)

      // Then the summary table should be populated
      page.summaryTable.shouldHaveColumns([
        'Status',
        'Police force area',
        'Batch',
        'Filename',
        'Matches',
        'Date',
        'Time',
      ])
      page.summaryTable.shouldHaveRows([
        ['Ingested', 'Cumbria', 'CMB20250710', '20260101000000.csv', 'In progress', '17/03/2026', '11:33:38'],
      ])
      page.summaryTable.shouldNotHavePagination()

      // And the status should have the correct tags
      page.summaryTable.cell(0, 0).find('.govuk-tag').should('have.class', 'govuk-tag--green')

      // And the matches column should have the correct formatting
      page.summaryTable.cell(0, 4).should('not.have.class', 'table-cell--red table-cell--bold')
    })

    it('should display a successful ingestion with matches', () => {
      // Given an API response containing an successful ingestion attempt
      cy.stubGetIngestionAttempt({
        ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
        response: {
          data: {
            ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
            ingestionStatus: 'SUCCESSFUL',
            policeForceArea: 'CUMBRIA',
            batchId: 'CMB20250710',
            matches: 2,
            createdAt: '2026-03-17T11:33:38.483121',
            fileName: '20260101000000.csv',
            submitted: 2,
            successful: 2,
            failed: 0,
          },
        },
        status: 200,
      })

      // When the user loads the page
      cy.visit('/police-data/ingestion-attempts/64d41bd9-5450-4bbb-89d4-42ba75659f49')

      const page = Page.verifyOnPage(PoliceDataIngestionAttemptPage)

      // Then the summary table should be populated
      page.summaryTable.shouldHaveColumns([
        'Status',
        'Police force area',
        'Batch',
        'Filename',
        'Matches',
        'Date',
        'Time',
      ])
      page.summaryTable.shouldHaveRows([
        ['Ingested', 'Cumbria', 'CMB20250710', '20260101000000.csv', '2', '17/03/2026', '11:33:38'],
      ])
      page.summaryTable.shouldNotHavePagination()

      // And the status should have the correct tags
      page.summaryTable.cell(0, 0).find('.govuk-tag').should('have.class', 'govuk-tag--green')

      // And the matches column should have the correct formatting
      page.summaryTable.cell(0, 4).should('not.have.class', 'table-cell--red table-cell--bold')
    })

    it('should display a failed ingestion', () => {
      // Given an API response containing an failed ingestion attempt
      cy.stubGetIngestionAttempt({
        ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
        response: {
          data: {
            ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
            ingestionStatus: 'FAILED',
            policeForceArea: '',
            batchId: '',
            matches: null,
            createdAt: '2026-03-17T11:33:38.483049',
            fileName: null,
            submitted: 0,
            successful: 0,
            failed: 0,
          },
        },
        status: 200,
      })

      // When the user loads the page
      cy.visit('/police-data/ingestion-attempts/64d41bd9-5450-4bbb-89d4-42ba75659f49')

      const page = Page.verifyOnPage(PoliceDataIngestionAttemptPage)

      // Then the summary table should be populated
      page.summaryTable.shouldHaveColumns([
        'Status',
        'Police force area',
        'Batch',
        'Filename',
        'Matches',
        'Date',
        'Time',
      ])
      page.summaryTable.shouldHaveRows([['Failed ingestion', 'N/A', 'Failed', 'N/A', 'N/A', '17/03/2026', '11:33:38']])
      page.summaryTable.shouldNotHavePagination()

      // And the status should have the correct tags
      page.summaryTable.cell(0, 0).find('.govuk-tag').should('have.class', 'govuk-tag--orange')

      // And the matches column should have the correct formatting
      page.summaryTable.cell(0, 4).should('have.class', 'table-cell--red table-cell--bold')
    })

    it('should display an errored ingestion ', () => {
      // Given an API response containing an errored ingestion attempt
      cy.stubGetIngestionAttempt({
        ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
        response: {
          data: {
            ingestionAttemptId: '904a7328-0817-449e-9124-7360c446d8ae',
            ingestionStatus: 'ERROR',
            policeForceArea: '',
            batchId: '',
            matches: null,
            createdAt: '2026-03-17T11:33:38.483028',
            fileName: '20260101000000.csv',
            submitted: 1,
            successful: 0,
            failed: 1,
          },
        },
        status: 200,
      })

      // When the user loads the page
      cy.visit('/police-data/ingestion-attempts/64d41bd9-5450-4bbb-89d4-42ba75659f49')

      const page = Page.verifyOnPage(PoliceDataIngestionAttemptPage)

      // Then the summary table should be populated
      page.summaryTable.shouldHaveColumns([
        'Status',
        'Police force area',
        'Batch',
        'Filename',
        'Matches',
        'Date',
        'Time',
      ])
      page.summaryTable.shouldHaveRows([
        ['Error', 'N/A', 'Failed', '20260101000000.csv', 'N/A', '17/03/2026', '11:33:38'],
      ])
      page.summaryTable.shouldNotHavePagination()

      // And the status should have the correct tags
      page.summaryTable.cell(0, 0).find('.govuk-tag').should('have.class', 'govuk-tag--red')

      // And the matches column should have the correct formatting
      page.summaryTable.cell(0, 4).should('have.class', 'table-cell--red table-cell--bold')
    })
  })
})
