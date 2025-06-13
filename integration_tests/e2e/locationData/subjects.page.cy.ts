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
    })

    it('should display the no result message if the query returns no results', () => {
      cy.stubCreateSubjectsQuery()
      cy.stubGetSubjectsQuery()

      cy.visit(url)
      let page = Page.verifyOnPage(SubjectsPage)

      page.form.fillInWith({ nomisId: 'foo' })
      page.form.searchButton.click()

      cy.url().should('include', '?queryId=1234')
      page = Page.verifyOnPage(SubjectsPage)
      page.dataTable.shouldNotHaveResults()
    })

    it('should display the query results if the query returned results', () => {
      cy.stubCreateSubjectsQuery()
      cy.stubGetSubjectsQuery({
        status: 200,
        query: '.*',
        response: [
          {
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
          {
            nomisId: 'Nomis 2',
            name: 'Lee',
            dateOfBirth: '2000-12-01T00:00:00.000Z',
            address: '456 Avenue',
            orderStartDate: '2024-12-01T00:00:00.000Z',
            orderEndDate: '2024-12-01T00:00:00.000Z',
            deviceId: '654321',
            tagPeriodStartDate: '2024-12-01T00:00:00.000Z',
            tagPeriodEndDate: '2024-12-01T00:00:00.000Z',
          },
        ],
      })

      cy.visit(url)
      let page = Page.verifyOnPage(SubjectsPage)

      page.form.fillInWith({ name: 'foo' })
      page.form.searchButton.click()

      cy.url().should('include', '?queryId=1234')
      page = Page.verifyOnPage(SubjectsPage)
      page.dataTable.shouldHaveResults()
      page.dataTable.shouldHaveColumns([
        '',
        'NOMIS ID',
        'Name',
        'Date of Birth',
        'Address',
        'Order Start',
        'Order End',
        'Device ID',
        'Tag Period Start',
        'Tag Period End',
      ])

      page.dataTable.shouldHaveRows([
        [
          '',
          'Nomis 1',
          'John',
          '2000-12-01T00:00:00.000Z',
          '123 Street',
          '2024-12-01T00:00:00.000Z',
          '',
          '123456',
          '2024-12-01T00:00:00.000Z',
          '',
        ],
        [
          '',
          'Nomis 2',
          'Lee',
          '2000-12-01T00:00:00.000Z',
          '456 Avenue',
          '2024-12-01T00:00:00.000Z',
          '2024-12-01T00:00:00.000Z',
          '654321',
          '2024-12-01T00:00:00.000Z',
          '2024-12-01T00:00:00.000Z',
        ],
      ])
    })
  })
})
