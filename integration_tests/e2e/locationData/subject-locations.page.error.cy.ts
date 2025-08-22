import SubjectsPage from '../../pages/locationData/subjects'
import Page from '../../pages/page'

const url = '/location-data/subjects'

context('Location Data', () => {
  context('Subject Location Search', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
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
              name: 'John',
              dateOfBirth: '2000-12-01T00:00:00.000Z',
              address: '123 Street',
              deviceActivations: [
                {
                  deviceActivationId: 1,
                  deviceId: 123456,
                  personId: 123456,
                  deviceActivationDate: '2024-12-01T00:00:00.000Z',
                  deviceDeactivationDate: null,
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

      page.locationsForm.fillInWith({ fromDate: undefined, toDate: undefined })
      page.dataTable.selectRow('1')
      page.locationsForm.continueButton.click()
      page.locationsForm.fromDateField.shouldHaveValidationMessage('You must enter a valid value for date')
      page.locationsForm.toDateField.shouldHaveValidationMessage('You must enter a valid value for date')
    })

    it('should display an error message if date range is outside device activation date range', () => {
      cy.stubGetDeviceActivation({
        deviceActivationId: '1',
        status: 200,
        response: {
          data: {
            deviceActivationId: 1,
            deviceId: 123456,
            personId: 123456,
            deviceActivationDate: '2024-12-01T00:00:00.000Z',
            deviceDeactivationDate: '2024-12-02T00:00:00.000Z',
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
              name: 'John',
              dateOfBirth: '2000-12-01T00:00:00.000Z',
              address: '123 Street',
              deviceActivations: [
                {
                  deviceActivationId: 1,
                  deviceId: 123456,
                  personId: 123456,
                  deviceActivationDate: '2024-12-01T00:00:00.000Z',
                  deviceDeactivationDate: '2024-12-02T00:00:00.000Z',
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
      const toDate = { date: '02/08/2025', hour: '09', minute: '00', second: '00' }

      cy.visit(url)
      let page = Page.verifyOnPage(SubjectsPage)

      page.form.fillInWith({ name: 'foo' })
      page.form.searchButton.click()

      cy.url().should('include', '?name=foo&nomisId=')
      page = Page.verifyOnPage(SubjectsPage)
      page.dataTable.shouldHaveResults()

      page.locationsForm.fillInWith({ fromDate, toDate })
      page.dataTable.selectRow('1')
      page.locationsForm.continueButton.click()
      page.locationsForm.fromDateField.shouldHaveValidationMessage(
        'Date and time search window should be within device activation date range',
      )
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
              name: 'John',
              dateOfBirth: '2000-12-01T00:00:00.000Z',
              address: '123 Street',
              deviceActivations: [
                {
                  deviceActivationId: 1,
                  deviceId: 123456,
                  personId: 123456,
                  deviceActivationDate: '2024-12-01T00:00:00.000Z',
                  deviceDeactivationDate: null,
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
      let page = Page.verifyOnPage(SubjectsPage)

      page.form.fillInWith({ name: 'foo' })
      page.form.searchButton.click()

      cy.url().should('include', '?name=foo&nomisId=')
      page = Page.verifyOnPage(SubjectsPage)
      page.dataTable.shouldHaveResults()

      page.locationsForm.fillInWith({ fromDate, toDate })
      page.dataTable.selectRow('1')
      page.locationsForm.continueButton.click()
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
              name: 'John',
              dateOfBirth: '2000-12-01T00:00:00.000Z',
              address: '123 Street',
              deviceActivations: [
                {
                  deviceActivationId: 1,
                  deviceId: 123456,
                  personId: 123456,
                  deviceActivationDate: '2024-12-01T00:00:00.000Z',
                  deviceDeactivationDate: null,
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
      let page = Page.verifyOnPage(SubjectsPage)

      page.form.fillInWith({ name: 'foo' })
      page.form.searchButton.click()

      cy.url().should('include', '?name=foo&nomisId=')
      page = Page.verifyOnPage(SubjectsPage)
      page.dataTable.shouldHaveResults()

      page.locationsForm.fillInWith({ fromDate, toDate })
      page.dataTable.selectRow('1')
      page.locationsForm.continueButton.click()
      page.locationsForm.toDateField.shouldHaveValidationMessage('To date must be after From date')
    })
  })
})
