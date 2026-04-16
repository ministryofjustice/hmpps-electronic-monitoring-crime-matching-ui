import Page from '../../pages/page'
import CrimeVersionPage from '../../pages/proximityAlert/crimeVersion'

const crimeVersionId = '64d41bd9-5450-4bbb-89d4-42ba75659f49'

context('Crime Version', () => {
  context('Viewing a crime version', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()

      cy.stubMapMiddleware()
    })

    it('should display a map showing crime version data with a match', () => {
      // Given an API response containing a crime version with a match
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
                  name: 'deviceName',
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
              ],
            },
          },
        },
      })

      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}`)

      const page = Page.verifyOnPage(CrimeVersionPage)

      // Then the page should display the map and sidebar components
      page.map.shouldExist()
      page.map.shouldNotHaveAlerts()
      page.map.sidebar.shouldExist()
      page.map.sidebar.shouldHaveProximityTabs()
      page.map.sidebar.reportsTab.shouldBeActive()
      page.map.sidebar.analysisTab.shouldNotBeActive()
      page.map.sidebar.shouldHaveProximityControls()

      // And the crime version details
      page.map.sidebar.shouldHaveVersionLabel('Latest Version')
      page.map.sidebar.crimeToggle.shouldBeChecked('device-wearer-toggle')
      page.map.sidebar.crimeToggle.shouldHaveText('crimeRefAggravated Burglary')

      page.map.sidebar.crimeVersionSummaryList.shouldExist()
      page.map.sidebar.crimeVersionSummaryList.shouldHaveItem('From:', '01/01/2025 00:00')
      page.map.sidebar.crimeVersionSummaryList.shouldHaveItem('To:', '01/01/2025 01:00')
      page.map.sidebar.crimeVersionSummaryList.shouldHaveItem('Desc:', 'crimeText')

      // And the device wearer details
      page.map.sidebar.shouldHaveDeviceWearer('deviceName', 'nomisId', '1', '1')

      // And the backlink should have the default value
      page.backLink.should('have.attr', 'href', '/proximity-alert')
    })

    it('should display a map showing crime version data when no devices were matched to the crime', () => {
      // Given an API response containing a crime version with no matches
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
              deviceWearers: [],
            },
          },
        },
      })

      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}?returnTo=%2Fproximity-alert%3FcrimeReference%3DCHS`)

      const page = Page.verifyOnPage(CrimeVersionPage)

      // Then the page should display the map and sidebar components
      page.map.shouldExist()
      page.map.shouldHaveAlert('information', 'No devices were matched to this crime.')
      page.map.sidebar.shouldExist()
      page.map.sidebar.shouldHaveProximityTabs()
      page.map.sidebar.reportsTab.shouldBeActive()
      page.map.sidebar.analysisTab.shouldNotBeActive()
      page.map.sidebar.shouldHaveProximityControls()

      // And the crime version details
      page.map.sidebar.shouldHaveVersionLabel('Latest Version')
      page.map.sidebar.crimeToggle.shouldBeChecked('device-wearer-toggle')
      page.map.sidebar.crimeToggle.shouldHaveText('crimeRefAggravated Burglary')

      page.map.sidebar.crimeVersionSummaryList.shouldExist()
      page.map.sidebar.crimeVersionSummaryList.shouldHaveItem('From:', '01/01/2025 00:00')
      page.map.sidebar.crimeVersionSummaryList.shouldHaveItem('To:', '01/01/2025 01:00')
      page.map.sidebar.crimeVersionSummaryList.shouldHaveItem('Desc:', 'crimeText')

      // And no device wearer details
      page.map.sidebar.shouldNotHaveDeviceWearer()
      page.map.sidebar.exportProximityAlertForm.shouldNotExist()

      // And the backlink should have the returnTo value
      page.backLink.should('have.attr', 'href', '/proximity-alert?crimeReference=CHS')
    })

    it('should display a map showing crime version data when matching has not happened yet', () => {
      // Given an API response containing a crime version with no matches
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
            matching: null,
          },
        },
      })

      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}?returnTo=%2Fproximity-alert%3FcrimeReference%3DCHS`)

      const page = Page.verifyOnPage(CrimeVersionPage)

      // Then the page should display the map and sidebar components
      page.map.shouldExist()
      page.map.shouldHaveAlert('warning', 'Matching for this crime has not occurred yet.')
      page.map.sidebar.shouldExist()
      page.map.sidebar.shouldHaveProximityTabs()
      page.map.sidebar.reportsTab.shouldBeActive()
      page.map.sidebar.analysisTab.shouldNotBeActive()
      page.map.sidebar.shouldHaveProximityControls()

      // And the crime version details
      page.map.sidebar.shouldHaveVersionLabel('Latest Version')
      page.map.sidebar.crimeToggle.shouldBeChecked('device-wearer-toggle')
      page.map.sidebar.crimeToggle.shouldHaveText('crimeRefAggravated Burglary')

      page.map.sidebar.crimeVersionSummaryList.shouldExist()
      page.map.sidebar.crimeVersionSummaryList.shouldHaveItem('From:', '01/01/2025 00:00')
      page.map.sidebar.crimeVersionSummaryList.shouldHaveItem('To:', '01/01/2025 01:00')
      page.map.sidebar.crimeVersionSummaryList.shouldHaveItem('Desc:', 'crimeText')

      // And no device wearer details
      page.map.sidebar.shouldNotHaveDeviceWearer()
      page.map.sidebar.exportProximityAlertForm.shouldNotExist()

      // And the backlink should have the returnTo value
      page.backLink.should('have.attr', 'href', '/proximity-alert?crimeReference=CHS')
    })

    it('should display a map showing crime version data with multiple matches', () => {
      // Given an API response containing a crime version with multiple matches
      cy.stubGetCrimeVersion({
        status: 200,
        crimeVersionId: '64d41bd9-5450-4bbb-89d4-42ba75659f50',
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
                  name: 'deviceName',
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
                  name: 'deviceName2',
                  deviceId: 2,
                  nomisId: 'nomisId2',
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

      // When the user loads the page
      cy.visit('/proximity-alert/64d41bd9-5450-4bbb-89d4-42ba75659f50')

      const page = Page.verifyOnPage(CrimeVersionPage)

      // Then the page should display the map and sidebar components
      page.map.shouldExist()
      page.map.shouldNotHaveAlerts()
      page.map.sidebar.shouldExist()
      page.map.sidebar.shouldHaveProximityTabs()
      page.map.sidebar.reportsTab.shouldBeActive()
      page.map.sidebar.analysisTab.shouldNotBeActive()
      page.map.sidebar.shouldHaveProximityControls()

      // And the crime version details
      page.map.sidebar.shouldHaveVersionLabel('Latest Version')
      page.map.sidebar.crimeToggle.shouldBeChecked('device-wearer-toggle')
      page.map.sidebar.crimeToggle.shouldHaveText('crimeRefAggravated Burglary')

      page.map.sidebar.crimeVersionSummaryList.shouldExist()
      page.map.sidebar.crimeVersionSummaryList.shouldHaveItem('From:', '01/01/2025 00:00')
      page.map.sidebar.crimeVersionSummaryList.shouldHaveItem('To:', '01/01/2025 01:00')
      page.map.sidebar.crimeVersionSummaryList.shouldHaveItem('Desc:', 'crimeText')

      // And the device wearer details
      page.map.sidebar.shouldHaveDeviceWearer('deviceName', 'nomisId', '1', '1')
      page.map.sidebar.shouldHaveDeviceWearer('deviceName2', 'nomisId2', '2', '1')
    })
  })
})
