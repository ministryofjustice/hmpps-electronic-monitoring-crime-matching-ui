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

context('Crime Mapping', () => {
  context('Visual Regression Checks', () => {
    let page: SubjectPage

    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
      cy.stubMapToken()
      cy.stubMapTiles()
      cy.stubGetSubject({ status: 200, personId, query: '', response: data })

      cy.visit(url)

      page = Page.verifyOnPage(SubjectPage)
      page.map.shouldExist()

      page.map.mapInstance.then(map => {
        cy.mapPostRenderComplete(map, () => {})
      })
    })

    it('Should display the map with only location features shown by default', () => {
      cy.compareSnapshot('crime-mapping-location-features-visible')
    })

    it('Should hide the locations when the checkbox is clicked', () => {
      cy.get('#locations').click()

      cy.compareSnapshot('crime-mapping-no-features-visible')
    })

    it('Should show the confidence circles when the checkbox is clicked', () => {
      cy.get('#confidence').click()

      cy.compareSnapshot('crime-mapping-confidence-features-visible')
    })

    it('Should show the tracks when the checkbox is clicked', () => {
      cy.get('#tracks').click()

      cy.compareSnapshot('crime-mapping-tracks-features-visible')
    })
  })
})
