/* eslint-disable cypress/no-unnecessary-waiting */
import Map from 'ol/Map'
import BaseLayer from 'ol/layer/Base'
import Page from '../../pages/page'
import CrimeVersionPage from '../../pages/proximityAlert/crimeVersion'

const crimeVersionId = '64d41bd9-5450-4bbb-89d4-42ba75659f49'

const getTitle = (layer: BaseLayer): string => {
  const title = layer.get('title')

  if (title && typeof title === 'string') {
    return title
  }

  return ''
}

const getLayers = (map: Map, pattern: RegExp = /device-wearer-.*/): Array<{ title: string; visible: boolean }> => {
  return map
    .getAllLayers()
    .filter(layer => pattern.test(getTitle(layer)))
    .map(layer => ({ title: getTitle(layer), visible: layer.isVisible() }))
}

context('Crime Version', () => {
  context('Viewing a crime Version', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
      cy.stubMapMiddleware()
      cy.stubGetCrimeVersion({
        status: 200,
        crimeVersionId: '64d41bd9-5450-4bbb-89d4-42ba75659f49',
        response: {
          data: {
            crimeVersionId,
            crimeReference: 'crimeRef',
            crimeTypeDescription: 'Aggravated Burglary',
            crimeTypeId: 'AB',
            crimeDateTimeFrom: '2025-01-01T00:00:00Z',
            crimeDateTimeTo: '2025-01-01T01:00:00Z',
            crimeText: 'crimeText',
            longitude: 0,
            latitude: 0,
            versionLabel: 'Latest Version',
            matching: {
              deviceWearers: [
                {
                  name: 'wearer-1',
                  deviceId: 1,
                  nomisId: 'nomisId',
                  positions: [
                    {
                      latitude: 0,
                      longitude: 0,
                      sequenceLabel: 'A1',
                      confidence: 10,
                      capturedDateTime: '2025-01-01T00:00',
                    },
                  ],
                },
                {
                  name: 'wearer-2',
                  deviceId: 2,
                  nomisId: 'nomisId',
                  positions: [
                    {
                      latitude: 0,
                      longitude: 0,
                      sequenceLabel: 'A1',
                      confidence: 10,
                      capturedDateTime: '2025-01-01T00:00',
                    },
                  ],
                },
              ],
            },
          },
        },
      })
    })

    it('should show numbers, circles, positions and hide tracks on page load', () => {
      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`)

      const page = Page.verifyOnPage(CrimeVersionPage)

      // And the map is ready
      page.map.mapInstance.then(map => {
        // Then the numbers, circles, positions layers should be shown
        expect(getLayers(map)).to.deep.eq([
          { title: 'device-wearer-tracks-1', visible: false },
          { title: 'device-wearer-labels-1', visible: true },
          { title: 'device-wearer-circles-1', visible: true },
          { title: 'device-wearer-positions-1', visible: true },
          { title: 'device-wearer-tracks-2', visible: false },
          { title: 'device-wearer-labels-2', visible: true },
          { title: 'device-wearer-circles-2', visible: true },
          { title: 'device-wearer-positions-2', visible: true },
        ])
      })
    })

    it('should hide all confidence circle layers', () => {
      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`)

      const page = Page.verifyOnPage(CrimeVersionPage)

      // And the map is ready
      page.map.mapInstance.then(map => {
        // And the user hides confidence circles layers
        page.map.sidebar.analysisTab.click()
        page.map.sidebar.analysisToggles.unselect('device-wearer-circles-')

        // Then the circles layers should be hidden
        cy.wait(100).then(() => {
          expect(getLayers(map)).to.deep.eq([
            { title: 'device-wearer-tracks-1', visible: false },
            { title: 'device-wearer-labels-1', visible: true },
            { title: 'device-wearer-circles-1', visible: false },
            { title: 'device-wearer-positions-1', visible: true },
            { title: 'device-wearer-tracks-2', visible: false },
            { title: 'device-wearer-labels-2', visible: true },
            { title: 'device-wearer-circles-2', visible: false },
            { title: 'device-wearer-positions-2', visible: true },
          ])
        })
      })
    })

    it('should hide all numbering layers', () => {
      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`)

      const page = Page.verifyOnPage(CrimeVersionPage)

      // And the map is ready
      page.map.mapInstance.then(map => {
        // And the user hides number layers
        page.map.sidebar.analysisTab.click()
        page.map.sidebar.analysisToggles.unselect('device-wearer-labels-')

        // Then the numbering layers should be hidden
        cy.wait(100).then(() => {
          expect(getLayers(map)).to.deep.eq([
            { title: 'device-wearer-tracks-1', visible: false },
            { title: 'device-wearer-labels-1', visible: false },
            { title: 'device-wearer-circles-1', visible: true },
            { title: 'device-wearer-positions-1', visible: true },
            { title: 'device-wearer-tracks-2', visible: false },
            { title: 'device-wearer-labels-2', visible: false },
            { title: 'device-wearer-circles-2', visible: true },
            { title: 'device-wearer-positions-2', visible: true },
          ])
        })
      })
    })

    it('should hide all device wearer layers for wearer-1', () => {
      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`)

      const page = Page.verifyOnPage(CrimeVersionPage)

      // And the map is ready
      page.map.mapInstance.then(map => {
        // And the user hides device wearer 1
        page.map.sidebar.deviceWearerToggles.unselect('device-wearer-1')

        // Then the device wearer 1 layers should be hidden
        cy.wait(100).then(() => {
          expect(getLayers(map)).to.deep.eq([
            { title: 'device-wearer-tracks-1', visible: false },
            { title: 'device-wearer-labels-1', visible: false },
            { title: 'device-wearer-circles-1', visible: false },
            { title: 'device-wearer-positions-1', visible: false },
            { title: 'device-wearer-tracks-2', visible: false },
            { title: 'device-wearer-labels-2', visible: true },
            { title: 'device-wearer-circles-2', visible: true },
            { title: 'device-wearer-positions-2', visible: true },
          ])
        })
      })
    })

    it('should hide all device wearer labels for wearer-2', () => {
      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`)

      const page = Page.verifyOnPage(CrimeVersionPage)

      // And the map is ready
      page.map.mapInstance.then(map => {
        // And the user hides device wearer 2
        page.map.sidebar.deviceWearerToggles.unselect('device-wearer-2')

        // Then the device wearer 2 layers should be hidden
        cy.wait(100).then(() => {
          expect(getLayers(map)).to.deep.eq([
            { title: 'device-wearer-tracks-1', visible: false },
            { title: 'device-wearer-labels-1', visible: true },
            { title: 'device-wearer-circles-1', visible: true },
            { title: 'device-wearer-positions-1', visible: true },
            { title: 'device-wearer-tracks-2', visible: false },
            { title: 'device-wearer-labels-2', visible: false },
            { title: 'device-wearer-circles-2', visible: false },
            { title: 'device-wearer-positions-2', visible: false },
          ])
        })
      })
    })

    it('should show the tracks layer for device wearer 1', () => {
      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`)

      const page = Page.verifyOnPage(CrimeVersionPage)

      // And the map is ready
      page.map.mapInstance.then(map => {
        // And the user shows the tracks for device wearer 1
        page.map.sidebar.deviceWearerTrackToggles.select('device-wearer-tracks-1')

        // Then the device wearer 1 tracks should be shown
        cy.wait(100).then(() => {
          expect(getLayers(map)).to.deep.eq([
            { title: 'device-wearer-tracks-1', visible: true },
            { title: 'device-wearer-labels-1', visible: true },
            { title: 'device-wearer-circles-1', visible: true },
            { title: 'device-wearer-positions-1', visible: true },
            { title: 'device-wearer-tracks-2', visible: false },
            { title: 'device-wearer-labels-2', visible: true },
            { title: 'device-wearer-circles-2', visible: true },
            { title: 'device-wearer-positions-2', visible: true },
          ])
        })
      })
    })

    it('should show the tracks layer for device wearer 2', () => {
      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`)

      const page = Page.verifyOnPage(CrimeVersionPage)

      // And the map is ready
      page.map.mapInstance.then(map => {
        // And the user shows the tracks for device wearer 1
        page.map.sidebar.deviceWearerTrackToggles.select('device-wearer-tracks-2')

        // Then the device wearer 1 tracks should be shown
        cy.wait(100).then(() => {
          expect(getLayers(map)).to.deep.eq([
            { title: 'device-wearer-tracks-1', visible: false },
            { title: 'device-wearer-labels-1', visible: true },
            { title: 'device-wearer-circles-1', visible: true },
            { title: 'device-wearer-positions-1', visible: true },
            { title: 'device-wearer-tracks-2', visible: true },
            { title: 'device-wearer-labels-2', visible: true },
            { title: 'device-wearer-circles-2', visible: true },
            { title: 'device-wearer-positions-2', visible: true },
          ])
        })
      })
    })

    it('should only show the confidence circles for device wearer 1', () => {
      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`)

      const page = Page.verifyOnPage(CrimeVersionPage)

      // And the map is ready
      page.map.mapInstance.then(map => {
        // And the user hides the confidence circles
        page.map.sidebar.analysisTab.click()
        page.map.sidebar.analysisToggles.unselect('device-wearer-circles-')

        // And hides device wearer 2
        page.map.sidebar.reportsTab.click()
        page.map.sidebar.deviceWearerToggles.unselect('device-wearer-2')

        // And then shows the confidence circles
        page.map.sidebar.analysisTab.click()
        page.map.sidebar.analysisToggles.select('device-wearer-circles-')

        // Then the device wearer 2 circle layer should remain hidden
        cy.wait(100).then(() => {
          expect(getLayers(map)).to.deep.eq([
            { title: 'device-wearer-tracks-1', visible: false },
            { title: 'device-wearer-labels-1', visible: true },
            { title: 'device-wearer-circles-1', visible: true },
            { title: 'device-wearer-positions-1', visible: true },
            { title: 'device-wearer-tracks-2', visible: false },
            { title: 'device-wearer-labels-2', visible: false },
            { title: 'device-wearer-circles-2', visible: false },
            { title: 'device-wearer-positions-2', visible: false },
          ])
        })
      })
    })

    it('should only show the numbering layer for device wearer 1', () => {
      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`)

      const page = Page.verifyOnPage(CrimeVersionPage)

      // And the map is ready
      page.map.mapInstance.then(map => {
        // And the user hides the numbering layers
        page.map.sidebar.analysisTab.click()
        page.map.sidebar.analysisToggles.unselect('device-wearer-labels-')

        // And hides device wearer 2
        page.map.sidebar.reportsTab.click()
        page.map.sidebar.deviceWearerToggles.unselect('device-wearer-2')

        // And then shows the numbering layers
        page.map.sidebar.analysisTab.click()
        page.map.sidebar.analysisToggles.select('device-wearer-labels-')

        // Then the device wearer 2 circle layer should remain hidden
        cy.wait(100).then(() => {
          expect(getLayers(map)).to.deep.eq([
            { title: 'device-wearer-tracks-1', visible: false },
            { title: 'device-wearer-labels-1', visible: true },
            { title: 'device-wearer-circles-1', visible: true },
            { title: 'device-wearer-positions-1', visible: true },
            { title: 'device-wearer-tracks-2', visible: false },
            { title: 'device-wearer-labels-2', visible: false },
            { title: 'device-wearer-circles-2', visible: false },
            { title: 'device-wearer-positions-2', visible: false },
          ])
        })
      })
    })

    it('should hide and show all selected device wearer layers', () => {
      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`)

      const page = Page.verifyOnPage(CrimeVersionPage)

      // And the map is ready
      page.map.mapInstance.then(map => {
        // And the user hides all device wearer layers
        page.map.sidebar.crimeToggle.unselect('device-wearer-toggle')

        // Then the device wearer "include" toggles should be unchecked
        page.map.sidebar.deviceWearerToggles.shouldNotBeChecked('device-wearer-1')
        page.map.sidebar.deviceWearerToggles.shouldNotBeChecked('device-wearer-2')

        // Then the device wearer layers should be hidden
        cy.wait(100).then(() => {
          expect(getLayers(map)).to.deep.eq([
            { title: 'device-wearer-tracks-1', visible: false },
            { title: 'device-wearer-labels-1', visible: false },
            { title: 'device-wearer-circles-1', visible: false },
            { title: 'device-wearer-positions-1', visible: false },
            { title: 'device-wearer-tracks-2', visible: false },
            { title: 'device-wearer-labels-2', visible: false },
            { title: 'device-wearer-circles-2', visible: false },
            { title: 'device-wearer-positions-2', visible: false },
          ])
        })

        // And the user shows all device wearer layers
        page.map.sidebar.crimeToggle.select('device-wearer-toggle')

        // Then the device wearer "include" toggles should be unchecked
        page.map.sidebar.deviceWearerToggles.shouldBeChecked('device-wearer-1')
        page.map.sidebar.deviceWearerToggles.shouldBeChecked('device-wearer-2')

        // Then the device wearer layers should be shown
        cy.wait(100).then(() => {
          expect(getLayers(map)).to.deep.eq([
            { title: 'device-wearer-tracks-1', visible: false },
            { title: 'device-wearer-labels-1', visible: true },
            { title: 'device-wearer-circles-1', visible: true },
            { title: 'device-wearer-positions-1', visible: true },
            { title: 'device-wearer-tracks-2', visible: false },
            { title: 'device-wearer-labels-2', visible: true },
            { title: 'device-wearer-circles-2', visible: true },
            { title: 'device-wearer-positions-2', visible: true },
          ])
        })
      })
    })

    it('should sync the "select all" checkbox with the device wearer "include" checkboxes', () => {
      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`)

      const page = Page.verifyOnPage(CrimeVersionPage)

      // And unchecks one of the device wearer "include" layers
      page.map.sidebar.deviceWearerToggles.unselect('device-wearer-1')

      // Then the "select all" checkbox should be unchecked
      page.map.sidebar.crimeToggle.shouldNotBeChecked('device-wearer-toggle')

      // And when the user has selected all of the device wearer "include" layers
      page.map.sidebar.deviceWearerToggles.select('device-wearer-1')

      // Then the "select all" checkbox should be checked
      page.map.sidebar.crimeToggle.shouldBeChecked('device-wearer-toggle')
    })
  })
})
