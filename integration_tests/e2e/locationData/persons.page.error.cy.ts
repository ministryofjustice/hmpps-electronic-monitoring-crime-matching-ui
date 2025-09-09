import Page from '../../pages/page'
import ErrorPage from '../../pages/error'
import PersonsPage from '../../pages/locationData/persons'

const url = '/location-data/persons'

context('Location Data', () => {
  context('Persons Search - Error states', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
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
      cy.url().should('include', '?name=foo&nomisId=')
    })
  })
})
