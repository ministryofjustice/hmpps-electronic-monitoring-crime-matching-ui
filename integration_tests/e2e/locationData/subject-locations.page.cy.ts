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
      cy.stubCreateSubjectsQuery()
      cy.stubGetSubjectsQuery({
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
              orderStartDate: '2024-12-01T00:00:00.000Z',
              orderEndDate: null,
              deviceId: '123456',
              tagPeriodStartDate: '2024-12-01T00:00:00.000Z',
              tagPeriodEndDate: null,
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

      cy.url().should('include', '?queryId=1234')
      page = Page.verifyOnPage(SubjectsPage)
      page.dataTable.shouldHaveResults()

      page.locationsForm.continueButton.should('be.disabled')
      const now = dayjs()
      const toDate = now.add(1, 'day')
      page.locationsForm.fillInWith({ fromDate: now.toDate(), toDate: toDate.toDate() })
      page.dataTable.selectRow('1')
      page.locationsForm.continueButton.should('not.be.disabled')
      page.locationsForm.continueButton.click()
      cy.url().should('include', '?queryId=4321')
    })
  })
})
