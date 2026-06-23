import Page from '../../pages/page'
import ErrorPage from '../../pages/error'
import PersonsPage from '../../pages/locationData/persons'
import { hubCaseworker } from '../../fixtures/auth'

const url = '/location-data/persons'

context('Location Data', () => {
  context('Persons Search - Error states', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', hubCaseworker)
      cy.signIn()
    })

    it('should display an error if the api returns 500 when getting the resources', () => {
      // Stub the api to simulate an internal server error
      cy.stubGetPersons({
        query: '.*',
        status: 500,
        response: 'Internal Server Error',
      })

      cy.visit(url)
      const page = Page.verifyOnPage(PersonsPage)

      // Submit a search
      page.form.fillInWith({ name: 'foo' })
      page.form.searchButton.click()

      // User should be redirected to an error page
      Page.verifyOnPage(ErrorPage, 'Internal Server Error')
      cy.url().should('include', '?searchField=name&searchTerm=foo')

      // And the expected audit message was sent
      cy.expectAuditEvents([
        {
          who: 'USER1',
          details: '{"params":{},"query":{"searchField":"name","searchTerm":"foo"}}',
          what: 'PAGE_VIEW_ATTEMPT_LOCATION_DATA_DEVICE_ACTIVATIONS',
          service: 'hmpps-electronic-monitoring-crime-matching-ui',
        },
      ])
    })

    it('should display an error if no valid search criteria values provided', () => {
      cy.stubGetPersons()

      cy.visit(url)
      let page = Page.verifyOnPage(PersonsPage)

      page.form.fillInWith({ name: ' ' })
      page.form.searchButton.click()

      // User should be redirected to an error page
      page = Page.verifyOnPage(PersonsPage)
      page.form.personsSearchField.shouldHaveValidationMessage('You must enter a value for Name, NOMIS ID or Device ID')
    })
  })
})
