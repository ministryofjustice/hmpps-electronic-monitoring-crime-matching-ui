import { hubCaseworker } from '../../fixtures/auth'
import ErrorPage from '../../pages/error'
import PersonsPage from '../../pages/locationData/persons'
import Page from '../../pages/page'

const url = '/location-data/persons'

context('Location Data', () => {
  context('Subject Location Search', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', hubCaseworker)
      cy.signIn()
    })

    it('should display an error message on date fields if invalid dates submitted', () => {
      cy.stubGetDeviceActivation()
      cy.stubGetPersons({
        status: 200,
        query: '.*',
        response: {
          data: [
            {
              personId: '1',
              nomisId: 'Nomis 1',
              pncRef: 'YY/NNNNNNND',
              name: 'John',
              dateOfBirth: '2000-12-01T00:00:00.000Z',
              address: '123 Street',
              probationPractitioner: 'John Smith',
              deviceActivations: [
                {
                  deviceActivationId: 1,
                  deviceId: 123456,
                  deviceName: '123456',
                  personId: '1',
                  deviceActivationDate: '2024-12-01T00:00:00.000Z',
                  deviceDeactivationDate: null,
                  orderStart: '2024-12-01T00:00:00.000Z',
                  orderEnd: '2024-12-31T00:00:00.000Z',
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
      let page = Page.verifyOnPage(PersonsPage)

      page.form.fillInWith({ name: 'foo' })
      page.form.searchButton.click()

      cy.url().should('include', '?searchField=name&searchTerm=foo')
      page = Page.verifyOnPage(PersonsPage)
      page.dataTable.shouldHaveResults()

      page.dataTable.selectRow('1')
      page.locationsForm.fillInWith({
        fromDate: { date: '01/08/2024', hour: ' ', minute: ' ', second: ' ' },
        toDate: undefined,
      })
      page.locationsForm.continueButton.click()

      page = Page.verifyOnPage(PersonsPage)
      page.dataTable.shouldHaveSelectedRow('1')
      page.locationsForm.fromDateField.shouldHaveValidationMessage('You must enter a valid value for date')
      page.locationsForm.toDateField.shouldHaveValidationMessage('You must enter a valid value for date')

      // And the expected audit message was sent
      cy.expectAuditEvents([
        {
          who: 'USER1',
          details:
            '{"params":{"deviceActivationId":1},"query":{"fromDate":{"date":"01/08/2024","hour":" ","minute":" "},"toDate":{"date":"","hour":"","minute":""}}}',
          what: 'SEARCH_LOCATION_DATA_DEVICE_ACTIVATION',
          service: 'hmpps-electronic-monitoring-crime-matching-ui',
        },
      ])
    })

    it('should display an error message if date range is from date is before device activation', () => {
      cy.stubGetDeviceActivation({
        deviceActivationId: '1',
        status: 200,
        response: {
          data: {
            deviceActivationId: 1,
            deviceId: 123456,
            deviceName: '123456',
            personId: '1',
            deviceActivationDate: '2024-12-01T00:00:00.000Z',
            deviceDeactivationDate: '2024-12-02T00:00:00.000Z',
            orderStart: '2024-12-01T00:00:00.000Z',
            orderEnd: '2024-12-31T00:00:00.000Z',
          },
        },
      })
      cy.stubGetPersons({
        status: 200,
        query: '.*',
        response: {
          data: [
            {
              personId: '1',
              nomisId: 'Nomis 1',
              pncRef: 'YY/NNNNNNND',
              name: 'John',
              dateOfBirth: '2000-12-01T00:00:00.000Z',
              address: '123 Street',
              probationPractitioner: 'John Smith',
              deviceActivations: [
                {
                  deviceActivationId: 1,
                  deviceId: 123456,
                  deviceName: '123456',
                  personId: '1',
                  deviceActivationDate: '2024-12-01T00:00:00.000Z',
                  deviceDeactivationDate: '2024-12-02T00:00:00.000Z',
                  orderStart: '2024-12-01T00:00:00.000Z',
                  orderEnd: '2024-12-31T00:00:00.000Z',
                },
              ],
            },
          ],
          pageCount: 1,
          pageNumber: 1,
          pageSize: 10,
        },
      })

      const fromDate = { date: '01/08/2024', hour: '09', minute: '00', second: '00' }
      const toDate = { date: '02/08/2024', hour: '09', minute: '00', second: '00' }

      cy.visit(url)
      let page = Page.verifyOnPage(PersonsPage)

      page.form.fillInWith({ name: 'foo' })
      page.form.searchButton.click()

      cy.url().should('include', '?searchField=name&searchTerm=foo')
      page = Page.verifyOnPage(PersonsPage)
      page.dataTable.shouldHaveResults()

      page.dataTable.selectRow('1')
      page.locationsForm.fillInWith({ fromDate, toDate })
      page.locationsForm.continueButton.click()

      page = Page.verifyOnPage(PersonsPage)
      page.dataTable.shouldHaveSelectedRow('1')
      page.locationsForm.fromDateField.shouldHaveValidationMessage('Update date to inside tag period')
    })

    it('should display an error message if date range is to date is after device deactivation', () => {
      cy.stubGetDeviceActivation({
        deviceActivationId: '1',
        status: 200,
        response: {
          data: {
            deviceActivationId: 1,
            deviceId: 123456,
            deviceName: '123456',
            personId: '1',
            deviceActivationDate: '2024-12-01T00:00:00.000Z',
            deviceDeactivationDate: '2024-12-02T00:00:00.000Z',
            orderStart: '2024-12-01T00:00:00.000Z',
            orderEnd: '2024-12-31T00:00:00.000Z',
          },
        },
      })
      cy.stubGetPersons({
        status: 200,
        query: '.*',
        response: {
          data: [
            {
              personId: '1',
              nomisId: 'Nomis 1',
              pncRef: 'YY/NNNNNNND',
              name: 'John',
              dateOfBirth: '2000-12-01T00:00:00.000Z',
              address: '123 Street',
              probationPractitioner: 'John Smith',
              deviceActivations: [
                {
                  deviceActivationId: 1,
                  deviceId: 123456,
                  deviceName: '123456',
                  personId: '1',
                  deviceActivationDate: '2024-12-01T00:00:00.000Z',
                  deviceDeactivationDate: '2024-12-02T00:00:00.000Z',
                  orderStart: '2024-12-01T00:00:00.000Z',
                  orderEnd: '2024-12-31T00:00:00.000Z',
                },
              ],
            },
          ],
          pageCount: 1,
          pageNumber: 1,
          pageSize: 10,
        },
      })

      const fromDate = { date: '02/12/2024', hour: '09', minute: '00', second: '00' }
      const toDate = { date: '03/12/2024', hour: '09', minute: '00', second: '00' }

      cy.visit(url)
      let page = Page.verifyOnPage(PersonsPage)

      page.form.fillInWith({ name: 'foo' })
      page.form.searchButton.click()

      cy.url().should('include', '?searchField=name&searchTerm=foo')
      page = Page.verifyOnPage(PersonsPage)
      page.dataTable.shouldHaveResults()

      page.dataTable.selectRow('1')
      page.locationsForm.fillInWith({ fromDate, toDate })
      page.locationsForm.continueButton.click()

      page = Page.verifyOnPage(PersonsPage)
      page.dataTable.shouldHaveSelectedRow('1')
      page.locationsForm.toDateField.shouldHaveValidationMessage('Update date to inside tag period')
    })

    it('should display an error message if date range is outside of maximum time window', () => {
      cy.stubGetDeviceActivation()
      cy.stubGetPersons({
        status: 200,
        query: '.*',
        response: {
          data: [
            {
              personId: '1',
              nomisId: 'Nomis 1',
              pncRef: 'YY/NNNNNNND',
              name: 'John',
              dateOfBirth: '2000-12-01T00:00:00.000Z',
              address: '123 Street',
              probationPractitioner: 'John Smith',
              deviceActivations: [
                {
                  deviceActivationId: 1,
                  deviceId: 123456,
                  deviceName: '123456',
                  personId: '1',
                  deviceActivationDate: '2024-12-01T00:00:00.000Z',
                  deviceDeactivationDate: null,
                  orderStart: '2024-12-01T00:00:00.000Z',
                  orderEnd: '2024-12-31T00:00:00.000Z',
                },
              ],
            },
          ],
          pageCount: 1,
          pageNumber: 1,
          pageSize: 10,
        },
      })

      const fromDate = { date: '01/08/2025', hour: '09', minute: '00', second: '00' }
      const toDate = { date: '04/08/2025', hour: '09', minute: '00', second: '00' }

      cy.visit(url)
      let page = Page.verifyOnPage(PersonsPage)

      page.form.fillInWith({ name: 'foo' })
      page.form.searchButton.click()

      cy.url().should('include', '?searchField=name&searchTerm=foo')
      page = Page.verifyOnPage(PersonsPage)
      page.dataTable.shouldHaveResults()

      page.dataTable.selectRow('1')
      page.locationsForm.fillInWith({ fromDate, toDate })
      page.locationsForm.continueButton.click()

      page = Page.verifyOnPage(PersonsPage)
      page.dataTable.shouldHaveSelectedRow('1')
      page.locationsForm.fromDateField.shouldHaveValidationMessage(
        'Date and time search window should not exceed 48 hours',
      )
    })

    it('should display an error message if to date is before from date', () => {
      cy.stubGetDeviceActivation()
      cy.stubGetPersons({
        status: 200,
        query: '.*',
        response: {
          data: [
            {
              personId: '1',
              nomisId: 'Nomis 1',
              pncRef: 'YY/NNNNNNND',
              name: 'John',
              dateOfBirth: '2000-12-01T00:00:00.000Z',
              address: '123 Street',
              probationPractitioner: 'John Smith',
              deviceActivations: [
                {
                  deviceActivationId: 1,
                  deviceId: 123456,
                  deviceName: '123456',
                  personId: '1',
                  deviceActivationDate: '2024-12-01T00:00:00.000Z',
                  deviceDeactivationDate: null,
                  orderStart: '2024-12-01T00:00:00.000Z',
                  orderEnd: '2024-12-31T00:00:00.000Z',
                },
              ],
            },
          ],
          pageCount: 1,
          pageNumber: 1,
          pageSize: 10,
        },
      })

      const fromDate = { date: '01/08/2025', hour: '09', minute: '00', second: '00' }
      const toDate = { date: '31/07/2025', hour: '09', minute: '00', second: '00' }

      cy.visit(url)
      let page = Page.verifyOnPage(PersonsPage)

      page.form.fillInWith({ name: 'foo' })
      page.form.searchButton.click()

      cy.url().should('include', '?searchField=name&searchTerm=foo')
      page = Page.verifyOnPage(PersonsPage)
      page.dataTable.shouldHaveResults()

      page.dataTable.selectRow('1')
      page.locationsForm.fillInWith({ fromDate, toDate })
      page.locationsForm.continueButton.click()

      page = Page.verifyOnPage(PersonsPage)
      page.dataTable.shouldHaveSelectedRow('1')
      page.locationsForm.toDateField.shouldHaveValidationMessage('To date must be after From date')
    })

    it('should display an error if the api returns 500 when getting the resources', () => {
      // Given an API response with an internal server error
      cy.stubGetDeviceActivation()
      cy.stubGetDeviceActivationPositions({
        status: 500,
        deviceActivationId: '1',
        query: 'from=\\S+&to=\\S+',
        response: '',
      })
      cy.stubGetPersons({
        status: 200,
        query: '.*',
        response: {
          data: [
            {
              personId: '1',
              nomisId: 'Nomis 1',
              pncRef: 'YY/NNNNNNND',
              name: 'John',
              dateOfBirth: '2000-12-01T00:00:00.000Z',
              address: '123 Street',
              probationPractitioner: 'John Smith',
              deviceActivations: [
                {
                  deviceActivationId: 1,
                  deviceId: 123456,
                  deviceName: '123456',
                  personId: '1',
                  deviceActivationDate: '2024-12-01T00:00:00.000Z',
                  deviceDeactivationDate: null,
                  orderStart: '2024-12-01T00:00:00.000Z',
                  orderEnd: '2024-12-31T00:00:00.000Z',
                },
              ],
            },
          ],
          pageCount: 1,
          pageNumber: 1,
          pageSize: 10,
        },
      })
      cy.stubGetPerson()

      // When the user searches for a persons location data
      cy.visit(url)
      let page = Page.verifyOnPage(PersonsPage)

      page.form.fillInWith({ name: 'foo' })
      page.form.searchButton.click()

      cy.url().should('include', '?searchField=name&searchTerm=foo')
      page = Page.verifyOnPage(PersonsPage)
      page.dataTable.shouldHaveResults()

      page.locationsForm.continueButton.should('not.be.visible')
      page.dataTable.selectRow('1')
      page.locationsForm.continueButton.should('be.visible')
      page.locationsForm.continueButton.should('not.be.disabled')
      page.locationsForm.fillInWith({
        fromDate: { date: '01/01/2025', hour: '09', minute: '00' },
        toDate: { date: '02/01/2025', hour: '09', minute: '00' },
      })
      page.locationsForm.continueButton.should('not.be.disabled')
      page.locationsForm.continueButton.click()

      // Then the internal server error page is displayed
      Page.verifyOnPage(ErrorPage, 'Internal Server Error')

      // And the expected audit message was sent
      cy.expectAuditEvents([
        {
          who: 'USER1',
          details:
            '{"params":{"deviceActivationId":1},"query":{"fromDate":{"date":"01/01/2025","hour":"09","minute":"00"},"toDate":{"date":"02/01/2025","hour":"09","minute":"00"}}}',
          what: 'SEARCH_LOCATION_DATA_DEVICE_ACTIVATION',
          service: 'hmpps-electronic-monitoring-crime-matching-ui',
        },
        {
          who: 'USER1',
          details:
            '{"params":{"deviceActivationId":"1"},"query":{"from":"2025-01-01T09:00:00.000Z","to":"2025-01-02T09:00:00.000Z"}}',
          what: 'PAGE_VIEW_ATTEMPT_LOCATION_DATA_DEVICE_ACTIVATION',
          service: 'hmpps-electronic-monitoring-crime-matching-ui',
        },
      ])
    })
  })
})
