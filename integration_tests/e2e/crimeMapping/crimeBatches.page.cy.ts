import Page from '../../pages/page'
import CrimeBatchesPage from '../../pages/crimeMapping/crimeBatches'

const url = '/crime-mapping/crime-batches'

context('Crime Mapping', () => {
  context('Crime Batches', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should display the no result message when no search id in url', () => {
      cy.visit(url)
      const page = Page.verifyOnPage(CrimeBatchesPage)

      page.dataTable.shouldNotHaveResults()
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
      let page = Page.verifyOnPage(CrimeBatchesPage)

      // Submit a search
      page.form.fillInWith({ searchTerm: 'bar' })
      page.form.searchButton.click()

      // Verify still on page, with error message
      page = Page.verifyOnPage(CrimeBatchesPage)
      page.form.searchTermField.shouldHaveValue('bar')
    })

    it('should display an error if the api returns an error when getting a query', () => {
      // Stub the api to simulate a query being successfully created
      cy.stubCreateCrimeBatchesQuery()
      // Stub the api to simulate the query not being found
      cy.stubGetCrimeBatchesQuery({
        query: '.*',
        status: 404,
        response: 'Not found',
      })

      cy.visit(url)
      let page = Page.verifyOnPage(CrimeBatchesPage)

      // Submit a search
      page.form.fillInWith({ searchTerm: 'foo' })
      page.form.searchButton.click()

      // Verify still on page, with error message
      cy.url().should('include', '?queryId=1234')
      page = Page.verifyOnPage(CrimeBatchesPage)
      page.form.searchTermField.shouldHaveValue('foo')
    })
  })
})
