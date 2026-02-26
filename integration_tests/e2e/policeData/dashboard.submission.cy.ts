import Page from '../../pages/page'
import PoliceDataDashboardPage from '../../pages/policeData/dashboard'

context('Police Data Dashboard', () => {
  context('Submitting the form', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should reload the page when the form is submitted with a police force area', () => {
      // Given an API response with no results
      cy.stubGetIngestionAttempts()

      // When the user loads the page with no query params
      cy.visit('/police-data/dashboard')

      let page = Page.verifyOnPage(PoliceDataDashboardPage)

      // And fills in the form
      page.searchForm.fillInWith({
        policeForceArea: 'METROPOLITAN',
      })
      page.searchForm.searchButton.click()

      // Then the page should be reloaded with a new query
      page = Page.verifyOnPage(PoliceDataDashboardPage)
      cy.url().should('contain', '?policeForceArea=METROPOLITAN')
    })

    it('should reload the page when the form is submitted with a batch id', () => {
      // Given an API response with no results
      cy.stubGetIngestionAttempts()

      // When the user loads the page with no query params
      cy.visit('/police-data/dashboard')

      let page = Page.verifyOnPage(PoliceDataDashboardPage)

      // And fills in the form
      page.searchForm.fillInWith({
        batchId: 'MPS20251110',
      })
      page.searchForm.searchButton.click()

      // Then the page should be reloaded with a new query
      page = Page.verifyOnPage(PoliceDataDashboardPage)
      cy.url().should('contain', '?batchId=MPS20251110')
    })

    it('should reload the page when the form is submitted with a from date', () => {
      // Given an API response with no results
      cy.stubGetIngestionAttempts()

      // When the user loads the page with no query params
      cy.visit('/police-data/dashboard')

      let page = Page.verifyOnPage(PoliceDataDashboardPage)

      // And fills in the form
      page.searchForm.fillInWith({
        fromDate: '1/10/2025',
      })
      page.searchForm.searchButton.click()

      // Then the page should be reloaded with a new query
      page = Page.verifyOnPage(PoliceDataDashboardPage)
      cy.url().should('contain', '?fromDate=1%2F10%2F2025')
    })

    it('should reload the page when the form is submitted with a to date', () => {
      // Given an API response with no results
      cy.stubGetIngestionAttempts()

      // When the user loads the page with no query params
      cy.visit('/police-data/dashboard')

      let page = Page.verifyOnPage(PoliceDataDashboardPage)

      // And fills in the form
      page.searchForm.fillInWith({
        toDate: '2/10/2025',
      })
      page.searchForm.searchButton.click()

      // Then the page should be reloaded with a new query
      page = Page.verifyOnPage(PoliceDataDashboardPage)
      cy.url().should('contain', '?toDate=2%2F10%2F2025')
    })

    it('should reload the page when the form is submitted with all fields', () => {
      // Given an API response with no results
      cy.stubGetIngestionAttempts()

      // When the user loads the page with no query params
      cy.visit('/police-data/dashboard')

      let page = Page.verifyOnPage(PoliceDataDashboardPage)

      // And fills in the form
      page.searchForm.fillInWith({
        batchId: 'MPS20251110',
        policeForceArea: 'METROPOLITAN',
        fromDate: '1/10/2025',
        toDate: '2/10/2025',
      })
      page.searchForm.searchButton.click()

      // Then the page should be reloaded with a new query
      page = Page.verifyOnPage(PoliceDataDashboardPage)
      cy.url().should(
        'contain',
        '?batchId=MPS20251110&policeForceArea=METROPOLITAN&fromDate=1%2F10%2F2025&toDate=2%2F10%2F2025',
      )
    })
  })
})
