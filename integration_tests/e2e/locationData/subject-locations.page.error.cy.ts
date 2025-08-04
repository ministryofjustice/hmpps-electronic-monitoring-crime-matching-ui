import dayjs from 'dayjs'
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
      cy.stubCreateSubjectLocationsQuery()
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
      page.locationsForm.searchFromDateField.shouldHaveValidationMessage('You must enter a valid value for date')
      page.locationsForm.searchToDateField.shouldHaveValidationMessage('You must enter a valid value for date')
    })

    it('should display an error message if date range is outside order date range', () => {
      cy.stubCreateSubjectLocationsQuery()
      const now = dayjs('2025-08-01T09:00:00Z')
      const invalidDate = now.subtract(1, 'day')
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

      cy.visit(url)
      let page = Page.verifyOnPage(SubjectsPage)

      page.form.fillInWith({ name: 'foo' })
      page.form.searchButton.click()

      cy.url().should('include', '?name=foo&nomisId=')
      page = Page.verifyOnPage(SubjectsPage)
      page.dataTable.shouldHaveResults()

      page.locationsForm.fillInWith({ fromDate: invalidDate.toDate(), toDate: now.toDate() })
      page.dataTable.selectRow('1')
      page.locationsForm.continueButton.click()
      page.locationsForm.searchFromDateField.shouldHaveValidationMessage(
        'Date and time search window should be within Order date range',
      )
    })

    it('should display an error message if date range is outside of maximum time window', () => {
      cy.stubCreateSubjectLocationsQuery()
      const now = dayjs('2025-08-01T09:00:00Z')
      const invalidDate = now.add(3, 'day')
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

      page.locationsForm.fillInWith({ fromDate: now.toDate(), toDate: invalidDate.toDate() })
      page.dataTable.selectRow('1')
      page.locationsForm.continueButton.click()
      page.locationsForm.searchFromDateField.shouldHaveValidationMessage(
        'Date and time search window should not exceed 48 hours',
      )
    })

    it('should display an error message if to date is before from date', () => {
      cy.stubCreateSubjectLocationsQuery()
      const now = dayjs('2025-08-01T09:00:00Z')
      const invalidDate = now.subtract(1, 'day')
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

      page.locationsForm.fillInWith({ fromDate: now.toDate(), toDate: invalidDate.toDate() })
      page.dataTable.selectRow('1')
      page.locationsForm.continueButton.click()
      page.locationsForm.searchFromDateField.shouldHaveValidationMessage('To date must be after From date')
    })
  })
})
