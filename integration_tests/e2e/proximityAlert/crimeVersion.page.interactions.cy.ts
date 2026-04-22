/* eslint-disable cypress/no-unnecessary-waiting */
import Map from 'ol/Map'
import BaseLayer from 'ol/layer/Base'
import { fromLonLat, transform } from 'ol/proj'
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

const crimeLocation = [-2.528865717, 53.43157277]
const deviceLocation = [-2.5282, 53.43159]

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
            batchId: 'batch1',
            crimeTypeDescription: 'Aggravated Burglary',
            crimeTypeId: 'AB',
            crimeDateTimeFrom: '2025-01-01T00:00:00Z',
            crimeDateTimeTo: '2025-01-01T01:00:00Z',
            crimeText: 'crimeText',
            longitude: crimeLocation[0],
            latitude: crimeLocation[1],
            versionLabel: 'Latest Version',
            matching: {
              deviceWearers: [
                {
                  name: 'wearer-1',
                  deviceId: 1,
                  nomisId: 'nomisId',
                  positions: [
                    {
                      longitude: deviceLocation[0],
                      latitude: deviceLocation[1],
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
                      longitude: -2.528865717,
                      latitude: 53.43157277,
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

        // And the device wearer layers should be hidden
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

        // And the device wearer layers should be shown
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

    it('should focus the map to the crime radius', () => {
      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`)

      const page = Page.verifyOnPage(CrimeVersionPage)

      // And the map is ready
      page.map.mapInstance.then(map => {
        // Then the map should start zoomed out
        expect(map.getView().getZoom()).to.eq(16.5)

        // And when the user click the "view on map" link
        page.map.sidebar.viewOnMapLink.click()

        // The fit transition takes 500ms to should definitely be complete after 600ms
        cy.wait(600).then(() => {
          // Then the map should be focused on the crime
          const centre = transform(map.getView().getCenter()!, 'EPSG:3857', 'EPSG:4326')

          expect(centre[0]).to.be.closeTo(-2.528865717, 0.0000001)
          expect(centre[1]).to.be.closeTo(53.43157277, 0.0000001)
          expect(map.getView().getZoom()).to.be.closeTo(17.2, 0.1)
        })
      })
    })

    it('should show the crime overlay', () => {
      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`)

      const page = Page.verifyOnPage(CrimeVersionPage)

      // And the map is ready
      page.map.mapInstance.then(map => {
        cy.wait(100).then(() => {
          const canvas = map.getViewport().querySelector('canvas')!

          cy.window().then(window => {
            const coordinate = fromLonLat(crimeLocation)
            const rect = canvas.getBoundingClientRect()
            const pixel = map.getPixelFromCoordinate(coordinate)
            const clientX = rect.left + pixel[0]
            const clientY = rect.top + pixel[1]
            const events = ['pointerdown', 'pointerup', 'click']

            // And clicks the crime marker
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

            // Then the crime overlay should be shown
            page.map.overlay.shouldBeVisible()
            page.map.overlay.shouldHaveTitle('Crime Ref: crimeRef')
            page.map.overlay.shouldHaveNthRow(0, 'Crime Ref', 'crimeRef')
            page.map.overlay.shouldHaveNthRow(1, 'Crime Batch', 'batch1')
            page.map.overlay.shouldHaveNthRow(2, 'Location', '53.43157277, -2.528865717')
            page.map.overlay.shouldHaveNthRow(3, 'Crime Window', '01/01/2025 00:00 01/01/2025 01:00')
          })
        })
      })
    })

    it('should show the device position overlay', () => {
      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`)

      const page = Page.verifyOnPage(CrimeVersionPage)

      // And the map is ready
      page.map.mapInstance.then(map => {
        cy.wait(200).then(() => {
          const canvas = map.getViewport().querySelector('canvas')!

          cy.window().then(window => {
            const coordinate = fromLonLat(deviceLocation)
            const rect = canvas.getBoundingClientRect()
            const pixel = map.getPixelFromCoordinate(coordinate)
            const clientX = rect.left + pixel[0]
            const clientY = rect.top + pixel[1]
            const events = ['pointerdown', 'pointerup', 'click']

            // And clicks the crime marker
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

            // Then the crime overlay should be shown
            page.map.overlay.shouldBeVisible()
            page.map.overlay.shouldHaveTitle('Name (NOMIS ID): wearer-1 (nomisId)Device ID: 1')
            page.map.overlay.shouldHaveNthRow(0, 'Confidence (m)', '10')
            page.map.overlay.shouldHaveNthRow(1, 'Speed (km/h)', '0')
            page.map.overlay.shouldHaveNthRow(2, 'Direction (degrees)', '0')
            page.map.overlay.shouldHaveNthRow(3, 'Recorded Date', '01/01/2025 00:00')
            page.map.overlay.shouldHaveNthRow(4, 'Location', '53.43159, -2.5282')
          })
        })
      })
    })
  })
})
