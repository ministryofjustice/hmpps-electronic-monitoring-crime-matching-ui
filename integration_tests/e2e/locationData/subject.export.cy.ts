import path from 'path'
import SubjectPage from '../../pages/locationData/subject'
import Page from '../../pages/page'
import sampleLocations from './fixtures/sample-locations'
import { condensedReport, fullReport } from './fixtures/location-data-reports'

const deviceActivationId = '1'
const from = '2025-01-01T01:20:03.000Z'
const to = '2025-01-02T02:04:50.000Z'
const query = `from=${from}&to=${to}`
const url = `/location-data/device-activations/${deviceActivationId}?${query}`
const downloadsFolder = Cypress.config('downloadsFolder')

context('Location Data', () => {
  context('Export location data', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
      cy.stubMapMiddleware()
      cy.stubGetDeviceActivation()
      cy.stubGetDeviceActivationPositions({
        status: 200,
        deviceActivationId,
        query: 'from=\\S+&to=\\S+&geolocationMechanism=GPS',
        response: sampleLocations,
      })
      cy.stubGetPerson()
    })

    it('should have condensed selected by default', () => {
      // Visit the subject page with a valid url
      cy.visit(url)

      const page = Page.verifyOnPage(SubjectPage)

      page.map.sidebar.exportForm.reportTypeField.shouldHaveOptions(['condensed', 'full'])

      // Condensed should be the default
      page.map.sidebar.exportForm.reportTypeField.shouldHaveValue('condensed')
    })

    it('should allow the user to export a condensed report', () => {
      const expectedFileName = `location-data-123456789-${from.split(':').join('_')}-${to.split(':').join('_')}-condensed.csv`

      cy.visit(url)
      const page = Page.verifyOnPage(SubjectPage)

      page.map.sidebar.exportForm.fillInWith({ reportType: 'condensed' })
      page.map.sidebar.exportForm.exportButton.click()

      // Verify the report was downloaded
      cy.readFile(path.join(downloadsFolder, expectedFileName)).should('exist').should('eq', condensedReport)
    })

    it('should allow the user to export a full report', () => {
      const expectedFileName = `location-data-123456789-${from.split(':').join('_')}-${to.split(':').join('_')}-full.csv`

      cy.visit(url)
      const page = Page.verifyOnPage(SubjectPage)

      page.map.sidebar.exportForm.fillInWith({ reportType: 'full' })
      page.map.sidebar.exportForm.exportButton.click()

      // Verify the report was downloaded
      cy.readFile(path.join(downloadsFolder, expectedFileName)).should('exist').should('eq', fullReport)
    })

    it('should not allow the user to export data when the query parameters are invalid', () => {
      const invalidFromDate = '2025-00-00T00:00:00.000Z'
      const invalidToDate = '2025-00-00T00:00:00.000Z'
      const invalidQuery = `from=${invalidFromDate}&to=${invalidToDate}`

      // Visit the subject page with a valid url
      cy.visit(`/location-data/device-activations/${deviceActivationId}?${invalidQuery}`)

      const page = Page.verifyOnPage(SubjectPage)

      page.map.sidebar.exportForm.exportButton.should('be.disabled')
      page.map.sidebar.exportForm.reportTypeField.shouldBeDisabled()
    })
  })
})
