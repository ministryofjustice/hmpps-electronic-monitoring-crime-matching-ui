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

    it('should display the no result message if the query returns no results', () => {
      // Stub the api to simulate a query being successfully created
      cy.stubCreateCrimeBatchesQuery()
      // Stub the api to simulate the query returning no results
      cy.stubGetCrimeBatchesQuery()

      cy.visit(url)
      let page = Page.verifyOnPage(CrimeBatchesPage)

      // Submit a search
      page.form.fillInWith({ searchTerm: 'foo' })
      page.form.searchButton.click()

      // User should be shown the results
      cy.url().should('include', '?queryId=1234')
      page = Page.verifyOnPage(CrimeBatchesPage)
      page.dataTable.shouldNotHaveResults()
    })

    it('should display the query results if the query returned results', () => {
      // Stub the api to simulate a query being successfully created
      cy.stubCreateCrimeBatchesQuery()
      // Stub the api to simulate the query returning 2 results
      cy.stubGetCrimeBatchesQuery({
        status: 200,
        query: '.*',
        response: {
          data: [
            {
              policeForce: 'Police Force 1',
              batch: '01234456789',
              start: '2024-12-01T00:00:00.000Z',
              end: '2024-12-01T23:59:59.000Z',
              time: 10,
              matches: 1,
              ingestionDate: '2024-12-02T09:00:00.000Z',
              caseloadMappingDate: '2024-12-01T00:00:00.000Z',
              crimeMatchingAlgorithmVersion: 'v0.0.1',
            },
            {
              policeForce: 'Police Force 2',
              batch: '01234456789',
              start: '2024-12-01T00:00:00.000Z',
              end: '2024-12-01T23:59:59.000Z',
              time: 10,
              matches: 1,
              ingestionDate: '2024-12-02T09:00:00.000Z',
              caseloadMappingDate: '2024-12-01T00:00:00.000Z',
              crimeMatchingAlgorithmVersion: 'v0.0.1',
            },
          ],
          pageCount: 1,
          pageNumber: 1,
          pageSize: 10,
        },
      })

      cy.visit(url)
      let page = Page.verifyOnPage(CrimeBatchesPage)

      // Submit a search
      page.form.fillInWith({ searchTerm: 'foo' })
      page.form.searchButton.click()

      // User should be shown the results
      cy.url().should('include', '?queryId=1234')
      page = Page.verifyOnPage(CrimeBatchesPage)
      page.dataTable.shouldHaveResults()
      page.dataTable.shouldHaveColumns([
        'Police Force',
        'Batch',
        'Start',
        'End',
        'Time (Mins)',
        'Matches',
        'AC Ingestion Date',
        'AC Caseload Mapping Date',
        'Algorithm Version',
      ])
      page.dataTable.shouldHaveRows([
        [
          'Police Force 1',
          '01234456789',
          '01/12/2024 00:00',
          '01/12/2024 23:59',
          '10',
          '1',
          '02/12/2024 09:00',
          '01/12/2024 00:00',
          'v0.0.1',
        ],
        [
          'Police Force 2',
          '01234456789',
          '01/12/2024 00:00',
          '01/12/2024 23:59',
          '10',
          '1',
          '02/12/2024 09:00',
          '01/12/2024 00:00',
          'v0.0.1',
        ],
      ])
    })
  })
})
