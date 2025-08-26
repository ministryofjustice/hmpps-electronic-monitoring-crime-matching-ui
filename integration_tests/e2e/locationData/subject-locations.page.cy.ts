import SubjectsPage from '../../pages/locationData/subjects'
import Page from '../../pages/page'
import SubjectPage from '../../pages/locationData/subject'
import sampleLocations from './fixtures/sample-locations'

const url = '/location-data/subjects'

context('Location Data', () => {
  context('Subject Location Search', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should display the location results on map if the submitted dates are valid', () => {
      cy.stubGetDeviceActivation()
      cy.stubGetDeviceActivationPositions({
        status: 200,
        deviceActivationId: '1',
        query: 'from=\\S+&to=\\S+',
        response: sampleLocations,
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
      page.locationsForm.fillInWith({
        fromDate: { date: '01/01/2025', hour: '09', minute: '00', second: '00' },
        toDate: { date: '02/01/2025', hour: '09', minute: '00', second: '00' },
      })
      page.dataTable.selectRow('1')
      page.locationsForm.continueButton.should('not.be.disabled')
      page.locationsForm.continueButton.click()

      const subjectPage = Page.verifyOnPage(SubjectPage)
      subjectPage.map.sidebar.form.fromDateField.shouldHaveValue({
        date: '01/01/2025',
        hour: '09',
        minute: '00',
        second: '00',
      })
      subjectPage.map.sidebar.form.toDateField.shouldHaveValue({
        date: '02/01/2025',
        hour: '09',
        minute: '00',
        second: '00',
      })
    })
  })
})
