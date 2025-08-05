import SubjectsPage from '../../pages/locationData/subjects'
import Page from '../../pages/page'

const url = '/location-data/subjects'

context('Location Data', () => {
  context('Subject Search', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should display the no result message when no search id in url', () => {
      cy.visit(url)
      const page = Page.verifyOnPage(SubjectsPage)

      page.dataTable.shouldNotHaveResults()
      page.dataTable.shouldNotHavePagination()
    })

    it('should display the no result message if the query returns no results', () => {
      cy.stubGetPersons()

      cy.visit(url)
      let page = Page.verifyOnPage(SubjectsPage)

      page.form.fillInWith({ nomisId: 'foo' })
      page.form.searchButton.click()

      cy.url().should('include', '?name=&nomisId=foo')
      page = Page.verifyOnPage(SubjectsPage)
      page.dataTable.shouldNotHaveResults()
      page.dataTable.shouldNotHavePagination()
      page.form.searchNameField.shouldHaveValue('')
      page.form.searchNomisIdField.shouldHaveValue('foo')
    })

    it('should display the query results if the query returned results', () => {
      cy.stubGetPersons({
        status: 200,
        query: '.*',
        response: {
          data: [
            {
              personId: '1',
              nomisId: 'Nomis 1',
              name: 'John',
              dateOfBirth: '2000-12-01T00:00:00.000Z',
              address: '123 Street',
              deviceActivations: [
                {
                  deviceActivationId: 123456,
                  deviceId: 123456,
                  personId: 123456,
                  deviceActivationDate: '2024-12-01T00:00:00.000Z',
                  deviceDeactivationDate: null,
                },
              ],
            },
            {
              personId: '2',
              nomisId: 'Nomis 2',
              name: 'Lee',
              dateOfBirth: '2000-12-01T00:00:00.000Z',
              address: '456 Avenue',
              deviceActivations: [
                {
                  deviceActivationId: 123456,
                  deviceId: 654321,
                  personId: 123456,
                  deviceActivationDate: '2024-12-01T00:00:00.000Z',
                  deviceDeactivationDate: '2024-12-01T00:00:00.000Z',
                },
              ],
            },
          ],
          pageCount: 1,
          pageNumber: 1,
          pageSize: 10,
        },
      })

      cy.visit(url)
      let page = Page.verifyOnPage(SubjectsPage)

      page.form.fillInWith({ name: 'foo' })
      page.form.searchButton.click()

      cy.url().should('include', '?name=foo&nomisId=')
      page = Page.verifyOnPage(SubjectsPage)
      page.dataTable.shouldHaveResults()
      page.dataTable.shouldHaveColumns([
        '',
        'NOMIS ID',
        'Name',
        'Date of Birth',
        'Address',
        'Device ID',
        'Tag Period Start',
        'Tag Period End',
      ])

      page.dataTable.shouldHaveRows([
        ['', 'Nomis 1', 'John', '01/12/2000 00:00', '123 Street', '123456', '01/12/2024 00:00', ''],
        ['', 'Nomis 2', 'Lee', '01/12/2000 00:00', '456 Avenue', '654321', '01/12/2024 00:00', '01/12/2024 00:00'],
      ])
      page.dataTable.shouldNotHavePagination()
      page.form.searchNameField.shouldHaveValue('foo')
      page.form.searchNomisIdField.shouldHaveValue('')
    })

    it('should display the second page of results if the user clicks the next page button', () => {
      // Stub the api to simulate the query returning the first page results
      cy.stubGetPersons({
        status: 200,
        query: '\\?name=foo&nomisId=&include_device_activations=true&page=1',
        response: {
          data: [
            {
              personId: '1',
              nomisId: 'Nomis 1',
              name: 'John',
              dateOfBirth: '2000-12-01T00:00:00.000Z',
              address: '123 Street',
              deviceActivations: [
                {
                  deviceActivationId: 123456,
                  deviceId: 123456,
                  personId: 123456,
                  deviceActivationDate: '2024-12-01T00:00:00.000Z',
                  deviceDeactivationDate: null,
                },
              ],
            },
          ],
          pageCount: 2,
          pageNumber: 1,
          pageSize: 10,
        },
      })
      // Stub the api to simulate the query returning the second page results
      cy.stubGetPersons({
        status: 200,
        query: '\\?name=foo&nomisId=&include_device_activations=true&page=2',
        response: {
          data: [
            {
              personId: '2',
              nomisId: 'Nomis 2',
              name: 'Lee',
              dateOfBirth: '2000-12-01T00:00:00.000Z',
              address: '456 Avenue',
              deviceActivations: [
                {
                  deviceActivationId: 123456,
                  deviceId: 654321,
                  personId: 123456,
                  deviceActivationDate: '2024-12-01T00:00:00.000Z',
                  deviceDeactivationDate: '2024-12-01T00:00:00.000Z',
                },
              ],
            },
          ],
          pageCount: 2,
          pageNumber: 2,
          pageSize: 10,
        },
      })

      cy.visit(url)
      let page = Page.verifyOnPage(SubjectsPage)

      // Submit a search
      page.form.fillInWith({ name: 'foo' })
      page.form.searchButton.click()

      // User should be shown the results
      cy.url().should('include', '?name=foo&nomisId=')
      page = Page.verifyOnPage(SubjectsPage)
      page.dataTable.shouldHaveResults()
      page.dataTable.shouldHaveColumns([
        '',
        'NOMIS ID',
        'Name',
        'Date of Birth',
        'Address',
        'Device ID',
        'Tag Period Start',
        'Tag Period End',
      ])
      page.dataTable.shouldHaveRows([
        ['', 'Nomis 1', 'John', '01/12/2000 00:00', '123 Street', '123456', '01/12/2024 00:00', ''],
      ])
      page.dataTable.shouldHavePagination()
      page.dataTable.pagination.shouldHaveCurrentPage('1')
      page.dataTable.pagination.shouldHaveNextButton()
      page.dataTable.pagination.shouldNotHavePrevButton()

      // Navigate to the next page
      page.dataTable.pagination.next.click()

      // User should be shown the second page of results
      cy.url().should('include', '?name=foo&nomisId=&page=2')
      page = Page.verifyOnPage(SubjectsPage)
      page.dataTable.shouldHaveResults()
      page.dataTable.shouldHaveRows([
        ['', 'Nomis 2', 'Lee', '01/12/2000 00:00', '456 Avenue', '654321', '01/12/2024 00:00', '01/12/2024 00:00'],
      ])
      page.dataTable.shouldHavePagination()
      page.dataTable.pagination.shouldHaveCurrentPage('2')
      page.dataTable.pagination.shouldNotHaveNextButton()
      page.dataTable.pagination.shouldHavePrevButton()
    })
  })
})
