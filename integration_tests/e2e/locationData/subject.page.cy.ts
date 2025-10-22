import SubjectPage from '../../pages/locationData/subject'
import Page from '../../pages/page'
import sampleLocations from './fixtures/sample-locations'

const deviceActivationId = '1'
const query = 'from=2025-01-01T01:20:03.000Z&to=2025-01-02T02:04:50.000Z&geolocationMechanism=GPS'
const url = `/location-data/device-activations/${deviceActivationId}?${query}`

context('Location Data', () => {
  context('Viewing a device activation', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()

      cy.stubMapMiddleware()
    })

    it('should display a map showing the subjects locations', () => {
      cy.stubGetDeviceActivation()
      cy.stubGetDeviceActivationPositions({
        status: 200,
        deviceActivationId,
        query,
        response: sampleLocations,
      })
      cy.stubGetPerson()
      cy.visit(url)

      const page = Page.verifyOnPage(SubjectPage)

      page.map.shouldExist()
      page.map.shouldNotHaveAlerts()
      page.map.sidebar.shouldExist()
      page.map.sidebar.shouldHaveTabs()
      page.map.sidebar.timeTab.shouldBeActive()
      page.map.sidebar.analysisTab.shouldNotBeActive()
      page.map.sidebar.shouldHaveControls()

      // Ensure the form is populated from query params if no form data
      page.map.sidebar.form.fromDateField.shouldHaveValue({
        date: '01/01/2025',
        hour: '01',
        minute: '20',
        second: '03',
      })
      page.map.sidebar.form.toDateField.shouldHaveValue({ date: '02/01/2025', hour: '02', minute: '04', second: '50' })

      // Initial state should be to show only the locations
      page.map.sidebar.showLocationToggle.shouldBeChecked()
      page.map.sidebar.showConfidenceCirclesToggle.shouldNotBeChecked()
      page.map.sidebar.showTracksToggle.shouldNotBeChecked()
      page.map.sidebar.showLocationNumberingToggle.shouldNotBeChecked()
    })

    it('should show an alert if no location data was returned from the api', () => {
      cy.stubGetDeviceActivation()
      cy.stubGetDeviceActivationPositions({
        status: 200,
        deviceActivationId,
        query,
        response: {
          data: [],
        },
      })
      cy.stubGetPerson()
      cy.visit(url)

      const page = Page.verifyOnPage(SubjectPage)

      page.map.shouldExist()
      page.map.shouldHaveAlert('warning', 'No GPS Data for Dates and Times Selected')
      page.map.sidebar.shouldExist()
      page.map.sidebar.shouldHaveTabs()
      page.map.sidebar.shouldHaveControls()
      page.map.sidebar.timeTab.shouldBeActive()
      page.map.sidebar.analysisTab.shouldNotBeActive()

      // Ensure the form is populated from query params if no form data
      page.map.sidebar.form.fromDateField.shouldHaveValue({
        date: '01/01/2025',
        hour: '01',
        minute: '20',
        second: '03',
      })
      page.map.sidebar.form.toDateField.shouldHaveValue({ date: '02/01/2025', hour: '02', minute: '04', second: '50' })
    })

    it('should display the current date times using Europe/London locale if the date is in BST', () => {
      cy.stubGetDeviceActivation()
      cy.stubGetDeviceActivationPositions({
        status: 200,
        deviceActivationId,
        query: 'from=\\S+&to=\\S+&geolocationMechanism=GPS',
        response: sampleLocations,
      })
      cy.stubGetPerson()

      const fromDateUTC = '2025-08-01T09:00:00.000Z'
      const toDateUTC = '2025-08-01T23:59:00.000Z'

      cy.visit(`/location-data/device-activations/${deviceActivationId}?from=${fromDateUTC}&to=${toDateUTC}`)

      const page = Page.verifyOnPage(SubjectPage)

      page.map.shouldExist()
      page.map.sidebar.shouldExist()
      page.map.sidebar.form.fromDateField.shouldHaveValue({
        date: '01/08/2025',
        hour: '10',
        minute: '00',
        second: '00',
      })
      page.map.sidebar.form.toDateField.shouldHaveValue({ date: '02/08/2025', hour: '00', minute: '59', second: '00' })
    })

    it('should reset the date filter form', () => {
      cy.stubGetDeviceActivation()
      cy.stubGetDeviceActivationPositions({
        status: 200,
        deviceActivationId,
        query,
        response: sampleLocations,
      })
      cy.stubGetPerson()
      cy.visit(url)

      const page = Page.verifyOnPage(SubjectPage)

      // Make sure the form is populated from query params
      page.map.sidebar.form.fromDateField.shouldHaveValue({
        date: '01/01/2025',
        hour: '01',
        minute: '20',
        second: '03',
      })
      page.map.sidebar.form.toDateField.shouldHaveValue({ date: '02/01/2025', hour: '02', minute: '04', second: '50' })
      page.map.sidebar.form.resetButton.should('be.disabled')

      // Fill in the form with new values
      page.map.sidebar.form.fillInWith({
        fromDate: {
          date: '10/02/2025',
          hour: '10',
          minute: '11',
          second: '12',
        },
        toDate: {
          date: '11/02/2025',
          hour: '20',
          minute: '21',
          second: '22',
        },
      })

      // Make sure the form was filled in correctly
      page.map.sidebar.form.fromDateField.shouldHaveValue({
        date: '10/02/2025',
        hour: '10',
        minute: '11',
        second: '12',
      })
      page.map.sidebar.form.toDateField.shouldHaveValue({ date: '11/02/2025', hour: '20', minute: '21', second: '22' })

      // Reset the form
      page.map.sidebar.form.resetButton.should('not.be.disabled')
      page.map.sidebar.form.resetButton.click()

      // Make sure the form was reset to initial values
      page.map.sidebar.form.fromDateField.shouldHaveValue({
        date: '01/01/2025',
        hour: '01',
        minute: '20',
        second: '03',
      })
      page.map.sidebar.form.toDateField.shouldHaveValue({ date: '02/01/2025', hour: '02', minute: '04', second: '50' })
      page.map.sidebar.form.continueButton.should('be.disabled')
      page.map.sidebar.form.resetButton.should('be.disabled')
    })
  })
})

context('Interacting with the map', () => {
  let page: SubjectPage

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.stubMapMiddleware()
    cy.stubGetDeviceActivation()
    cy.stubGetDeviceActivationPositions({
      status: 200,
      deviceActivationId,
      query,
      response: sampleLocations,
    })
    cy.stubGetPerson()

    cy.visit(url)

    page = Page.verifyOnPage(SubjectPage)
    page.map.shouldExist()
    page.map.sidebar.shouldExist()
    page.map.sidebar.shouldHaveTabs()
  })

  it('adds the expected layers for subject maps', () => {
    page.map.mapInstance.then(map => {
      const layerTitles = map.getAllLayers().map(l => l.get('title'))
      expect(layerTitles).to.include.members(['pointsLayer', 'tracksLayer', 'numberingLayer', 'confidenceLayer'])
    })
  })
})
