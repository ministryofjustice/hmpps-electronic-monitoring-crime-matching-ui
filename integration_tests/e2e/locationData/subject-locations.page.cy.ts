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

    it('should display the location results on map if the search query is valid', () => {
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

      page.locationsForm.continueButton.should('be.disabled')
      const now = dayjs('2025-08-01T09:00:00Z')
      const toDate = now.add(1, 'day')
      page.locationsForm.fillInWith({ fromDate: now.toDate(), toDate: toDate.toDate() })
      page.dataTable.selectRow('1')
      page.locationsForm.continueButton.should('not.be.disabled')
      page.locationsForm.continueButton.click()
      cy.url().should('include', '?queryId=4321')
    })
  })
})
