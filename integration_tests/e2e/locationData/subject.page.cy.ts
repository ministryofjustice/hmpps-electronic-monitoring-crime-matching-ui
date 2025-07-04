import SubjectPage from '../../pages/locationData/subject'
import Page from '../../pages/page'

const personId = '1'
const url = `/location-data/${personId}`
const data = {
  locations: [
    {
      point: { latitude: 51.574865, longitude: 0.060977 },
      confidenceCircle: 100,
      direction: -2.155,
      geolocationMechanism: 1,
      locationRef: 1,
      speed: 1,
      timestamp: '',
    },
    {
      point: { latitude: 51.574153, longitude: 0.058536 },
      confidenceCircle: 400,
      direction: -1.734,
      geolocationMechanism: 1,
      locationRef: 2,
      speed: 10,
      timestamp: '',
    },
    {
      point: { latitude: 51.573248244162706, longitude: 0.05111371418603764 },
      confidenceCircle: 600,
      direction: 1.234,
      geolocationMechanism: 1,
      locationRef: 3,
      speed: 0,
      timestamp: '',
    },
    {
      point: { latitude: 51.574622, longitude: 0.048643 },
      confidenceCircle: 200,
      direction: 0.08,
      geolocationMechanism: 1,
      locationRef: 4,
      speed: 2,
      timestamp: '',
    },
    {
      point: { latitude: 51.57610341773559, longitude: 0.048391168020475 },
      confidenceCircle: 120,
      direction: -1.4,
      geolocationMechanism: 1,
      locationRef: 5,
      speed: 5,
      timestamp: '',
    },
    {
      point: { latitude: 51.576400900843375, longitude: 0.045439341454295505 },
      confidenceCircle: 50,
      direction: -0.784,
      geolocationMechanism: 1,
      locationRef: 6,
      speed: 6,
      timestamp: '',
    },
  ],
}

context('Location Data', () => {
  context('Viewing a subject', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should display a map showing the subjects locations', () => {
      cy.stubGetSubject({
        status: 200,
        personId,
        query: '',
        response: data,
      })
      cy.visit(url)

      const page = Page.verifyOnPage(SubjectPage)

      page.map.shouldExist()
      page.map.sidebar.shouldExist()
      page.map.sidebar.shouldHaveControls()
      page.map.sidebar.shouldNotHaveAlerts()

      // Initial state should be to show only the locations
      page.map.sidebar.showLocationToggle.shouldBeChecked()
      page.map.sidebar.showConfidenceCirclesToggle.shouldNotBeChecked()
      page.map.sidebar.showTracksToggle.shouldNotBeChecked()
    })

    it('should show an alert if no location data was returned from the api', () => {
      cy.stubGetSubject({
        status: 200,
        personId,
        query: '',
        response: {
          locations: [],
        },
      })
      cy.visit(url)

      const page = Page.verifyOnPage(SubjectPage)

      page.map.shouldExist()
      page.map.sidebar.shouldExist()
      page.map.sidebar.shouldNotHaveControls()
      page.map.sidebar.shouldHaveAlert('warning', 'No GPS Data for Dates and Times Selected')
    })
  })
})
