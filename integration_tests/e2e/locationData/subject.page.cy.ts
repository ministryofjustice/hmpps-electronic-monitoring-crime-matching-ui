import { fromLonLat } from 'ol/proj'
import { hubCaseworker } from '../../fixtures/auth'
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
      cy.task('stubSignIn', hubCaseworker)
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
      page.map.sidebar.analysisToggles.shouldBeChecked('pointsLayer')
      page.map.sidebar.analysisToggles.shouldNotBeChecked('confidenceLayer')
      page.map.sidebar.analysisToggles.shouldNotBeChecked('tracksLayer')
      page.map.sidebar.analysisToggles.shouldNotBeChecked('numberingLayer')
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
        second: '12',
      })
      page.map.sidebar.form.toDateField.shouldHaveValue({ date: '02/01/2025', hour: '02', minute: '04', second: '22' })
      page.map.sidebar.form.continueButton.should('be.disabled')
      page.map.sidebar.form.resetButton.should('be.disabled')
    })
  })
})

context('Interacting with the map', () => {
  let page: SubjectPage

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', hubCaseworker)
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

  it('should show the device position overlay', () => {
    const location = [0.060977, 51.574865]

    // When the map is ready
    page.map.mapInstance.then(map => {
      let canvas: HTMLCanvasElement

      // And the viewport + canvas are ready
      cy.wrap(null).should(() => {
        const viewport = map.getViewport()
        expect(viewport).to.not.equal(undefined)

        canvas = viewport.querySelector('canvas') as HTMLCanvasElement
        expect(canvas).to.not.equal(undefined)

        const rect = canvas.getBoundingClientRect()
        expect(rect.width).to.be.greaterThan(0)
        expect(rect.height).to.be.greaterThan(0)
      })

      // And the points layer exists
      const layer = map
        .getLayers()
        .getArray()
        .find(l => l.get('title') === 'pointsLayer')
      expect(layer).to.not.equal(undefined)

      // And the point is clickable on the map
      cy.wrap(null).should(() => {
        const coordinate = fromLonLat(location)
        const pixel = map.getPixelFromCoordinate(coordinate)

        expect(pixel).to.not.equal(undefined)

        const features = map.getFeaturesAtPixel(pixel, {
          layerFilter: l => l === layer,
        })

        expect(features.length).to.be.greaterThan(0)
      })

      // And position marker is clicked
      cy.window().then(window => {
        const coordinate = fromLonLat(location)
        const rect = canvas.getBoundingClientRect()
        const pixel = map.getPixelFromCoordinate(coordinate)

        const clientX = rect.left + pixel[0]
        const clientY = rect.top + pixel[1]

        const events = ['pointerdown', 'pointerup', 'click']

        events.forEach(type => {
          const event = new window.PointerEvent(type, {
            clientX,
            clientY,
            bubbles: true,
            cancelable: true,
            view: window,
          })

          canvas.dispatchEvent(event)
        })

        // Then the position overlay should be shown
        page.map.overlay.shouldBeVisible()
        page.map.overlay.shouldHaveTitle(
          '\n      Name (NOMIS ID): Jane Doe (Nomis 1")\n      Device ID: 123456789\n      Date of birth: 01/12/2000\n      Main address: 123 Street\n      Tag start date: 01/01/2025\n      Tag end date: \n    ',
        )
        page.map.overlay.shouldHaveNthRow(0, 'Confidence (m)', '100')
        page.map.overlay.shouldHaveNthRow(1, 'Speed (km/h)', '1')
        page.map.overlay.shouldHaveNthRow(2, 'Direction (degrees)', '237')
        page.map.overlay.shouldHaveNthRow(3, 'Geolocation mechanism', 'GPS')
        page.map.overlay.shouldHaveNthRow(4, 'Recorded date/time', '01/01/2025, 00:00:00')
        page.map.overlay.shouldHaveNthRow(5, 'Location (latitude, longitude)', '51.574865, 0.060977')
      })
    })
  })
})
