import Page from '../../pages/page'
import ErrorPage from '../../pages/error'
import SubjectsPage from '../../pages/locationData/subjects'

const url = '/location-data/subjects'

context('Location Data', () => {
  context('Subject Search - Error states', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should display a validation error if the api returns 400 when creating a query', () => {
      // Stub the api to simulate the create query request being rejected
      cy.stubCreateSubjectsQuery({
        status: 400,
        response: [{ field: 'name', message: 'You must enter a value for either Name or NOMIS ID' }],
      })

      cy.visit(url)
      let page = Page.verifyOnPage(SubjectsPage)

      // Submit a search
      page.form.searchButton.click()

      // Verify still on page, with error message
      page = Page.verifyOnPage(SubjectsPage)
      page.form.searchNameField.shouldHaveValidationMessage('You must enter a value for either Name or NOMIS ID')
    })

    it('should display an error if the api returns 500 when creating a query', () => {
      // Stub the api to simulate an error in the create query request
      cy.stubCreateSubjectsQuery({
        status: 500,
        response: 'Internal Server Error',
      })

      cy.visit(url)
      const page = Page.verifyOnPage(SubjectsPage)

      // Submit a search
      page.form.fillInWith({ name: 'foo' })
      page.form.searchButton.click()

      // User should be redirected to an error page
      Page.verifyOnPage(ErrorPage, 'Internal Server Error')
    })

    it('should display an error if the api cannot find the query', () => {
      // Stub the api to simulate a query being successfully created
      cy.stubCreateSubjectsQuery()
      // Stub the api to simulate the query not being found
      cy.stubGetSubjectsQuery({
        query: '.*',
        status: 404,
        response: 'Not Found',
      })

      cy.visit(url)
      const page = Page.verifyOnPage(SubjectsPage)

      // Submit a search
      page.form.fillInWith({ name: 'foo' })
      page.form.searchButton.click()

      // User should be redirected to an error page
      Page.verifyOnPage(ErrorPage, 'Not Found')
      cy.url().should('include', '?queryId=1234')
    })

    it('should display an error if the api returns 500 when getting the query', () => {
      // Stub the api to simulate a query being successfully created
      cy.stubCreateSubjectsQuery()
      // Stub the api to simulate an internal server error
      cy.stubGetSubjectsQuery({
        query: '.*',
        status: 500,
        response: 'Internal Server Error',
      })

      cy.visit(url)
      const page = Page.verifyOnPage(SubjectsPage)

      // Submit a search
      page.form.fillInWith({ name: 'foo' })
      page.form.searchButton.click()

      // User should be redirected to an error page
      Page.verifyOnPage(ErrorPage, 'Internal Server Error')
      cy.url().should('include', '?queryId=1234')
    })
  })
})
