import Page from '../../pages/page'
import CrimeBatchesPage from '../../pages/crimeMapping/crimeBatches'
import ErrorPage from '../../pages/error'

const url = '/crime-mapping/crime-batches'

context('Crime Mapping', () => {
  context('Crime Batches - Error States', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should display a validation error if the api returns 400 when creating a query', () => {
      // Stub the api to simulate the create query request being rejected
      cy.stubCreateCrimeBatchesQuery({
        status: 400,
        response: [{ field: 'searchTerm', message: 'Search term is required' }],
      })

      cy.visit(url)
      let page = Page.verifyOnPage(CrimeBatchesPage)

      // Submit a search
      page.form.fillInWith({ searchTerm: 'foo' })
      page.form.searchButton.click()

      // Verify still on page, with error message
      page = Page.verifyOnPage(CrimeBatchesPage)
      page.form.searchTermField.shouldHaveValidationMessage('Search term is required')
      page.form.searchTermField.shouldHaveValue('foo')
    })

    it('should display an error if the api returns 500 when creating a query', () => {
      // Stub the api to simulate an error in the create query request
      cy.stubCreateCrimeBatchesQuery({
        status: 500,
        response: 'Internal Server Error',
      })

      cy.visit(url)
      const page = Page.verifyOnPage(CrimeBatchesPage)

      // Submit a search
      page.form.fillInWith({ searchTerm: 'bar' })
      page.form.searchButton.click()

      // User should be redirected to an error page
      Page.verifyOnPage(ErrorPage, 'Internal Server Error')
    })

    it('should display an error if the api cannot find the query', () => {
      // Stub the api to simulate a query being successfully created
      cy.stubCreateCrimeBatchesQuery()
      // Stub the api to simulate the query not being found
      cy.stubGetCrimeBatchesQuery({
        query: '.*',
        status: 404,
        response: 'Not Found',
      })

      cy.visit(url)
      const page = Page.verifyOnPage(CrimeBatchesPage)

      // Submit a search
      page.form.fillInWith({ searchTerm: 'foo' })
      page.form.searchButton.click()

      // User should be redirected to an error page
      Page.verifyOnPage(ErrorPage, 'Not Found')
      cy.url().should('include', '?queryId=1234')
    })

    it('should display an error if the api returns 500 when getting the query', () => {
      // Stub the api to simulate a query being successfully created
      cy.stubCreateCrimeBatchesQuery()
      // Stub the api to simulate the query not being found
      cy.stubGetCrimeBatchesQuery({
        query: '.*',
        status: 500,
        response: 'Internal Server Error',
      })

      cy.visit(url)
      const page = Page.verifyOnPage(CrimeBatchesPage)

      // Submit a search
      page.form.fillInWith({ searchTerm: 'foo' })
      page.form.searchButton.click()

      // User should be redirected to an error page
      Page.verifyOnPage(ErrorPage, 'Internal Server Error')
      cy.url().should('include', '?queryId=1234')
    })
  })
})
