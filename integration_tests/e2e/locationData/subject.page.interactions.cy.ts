/* eslint-disable cypress/no-unnecessary-waiting */
import Map from 'ol/Map'
import BaseLayer from 'ol/layer/Base'
import VectorSource from 'ol/source/Vector'
import { hubCaseworker } from '../../fixtures/auth'
import SubjectPage from '../../pages/locationData/subject'
import Page from '../../pages/page'
import { additionalSampleLocations } from './fixtures/sample-locations'

const deviceActivationId = '1'
const query = 'from=2025-01-01T01:20:03.000Z&to=2025-01-02T02:04:50.000Z'
const url = `/location-data/device-activations/${deviceActivationId}?${query}`

const includedLayers = new Set(['locationsLayer', 'confidenceLayer', 'tracksLayer', 'numberingLayer'])

const getLayers = (map: Map): Array<{ title: string; visible: boolean; positions: number }> => {
  return map
    .getAllLayers()
    .filter(layer => includedLayers.has(getTitle(layer)))
    .map(layer => {
      const source = layer.getSource() as VectorSource

      return {
        title: getTitle(layer),
        visible: layer.isVisible(),
        positions: source.getFeatures().length,
      }
    })
}

const getTitle = (layer: BaseLayer): string => {
  const title = layer.get('title')

  if (title && typeof title === 'string') {
    return title
  }

  return ''
}

context('Location Data', () => {
  context('Viewing a device activation', () => {
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
        response: additionalSampleLocations,
      })
      cy.stubGetPerson()
    })

    it('should show only the locations layer on page load', () => {
      // When the user loads the page
      cy.visit(url)

      const page = Page.verifyOnPage(SubjectPage)

      // And the map is ready
      page.map.mapInstance.then(map => {
        // Then only the locations layer should be shown
        expect(getLayers(map)).to.deep.eq([
          { title: 'locationsLayer', visible: true, positions: 6 },
          { title: 'confidenceLayer', visible: false, positions: 6 },
          { title: 'tracksLayer', visible: false, positions: 5 },
          { title: 'numberingLayer', visible: false, positions: 6 },
        ])
      })
    })

    it('should show the confidence layer', () => {
      cy.visit(url)

      const page = Page.verifyOnPage(SubjectPage)

      // And the map is ready
      page.map.mapInstance.then(map => {
        // And the user toggles the confidence layer
        page.map.sidebar.analysisTab.click()
        page.map.sidebar.analysisToggles.select('confidenceLayer')

        // Then only the locations layer should be shown
        cy.wait(100).then(() => {
          expect(getLayers(map)).to.deep.eq([
            { title: 'locationsLayer', visible: true, positions: 6 },
            { title: 'confidenceLayer', visible: true, positions: 6 },
            { title: 'tracksLayer', visible: false, positions: 5 },
            { title: 'numberingLayer', visible: false, positions: 6 },
          ])
        })
      })
    })

    it('should show the tracks layer', () => {
      cy.visit(url)

      const page = Page.verifyOnPage(SubjectPage)

      // And the map is ready
      page.map.mapInstance.then(map => {
        // And the user toggles the tracks layer
        page.map.sidebar.analysisTab.click()
        page.map.sidebar.analysisToggles.select('tracksLayer')

        // Then only the locations layer should be shown
        cy.wait(100).then(() => {
          expect(getLayers(map)).to.deep.eq([
            { title: 'locationsLayer', visible: true, positions: 6 },
            { title: 'confidenceLayer', visible: false, positions: 6 },
            { title: 'tracksLayer', visible: true, positions: 5 },
            { title: 'numberingLayer', visible: false, positions: 6 },
          ])
        })
      })
    })

    it('should show the numbering layer', () => {
      cy.visit(url)

      const page = Page.verifyOnPage(SubjectPage)

      // And the map is ready
      page.map.mapInstance.then(map => {
        // And the user toggles the numbering layer
        page.map.sidebar.analysisTab.click()
        page.map.sidebar.analysisToggles.select('numberingLayer')

        // Then only the locations layer should be shown
        cy.wait(100).then(() => {
          expect(getLayers(map)).to.deep.eq([
            { title: 'locationsLayer', visible: true, positions: 6 },
            { title: 'confidenceLayer', visible: false, positions: 6 },
            { title: 'tracksLayer', visible: false, positions: 5 },
            { title: 'numberingLayer', visible: true, positions: 6 },
          ])
        })
      })
    })

    it('the positions count for each layer should change when including non GNSS locations ', () => {
      cy.visit(url)

      const page = Page.verifyOnPage(SubjectPage)

      // And the map is ready
      page.map.mapInstance.then(map => {
        // And the layers display the correct initial positions count
        expect(getLayers(map)).to.deep.eq([
          { title: 'locationsLayer', visible: true, positions: 6 },
          { title: 'confidenceLayer', visible: false, positions: 6 },
          { title: 'tracksLayer', visible: false, positions: 5 },
          { title: 'numberingLayer', visible: false, positions: 6 },
        ])

        // And the user toggles the non GNSS locations
        page.map.sidebar.analysisTab.click()
        page.map.sidebar.analysisToggles.select('otherLocations')

        // Then the layers position counts should increase
        cy.wait(100).then(() => {
          expect(getLayers(map)).to.deep.eq([
            { title: 'locationsLayer', visible: true, positions: 9 },
            { title: 'confidenceLayer', visible: false, positions: 9 },
            { title: 'tracksLayer', visible: false, positions: 8 },
            { title: 'numberingLayer', visible: false, positions: 9 },
          ])
        })
      })
    })
  })
})
