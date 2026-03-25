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
            crimesByCrimeType: [{ crimeType: 'BIAD', submitted: 2, failed: 0, successful: 2 }],
            validationErrors: [],
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

      // And the crime breakdown table should be populated
      page.crimeBreakdownTable.shouldHaveColumns(['Crime type', 'Submitted', 'Ingested', 'Failed validation'])
      page.crimeBreakdownTable.shouldHaveRows([
        ['Total', '2', '2', '0'],
        ['Missing', '0', '0', '0'],
        ['BIAD - Burglary in a dwelling', '2', '2', '0'],
        ['BOTD - Burglary in a building other than a dwelling', '0', '0', '0'],
        ['RB - Robbery', '0', '0', '0'],
        ['TFMV - Theft from motor vehicle', '0', '0', '0'],
        ['TFP - Theft from person', '0', '0', '0'],
        ['TOMV - Theft of motor vehicle', '0', '0', '0'],
      ])

      // And the validation errors table should not exist
      cy.get(`.datatable.ingestion-attempt-validation-errors-table`).should('not.exist')

      // And the failed validation section should not exist
      page.failedIngestionSection.should('not.exist')

      // And the backlink should have the default value
      page.backLink.should('have.attr', 'href', '/police-data/dashboard')
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
            crimesByCrimeType: [{ crimeType: 'RB', submitted: 2, failed: 0, successful: 2 }],
            validationErrors: [],
          },
        },
        status: 200,
      })

      // When the user loads the page
      cy.visit(
        '/police-data/ingestion-attempts/64d41bd9-5450-4bbb-89d4-42ba75659f49?returnTo=%2Fpolice-data%2Fdashboard%3FbatchId%3DS',
      )

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

      // And the crime breakdown table should be populated
      page.crimeBreakdownTable.shouldHaveColumns(['Crime type', 'Submitted', 'Ingested', 'Failed validation'])
      page.crimeBreakdownTable.shouldHaveRows([
        ['Total', '2', '2', '0'],
        ['Missing', '0', '0', '0'],
        ['BIAD - Burglary in a dwelling', '0', '0', '0'],
        ['BOTD - Burglary in a building other than a dwelling', '0', '0', '0'],
        ['RB - Robbery', '2', '2', '0'],
        ['TFMV - Theft from motor vehicle', '0', '0', '0'],
        ['TFP - Theft from person', '0', '0', '0'],
        ['TOMV - Theft of motor vehicle', '0', '0', '0'],
      ])

      // And the validation errors table should not exist
      cy.get(`.datatable.ingestion-attempt-validation-errors-table`).should('not.exist')

      // And the failed validation section should not exist
      page.failedIngestionSection.should('not.exist')

      // And the backlink should have the returnTo value
      page.backLink.should('have.attr', 'href', '/police-data/dashboard?batchId=S')
    })

    it('should display a partially successful ingestion', () => {
      // Given an API response containing an successful ingestion attempt
      cy.stubGetIngestionAttempt({
        ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
        response: {
          data: {
            ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
            ingestionStatus: 'PARTIAL',
            policeForceArea: 'NORTH_WALES',
            batchId: 'CMB20250710',
            matches: null,
            createdAt: '2026-03-17T11:33:38.483121',
            fileName: '20260101000000.csv',
            submitted: 101,
            successful: 100,
            failed: 1,
            crimesByCrimeType: [
              { crimeType: 'BIAD', submitted: 13, failed: 0, successful: 13 },
              { crimeType: 'RB', submitted: 17, failed: 0, successful: 17 },
              { crimeType: 'TOMV', submitted: 20, failed: 0, successful: 20 },
              { crimeType: 'TFP', submitted: 12, failed: 0, successful: 12 },
              { crimeType: 'TFMV', submitted: 12, failed: 0, successful: 12 },
              { crimeType: 'AB', submitted: 13, failed: 0, successful: 13 },
              { crimeType: 'BOTD', submitted: 13, failed: 0, successful: 13 },
              { crimeType: 'MISSING', submitted: 1, failed: 1, successful: 0 },
            ],
            validationErrors: [
              {
                crimeReference: 'CR123456',
                errorType: 'Field must be a valid ENUM value',
                requiredAction: 'Amend crime type to a registered crime type',
              },
            ],
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
        [
          'Partially ingested',
          'North Wales',
          'CMB20250710',
          '20260101000000.csv',
          'In progress',
          '17/03/2026',
          '11:33:38',
        ],
      ])
      page.summaryTable.shouldNotHavePagination()

      // And the status should have the correct tags
      page.summaryTable.cell(0, 0).find('.govuk-tag').should('have.class', 'govuk-tag--yellow')

      // And the matches column should have the correct formatting
      page.summaryTable.cell(0, 4).should('not.have.class', 'table-cell--red table-cell--bold')

      // And the crime breakdown table should be populated
      page.crimeBreakdownTable.shouldHaveColumns(['Crime type', 'Submitted', 'Ingested', 'Failed validation'])
      page.crimeBreakdownTable.shouldHaveRows([
        ['Total', '101', '100', '1'],
        ['Missing', '1', '0', '1'],
        ['BIAD - Burglary in a dwelling', '13', '13', '0'],
        ['BOTD - Burglary in a building other than a dwelling', '13', '13', '0'],
        ['RB - Robbery', '17', '17', '0'],
        ['TFMV - Theft from motor vehicle', '12', '12', '0'],
        ['TFP - Theft from person', '12', '12', '0'],
        ['TOMV - Theft of motor vehicle', '20', '20', '0'],
      ])

      // And the validation errors table should be populated
      page.validationErrorsTable.shouldHaveColumns(['Crime reference', 'Error type', 'Required action'])
      page.validationErrorsTable.shouldHaveRows([
        ['CR123456', 'Field must be a valid ENUM value', 'Amend crime type to a registered crime type'],
      ])

      // And the failed validation section should not exist
      page.failedIngestionSection.should('not.exist')
    })

    it('should display a failed ingestion', () => {
      // Given an API response containing an failed ingestion attempt
      cy.stubGetIngestionAttempt({
        ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
        response: {
          data: {
            ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
            ingestionStatus: 'FAILED',
            policeForceArea: 'CUMBRIA',
            batchId: '',
            matches: null,
            createdAt: '2026-03-17T11:33:38.483049',
            fileName: '20260316111111.csv',
            submitted: 0,
            successful: 0,
            failed: 0,
            crimesByCrimeType: [],
            validationErrors: [],
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
        ['Failed ingestion', 'Cumbria', 'Failed', '20260316111111.csv', 'N/A', '17/03/2026', '11:33:38'],
      ])
      page.summaryTable.shouldNotHavePagination()

      // And the status should have the correct tags
      page.summaryTable.cell(0, 0).find('.govuk-tag').should('have.class', 'govuk-tag--orange')

      // And the matches column should have the correct formatting
      page.summaryTable.cell(0, 4).should('have.class', 'table-cell--red table-cell--bold')

      // And the crime breakdown table should not exist
      cy.get(`.datatable.ingestion-attempt-crime-breakdown-table`).should('not.exist')

      // And the validation errors table should not exist
      cy.get(`.datatable.ingestion-attempt-validation-errors-table`).should('not.exist')

      // And the failed validation section should not exist
      page.failedIngestionSection.should('exist')
      page.failedIngestionSection
        .find('p')
        .invoke('text')
        .then(text => {
          expect(text.replace(/\s+/g, ' ').trim()).to.contain(
            'No crimes have been ingested. Please refer to email "MoJ Acquisitive Crime - Ingestion - Failure - 17/03/2026 / Cumbria / 20260316111111.csv" for details.',
          )
        })
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
            crimesByCrimeType: [{ crimeType: 'RB', submitted: 1, failed: 1, successful: 0 }],
            validationErrors: [
              {
                crimeReference: 'CR123456',
                errorType: 'Field must be a valid ENUM value',
                requiredAction: 'Amend crime type to a registered crime type',
              },
            ],
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

      // And the crime breakdown table should be populated
      page.crimeBreakdownTable.shouldHaveColumns(['Crime type', 'Submitted', 'Ingested', 'Failed validation'])
      page.crimeBreakdownTable.shouldHaveRows([
        ['Total', '1', '0', '1'],
        ['Missing', '0', '0', '0'],
        ['BIAD - Burglary in a dwelling', '0', '0', '0'],
        ['BOTD - Burglary in a building other than a dwelling', '0', '0', '0'],
        ['RB - Robbery', '1', '0', '1'],
        ['TFMV - Theft from motor vehicle', '0', '0', '0'],
        ['TFP - Theft from person', '0', '0', '0'],
        ['TOMV - Theft of motor vehicle', '0', '0', '0'],
      ])

      // And the validation errors table should be populated
      page.validationErrorsTable.shouldHaveColumns(['Crime reference', 'Error type', 'Required action'])
      page.validationErrorsTable.shouldHaveRows([
        ['CR123456', 'Field must be a valid ENUM value', 'Amend crime type to a registered crime type'],
      ])

      // And the failed validation section should not exist
      page.failedIngestionSection.should('not.exist')
    })
  })
})
