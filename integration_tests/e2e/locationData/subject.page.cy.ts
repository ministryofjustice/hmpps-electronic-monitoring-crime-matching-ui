import BaseLayer from 'ol/layer/Base'
import VectorLayer from 'ol/layer/Vector'
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
      sequenceNumber: 1,
    },
    {
      point: { latitude: 51.574153, longitude: 0.058536 },
      confidenceCircle: 400,
      direction: -1.734,
      geolocationMechanism: 1,
      locationRef: 2,
      speed: 10,
      timestamp: '',
      sequenceNumber: 2,
    },
    {
      point: { latitude: 51.573248244162706, longitude: 0.05111371418603764 },
      confidenceCircle: 600,
      direction: 1.234,
      geolocationMechanism: 1,
      locationRef: 3,
      speed: 0,
      timestamp: '',
      sequenceNumber: 3,
    },
    {
      point: { latitude: 51.574622, longitude: 0.048643 },
      confidenceCircle: 200,
      direction: 0.08,
      geolocationMechanism: 1,
      locationRef: 4,
      speed: 2,
      timestamp: '',
      sequenceNumber: 4,
    },
    {
      point: { latitude: 51.57610341773559, longitude: 0.048391168020475 },
      confidenceCircle: 120,
      direction: -1.4,
      geolocationMechanism: 1,
      locationRef: 5,
      speed: 5,
      timestamp: '',
      sequenceNumber: 5,
    },
    {
      point: { latitude: 51.576400900843375, longitude: 0.045439341454295505 },
      confidenceCircle: 50,
      direction: -0.784,
      geolocationMechanism: 1,
      locationRef: 6,
      speed: 6,
      timestamp: '',
      sequenceNumber: 6,
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
      page.map.shouldNotHaveAlerts()
      page.map.sidebar.shouldExist()
      page.map.sidebar.shouldHaveTabs()
      page.map.sidebar.timeTab.shouldBeActive()
      page.map.sidebar.analysisTab.shouldNotBeActive()
      page.map.sidebar.shouldHaveControls()

      // Initial state should be to show only the locations
      page.map.sidebar.showLocationToggle.shouldBeChecked()
      page.map.sidebar.showConfidenceCirclesToggle.shouldNotBeChecked()
      page.map.sidebar.showTracksToggle.shouldNotBeChecked()
      page.map.sidebar.showLocationNumberingToggle.shouldNotBeChecked()
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
      page.map.shouldHaveAlert('warning', 'No GPS Data for Dates and Times Selected')
      page.map.sidebar.shouldExist()
      page.map.sidebar.shouldHaveTabs()
      page.map.sidebar.shouldHaveControls()
      page.map.sidebar.timeTab.shouldBeActive()
      page.map.sidebar.analysisTab.shouldNotBeActive()
    })
  })

  context('Interacting with the map', () => {
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
      page.map.sidebar.shouldExist()
      page.map.sidebar.shouldHaveTabs()
    })

    it('should display the map with the correct layers and features', () => {
      page.map.mapInstance.then(map => {
        const confidenceLayer = map
          .getLayers()
          .getArray()
          .find((l: BaseLayer) => l.get('title') === 'confidenceLayer')
        const tracksLayerGroup = map
          .getLayers()
          .getArray()
          .find((l: BaseLayer) => l.get('title') === 'tracksLayer')
        const arrowsLayer = tracksLayerGroup
          .get('layers')
          .getArray()
          .find((l: BaseLayer) => l.get('title') === 'arrowsLayer')
        const linesLayer = tracksLayerGroup
          .get('layers')
          .getArray()
          .find((l: BaseLayer) => l.get('title') === 'linesLayer')
        const pointsLayer = map
          .getLayers()
          .getArray()
          .find((l: BaseLayer) => l.get('title') === 'pointsLayer') as VectorLayer
        const numberingLayer = map
          .getLayers()
          .getArray()
          .find((l: BaseLayer) => l.get('title') === 'numberingLayer')

        page.map.shouldHaveMapLayer(confidenceLayer, 'Confidence')
        page.map.shouldHaveMapLayer(arrowsLayer, 'Arrows')
        page.map.shouldHaveMapLayer(linesLayer, 'Lines')
        page.map.shouldHaveMapLayer(pointsLayer, 'Points')
        page.map.shouldHaveMapLayer(numberingLayer, 'Numbers')

        expect(pointsLayer.getSource().getFeatures().length).to.equal(data.locations.length)
      })
    })

    it('should show the overlay when a location-point feature is clicked', () => {
      page.map.element.should('have.attr', 'data-show-overlay', 'true')

      page.map.mapInstance.then(map => {
        const pointsLayer = map
          .getLayers()
          .getArray()
          .find((l: BaseLayer) => l.get('title') === 'pointsLayer') as VectorLayer

        const feature = pointsLayer.getSource().getFeatures()[0]
        expect(feature.get('type')).to.equal('location-point')

        const coordinate = feature.getGeometry().getCoordinates()

        cy.mapPostRenderComplete(map, () => {
          const pixel = map.getPixelFromCoordinate(coordinate)
          expect(pixel, 'pixel should be a valid coordinate').to.not.equal(null)

          const featureAtPixel = map.forEachFeatureAtPixel(pixel, f => f)
          expect(featureAtPixel, 'a feature should exist at the given pixel').to.not.equal(undefined)

          page.map.triggerPointerEventsAt(coordinate, map)
          page.map.shouldShowOverlay()
        })
      })
    })

    it('should hide the overlay when clicking on empty map space', () => {
      page.map.mapInstance.then(map => {
        const coordinate = [0, 0] // Will be empty here due to map padding

        cy.mapPostRenderComplete(map, () => {
          const pixel = map.getPixelFromCoordinate(coordinate)
          expect(pixel, 'pixel should be valid').to.not.equal(null)

          const featureAtPixel = map.forEachFeatureAtPixel(pixel, f => f)
          expect(featureAtPixel, 'no feature should be at this pixel').to.equal(undefined)

          page.map.triggerPointerEventsAt(coordinate, map)
          page.map.shouldNotShowOverlay()
        })
      })
    })

    it('should hide the overlay when map is clicked outside a feature', () => {
      page.map.mapInstance.then(map => {
        const pointsLayer = map
          .getLayers()
          .getArray()
          .find((l: BaseLayer) => l.get('title') === 'pointsLayer') as VectorLayer

        const feature = pointsLayer.getSource().getFeatures()[0]
        const coordinate = feature.getGeometry().getCoordinates()

        cy.mapPostRenderComplete(map, () => {
          page.map.triggerPointerEventsAt(coordinate, map)
          page.map.shouldShowOverlay()

          const emptyCoordinate = [0, 0] // Will be empty here due to map padding
          page.map.triggerPointerEventsAt(emptyCoordinate, map)
          page.map.shouldNotShowOverlay()
        })
      })
    })

    it('should hide the overlay when the close button is clicked', () => {
      page.map.mapInstance.then(map => {
        const pointsLayer = map
          .getLayers()
          .getArray()
          .find((l: BaseLayer) => l.get('title') === 'pointsLayer') as VectorLayer

        const feature = pointsLayer.getSource().getFeatures()[0]
        const coordinate = feature.getGeometry().getCoordinates()

        cy.mapPostRenderComplete(map, () => {
          page.map.triggerPointerEventsAt(coordinate, map)
          page.map.shouldShowOverlay()

          // Click the close button inside the overlay
          cy.get('.app-map__overlay-close').click()
          page.map.shouldNotShowOverlay()
        })
      })
    })

    it('should hide overlay when location toggle is turned off and stay hidden when turned back on', () => {
      page.map.mapInstance.then(map => {
        const pointsLayer = map
          .getLayers()
          .getArray()
          .find((l: BaseLayer) => l.get('title') === 'pointsLayer') as VectorLayer

        const feature = pointsLayer.getSource().getFeatures()[0]
        const coordinate = feature.getGeometry().getCoordinates()

        cy.mapPostRenderComplete(map, () => {
          page.map.triggerPointerEventsAt(coordinate, map)
          page.map.shouldShowOverlay()

          // Turn off location points
          page.map.sidebar.analysisTab.click()
          page.map.sidebar.analysisTab.shouldBeActive()
          page.map.sidebar.showLocationToggle.click()
          page.map.shouldNotShowOverlay()

          // Turn them back on
          page.map.sidebar.showLocationToggle.click()
          page.map.sidebar.showLocationToggle.shouldBeChecked()

          // Overlay should still NOT be visible
          page.map.shouldNotShowOverlay()
        })
      })
    })
  })
})
