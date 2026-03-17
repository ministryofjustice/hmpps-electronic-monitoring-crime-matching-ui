import path from 'path'
import Page from '../../pages/page'
import PoliceDataDashboardPage from '../../pages/policeData/dashboard'
import expectedCrimeMatchingResultsCSV from './fixtures/crime-matching-results'
import ErrorPage from '../../pages/error'

const downloadsFolder = Cypress.config('downloadsFolder')

context('Police Data Dashboard', () => {
  context('Searching for ingestion attempts', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('resetDownloads', downloadsFolder)
      cy.task('stubSignIn')
      cy.signIn()
      cy.stubGetIngestionAttempts({
        status: 200,
        query: '',
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
          ],
          pageCount: 1,
          pageNumber: 0,
          pageSize: 30,
        },
      })
    })

    it('should export crime matching results', () => {
      // Given an API response with crime matching results
      cy.stubGetCrimeMatchingResults({
        query: '.*',
        status: 200,
        response: {
          data: [
            {
              policeForce: 'METROPOLITAN',
              batchId: 'MPS20260101',
              crimeRef: '01/12345/23',
              crimeType: 'BOTD',
              crimeDateTimeFrom: '2026-01-01T00:00:00.000Z',
              crimeDateTimeTo: '2026-01-01T01:00:00.000Z',
              crimeLatitude: 0.0,
              crimeLongitude: 0.0,
              crimeText: 'Description',
              deviceId: 1,
              deviceName: 'deviceName',
              subjectId: '123',
              subjectName: 'John Smith',
              subjectNomisId: 'nomisId',
              subjectPncRef: 'pncRef',
              subjectAddress: 'Street,City,Address',
              subjectDateOfBirth: '01/01/1970',
              subjectManager: '',
            },
          ],
        },
      })

      // When the user loads the page
      cy.visit('/police-data/dashboard')

      const page = Page.verifyOnPage(PoliceDataDashboardPage)

      // And selects a row
      page.dataTable.selectRow('3acc50a6-ecc4-4c40-8296-3fc8409c1765', 'checkbox')

      // And clicks the export button
      page.exportForm.exportButton.click()

      // Then a file should be downloaded
      cy.getDownloads(downloadsFolder)
        .then(files => files.at(0))
        .then(file => {
          cy.readFile(path.join(downloadsFolder, file)).should('eq', expectedCrimeMatchingResultsCSV)
        })
    })

    it('should show an error if the user doesnt select a row', () => {
      // When the user loads the page
      cy.visit('/police-data/dashboard')

      const page = Page.verifyOnPage(PoliceDataDashboardPage)

      // And clicks the export button
      page.exportForm.exportButton.click()

      // Then the user should be shown an error
      Page.verifyOnPage(ErrorPage, 'At least one batch must be selected for export.')
    })

    it('should show an error if the api returns no results', () => {
      // Given an API response no crime matching results
      cy.stubGetCrimeMatchingResults({
        query: '.*',
        status: 200,
        response: {
          data: [],
        },
      })

      // When the user loads the page
      cy.visit('/police-data/dashboard')

      const page = Page.verifyOnPage(PoliceDataDashboardPage)

      // And selects a row
      page.dataTable.selectRow('3acc50a6-ecc4-4c40-8296-3fc8409c1765', 'checkbox')

      // And clicks the export button
      page.exportForm.exportButton.click()

      // Then the user should be shown an error
      Page.verifyOnPage(ErrorPage, 'No results')
    })

    it('should show an error if the api returns an error', () => {
      // Given a failed API request
      cy.stubGetCrimeMatchingResults({
        query: '.*',
        status: 500,
        response: 'Internal Server Error',
      })

      // When the user loads the page
      cy.visit('/police-data/dashboard')

      const page = Page.verifyOnPage(PoliceDataDashboardPage)

      // And selects a row
      page.dataTable.selectRow('3acc50a6-ecc4-4c40-8296-3fc8409c1765', 'checkbox')

      // And clicks the export button
      page.exportForm.exportButton.click()

      // Then the user should be shown an error
      Page.verifyOnPage(ErrorPage, 'Internal Server Error')
    })
  })
})
