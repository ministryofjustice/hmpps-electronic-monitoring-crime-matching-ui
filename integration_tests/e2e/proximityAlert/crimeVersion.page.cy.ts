import { hubCaseworker } from '../../fixtures/auth'
import Page from '../../pages/page'
import CrimeVersionPage from '../../pages/proximityAlert/crimeVersion'
import {
  crimeVersionWithOneMatch,
  crimeVersionId,
  hubManager,
  crimeVersionWithZeroMatches,
  crimeVersionAwaitingMatching,
  crimeVersionWithManyMatches,
  crimeVersionWithLatestCrimeVersionId,
} from './fixtures'

context('Crime Version', () => {
  context('Viewing a crime version', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', hubCaseworker)
      cy.signIn()

      cy.stubMapMiddleware()
      cy.stubGetHubManagers({
        status: 200,
        response: {
          data: [hubManager],
        },
      })
    })

    it('should display a map showing crime version data with a match', () => {
      // Given an API response containing a crime version with a match
      cy.stubGetCrimeVersion({
        status: 200,
        crimeVersionId,
        response: {
          data: crimeVersionWithOneMatch,
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
      page.map.sidebar.shouldHaveVersionLabel('Latest version')
      page.map.sidebar.versionLabel.should('have.class', 'govuk-tag--green')
      page.map.sidebar.latestVersionLink.should('not.exist')
      page.map.sidebar.crimeToggle.shouldBeChecked('device-wearer-toggle')
      page.map.sidebar.crimeToggle.shouldHaveText('crimeRefAggravated Burglary')

      page.map.sidebar.crimeVersionSummaryList.shouldExist()
      page.map.sidebar.crimeVersionSummaryList.shouldHaveItem('From:', '01/01/2025 00:00')
      page.map.sidebar.crimeVersionSummaryList.shouldHaveItem('To:', '01/01/2025 01:00')
      page.map.sidebar.crimeVersionSummaryList.shouldHaveItem('Desc:', 'crimeText')

      // And the device wearer details
      page.map.sidebar.shouldHaveDeviceWearer('wearer-1', 'nomisId', '1', '1')

      // And the backlink should have the default value
      page.backLink.should('have.attr', 'href', '/proximity-alert')

      // And the expected audit message was sent
      cy.expectAuditEvents([
        {
          who: 'USER1',
          details: '{"params":{"crimeVersionId":"64d41bd9-5450-4bbb-89d4-42ba75659f49"},"query":{}}',
          what: 'PAGE_VIEW_PROXIMITY_ALERT_CRIME_VERSION',
          service: 'hmpps-electronic-monitoring-crime-matching-ui',
        },
      ])
    })

    it('should display a map showing crime version data when no devices were matched to the crime', () => {
      // Given an API response containing a crime version with no matches
      cy.stubGetCrimeVersion({
        status: 200,
        crimeVersionId,
        response: {
          data: crimeVersionWithZeroMatches,
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
      page.map.sidebar.shouldHaveVersionLabel('Latest version')
      page.map.sidebar.versionLabel.should('have.class', 'govuk-tag--green')
      page.map.sidebar.latestVersionLink.should('not.exist')
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
        crimeVersionId,
        response: {
          data: crimeVersionAwaitingMatching,
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
      page.map.sidebar.shouldHaveVersionLabel('Latest version')
      page.map.sidebar.versionLabel.should('have.class', 'govuk-tag--green')
      page.map.sidebar.latestVersionLink.should('not.exist')
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

    it('should display a map showing crime version data with a link to the latest crime version', () => {
      // Given an API response containing a crime version with a latest crime version id
      cy.stubGetCrimeVersion({
        status: 200,
        crimeVersionId,
        response: {
          data: crimeVersionWithLatestCrimeVersionId,
        },
      })

      // When the user loads the page
      cy.visit(`/proximity-alert/${crimeVersionId}?returnTo=%2Fproximity-alert%3FcrimeReference%3DCHS`)

      const page = Page.verifyOnPage(CrimeVersionPage)

      // Then the page should display the map and sidebar components
      page.map.shouldExist()
      page.map.sidebar.shouldExist()
      page.map.sidebar.shouldHaveProximityTabs()
      page.map.sidebar.reportsTab.shouldBeActive()
      page.map.sidebar.analysisTab.shouldNotBeActive()
      page.map.sidebar.shouldHaveProximityControls()

      // And the crime version details
      page.map.sidebar.shouldHaveVersionLabel('Version 1')
      page.map.sidebar.versionLabel.should('have.class', 'govuk-tag--grey')
      page.map.sidebar.latestVersionLink.should(
        'have.attr',
        'href',
        '/proximity-alert/b7e61168-f7ca-4056-8a2d-7db0fd77fb62',
      )
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
          data: crimeVersionWithManyMatches,
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
      page.map.sidebar.shouldHaveVersionLabel('Latest version')
      page.map.sidebar.versionLabel.should('have.class', 'govuk-tag--green')
      page.map.sidebar.latestVersionLink.should('not.exist')
      page.map.sidebar.crimeToggle.shouldBeChecked('device-wearer-toggle')
      page.map.sidebar.crimeToggle.shouldHaveText('crimeRefAggravated Burglary')

      page.map.sidebar.crimeVersionSummaryList.shouldExist()
      page.map.sidebar.crimeVersionSummaryList.shouldHaveItem('From:', '01/01/2025 00:00')
      page.map.sidebar.crimeVersionSummaryList.shouldHaveItem('To:', '01/01/2025 01:00')
      page.map.sidebar.crimeVersionSummaryList.shouldHaveItem('Desc:', 'crimeText')

      // And the device wearer details
      page.map.sidebar.shouldHaveDeviceWearer('wearer-1', 'nomisId', '1', '1')
      page.map.sidebar.shouldHaveDeviceWearer('wearer-2', 'nomisId2', '2', '1')
    })
  })
})
