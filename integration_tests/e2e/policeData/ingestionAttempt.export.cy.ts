import path from 'path'
import Page from '../../pages/page'
import PoliceDataIngestionAttemptPage from '../../pages/policeData/ingestionAttempt'
import ErrorPage from '../../pages/error'

const downloadsFolder = Cypress.config('downloadsFolder')

context('Police Data Ingestion Attempt', () => {
  context('Exporting validation errors', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('resetDownloads', downloadsFolder)
      cy.task('stubSignIn')
      cy.signIn()
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
            crimesByCrimeType: [],
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
    })

    it('should export validation errors', () => {
      // When the user loads the page
      cy.visit('/police-data/ingestion-attempts/64d41bd9-5450-4bbb-89d4-42ba75659f49')

      const page = Page.verifyOnPage(PoliceDataIngestionAttemptPage)

      // And clicks the export button
      page.exportForm.exportButton.click()

      // Then a file should be downloaded
      cy.getDownloads(downloadsFolder)
        .then(files => files.at(0))
        .then(file => {
          cy.readFile(path.join(downloadsFolder, file)).should(
            'eq',
            '"Crime reference","Error type","Required action"\n"CR123456","Field must be a valid ENUM value","Amend crime type to a registered crime type"',
          )
        })
    })

    it('should show an error if the api returns an error', () => {
      // When the user loads the page
      cy.visit('/police-data/ingestion-attempts/64d41bd9-5450-4bbb-89d4-42ba75659f49')

      const page = Page.verifyOnPage(PoliceDataIngestionAttemptPage)

      // Override existing stub with failed API request
      cy.stubGetIngestionAttempt({
        ingestionAttemptId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
        status: 500,
        response: 'Internal Server Error',
      })

      // And clicks the export button
      page.exportForm.exportButton.click()

      // Then the user should be shown an error
      Page.verifyOnPage(ErrorPage, 'Internal Server Error')
    })
  })
})
