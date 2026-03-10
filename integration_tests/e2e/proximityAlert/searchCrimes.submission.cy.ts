import Page from '../../pages/page'
import CrimeSearchPage from '../../pages/proximityAlert/crimeSearch'

context('Search Crimes', () => {
  context('Submitting the form', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should reload the page when the form is submitted with a police force area', () => {
      // Given an API response with no results
      cy.stubGetCrimeVersions()

      // When the user loads the page with no query params
      cy.visit('/proximity-alert')

      let page = Page.verifyOnPage(CrimeSearchPage)

      // And fills in the form
      page.searchForm.fillInWith({
        crimeReference: 'abc',
      })
      page.searchForm.searchButton.click()

      // Then the page should be reloaded with a new query
      page = Page.verifyOnPage(CrimeSearchPage)
      cy.url().should('contain', '?crimeReference=abc')
    })
  })
})
