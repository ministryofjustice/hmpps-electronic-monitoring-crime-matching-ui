import { hubManager } from '../../fixtures/auth'
import Page from '../../pages/page'
import DatasetPage from '../../pages/managementInformation/dataset'

context('Management Information', () => {
  context('Failed Crime Submissions page', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', hubManager)
      cy.signIn()
    })

    it('should display no results on page load', () => {
      // When the user loads the page
      cy.visit('/management-information/failed-crime-submissions')

      const page = Page.verifyOnPage(DatasetPage, 'Failed crime submissions')

      // Then the data table should not be shown
      page.dataTable.shouldNotHaveResults()
      page.dataTable.shouldNotHavePagination()

      // And the filter form should be visible
      page.form.toField.shouldNotBeDisabled()
      page.form.fromField.shouldNotBeDisabled()

      // And the form should be populated with default values
      const today = new Date()
      const firstDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1))
      const lastDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0))
      const format = (date: Date) =>
        `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${date.getUTCFullYear()}`

      page.form.fromField.shouldHaveValue(format(firstDay))
      page.form.toField.shouldHaveValue(format(lastDay))
      page.form.policeForceAreaField.shouldHaveValue('')
    })

    it('should display validation errors when bad filters are submitted', () => {
      cy.visit('/management-information/failed-crime-submissions')

      const page = Page.verifyOnPage(DatasetPage, 'Failed crime submissions')

      // When the user submits the form with invalid data
      page.form.fillInWith({
        from: 'invalid-date',
        to: 'invalid-date',
        policeForceArea: '',
      })
      page.form.submitButton.click()

      // Then validation errors should be displayed
      page.form.fromField.shouldHaveValidationMessage('Enter a valid from date')
      page.form.toField.shouldHaveValidationMessage('Enter a valid to date')
    })

    it('should display results when valid filters submitted', () => {
      // Given a stubbed dataset for failed crime submissions
      cy.stubGetManagementInformationDataset({
        request: {
          id: 'failed-crime-submissions',
          query: {
            from: '2023-01-01T00:00:00.000Z',
            to: '2024-01-01T00:00:00.000Z',
            page: 0,
          },
        },
        response: {
          status: 200,
          body: {
            data: [
              {
                total: 2,
                failures: [
                  {
                    reasonForFailure: 'Invalid Batch ID format',
                    failureCount: 2,
                  },
                  {
                    reasonForFailure: 'Invalid date in Batch ID',
                    failureCount: 0,
                  },
                  {
                    reasonForFailure: 'Incorrect number of columns',
                    failureCount: 0,
                  },
                  {
                    reasonForFailure: 'Field must be text',
                    failureCount: 0,
                  },
                  {
                    reasonForFailure: 'Field must be number',
                    failureCount: 0,
                  },
                ],
              },
            ],

            pageCount: 1,
            pageNumber: 0,
            pageSize: 10,
          },
        },
      })

      cy.visit('/management-information/failed-crime-submissions')
      const page = Page.verifyOnPage(DatasetPage, 'Failed crime submissions')

      page.form.fillInWith({
        from: '01/01/2023',
        to: '31/12/2023',
        policeForceArea: 'METROPOLITAN',
      })
      page.form.submitButton.click()

      // Then the data table should display results
      page.dataTable.shouldHaveResults()
      page.dataTable.shouldHaveColumns(['Reason for failure', 'Failure count'])
      page.dataTable.shouldHaveRows([
        ['Invalid Batch ID format', '2'],
        ['Invalid date in Batch ID', '0'],
        ['Incorrect number of columns', '0'],
        ['Field must be text', '0'],
        ['Field must be number', '0'],
        ['Total', '2'],
      ])
      page.dataTable.shouldNotHavePagination()
    })

    it('should display an empty table when the response contains no data', () => {
      // Given a stubbed dataset for failed crime submissions
      cy.stubGetManagementInformationDataset({
        request: {
          id: 'failed-crime-submissions',
          query: {
            from: '2023-01-01T00:00:00.000Z',
            to: '2024-01-01T00:00:00.000Z',
            page: 0,
          },
        },
        response: {
          status: 200,
          body: {
            data: [],
            pageCount: 1,
            pageNumber: 0,
            pageSize: 10,
          },
        },
      })

      cy.visit('/management-information/failed-crime-submissions')
      const page = Page.verifyOnPage(DatasetPage, 'Failed crime submissions')

      // When the user submits the form with valid data
      page.form.fillInWith({
        from: '01/01/2023',
        to: '31/12/2023',
        policeForceArea: 'METROPOLITAN',
      })
      page.form.submitButton.click()

      // Then the data table should display results
      page.dataTable.shouldHaveResults()
      page.dataTable.shouldHaveColumns(['Reason for failure', 'Failure count'])
      page.dataTable.shouldHaveRows([['No results found for applied filters.']])
      page.dataTable.shouldNotHavePagination()
    })

    it('should download the complete filtered dataset as CSV', () => {
      // Given a stubbed dataset for the first page
      cy.stubGetManagementInformationDataset({
        request: {
          id: 'failed-crime-submissions',
          query: {
            from: '2023-01-01T00:00:00.000Z',
            to: '2024-01-01T00:00:00.000Z',
            page: 0,
          },
        },
        response: {
          status: 200,
          body: {
            data: [
              {
                total: 2,
                failures: [
                  {
                    reasonForFailure: 'Invalid Batch ID format',
                    failureCount: 2,
                  },
                ],
              },
            ],
            pageCount: 2,
            pageNumber: 0,
            pageSize: 1,
          },
        },
      })

      // And an unpaged response containing all data
      cy.stubGetManagementInformationDataset({
        request: {
          id: 'failed-crime-submissions',
          query: {
            from: '2023-01-01T00:00:00.000Z',
            to: '2024-01-01T00:00:00.000Z',
          },
        },
        response: {
          status: 200,
          body: {
            data: [
              {
                total: 2,
                failures: [
                  {
                    reasonForFailure: 'Invalid Batch ID format',
                    failureCount: 2,
                  },
                  {
                    reasonForFailure: 'Invalid date in Batch ID',
                    failureCount: 0,
                  },
                ],
              },
            ],
            pageCount: 1,
            pageNumber: 0,
            pageSize: 2,
          },
        },
      })

      cy.visit('/management-information/failed-crime-submissions')
      const page = Page.verifyOnPage(DatasetPage, 'Failed crime submissions')

      page.form.fillInWith({
        from: '01/01/2023',
        to: '31/12/2023',
        policeForceArea: 'METROPOLITAN',
      })
      page.form.submitButton.click()

      // When the user requests the csv export
      cy.contains('a', 'Download CSV')
        .invoke('attr', 'href')
        .then(href => {
          cy.request(href!).then(response => {
            expect(response.status).to.eq(200)
            expect(response.headers['content-type']).to.include('text/csv')
            expect(response.headers['content-disposition']).to.include('attachment')
            expect(response.body).to.equal(
              'Reason for failure,Failure count\nInvalid Batch ID format,2\nInvalid date in Batch ID,0\nTotal,2\n',
            )
          })
        })
    })

    it('should copy the complete filtered dataset as TSV', () => {
      // Given a stubbed dataset for the first page
      cy.stubGetManagementInformationDataset({
        request: {
          id: 'failed-crime-submissions',
          query: {
            from: '2023-01-01T00:00:00.000Z',
            to: '2024-01-01T00:00:00.000Z',
            page: 0,
          },
        },
        response: {
          status: 200,
          body: {
            data: [
              {
                total: 2,
                failures: [
                  {
                    reasonForFailure: 'Invalid Batch ID format',
                    failureCount: 2,
                  },
                ],
              },
            ],
            pageCount: 2,
            pageNumber: 0,
            pageSize: 1,
          },
        },
      })

      // And an unpaged response containing all data
      cy.stubGetManagementInformationDataset({
        request: {
          id: 'failed-crime-submissions',
          query: {
            from: '2023-01-01T00:00:00.000Z',
            to: '2024-01-01T00:00:00.000Z',
          },
        },
        response: {
          status: 200,
          body: {
            data: [
              {
                total: 2,
                failures: [
                  {
                    reasonForFailure: 'Invalid Batch ID format',
                    failureCount: 2,
                  },
                  {
                    reasonForFailure: 'Invalid date in Batch ID',
                    failureCount: 0,
                  },
                ],
              },
            ],
            pageCount: 1,
            pageNumber: 0,
            pageSize: 2,
          },
        },
      })

      cy.visit('/management-information/failed-crime-submissions')
      const page = Page.verifyOnPage(DatasetPage, 'Failed crime submissions')

      page.form.fillInWith({
        from: '01/01/2023',
        to: '31/12/2023',
        policeForceArea: 'METROPOLITAN',
      })
      page.form.submitButton.click()

      // And clipboard access is stubbed
      cy.window().then(win => {
        const writeText = cy.stub(win.navigator.clipboard, 'writeText').resolves()

        cy.wrap(writeText).as('writeText')
      })

      // When the user copies the table
      cy.contains('button', 'Copy table').click()

      // Then the complete dataset should be copied
      cy.get('@writeText').should('have.been.calledOnce')

      cy.get('@writeText').should(
        'have.been.calledWithMatch',
        'Reason for failure\tFailure count\n' +
          'Invalid Batch ID format\t2\n' +
          'Invalid date in Batch ID\t0\n' +
          'Total\t2\n',
      )

      // And the user should see a success message
      cy.get('#copy-dataset-status')
        .should('contain.text', 'Table copied to clipboard')
        .and('have.class', 'app-copy-status--success')

      cy.contains('button', 'Copy table').should('not.be.disabled')
    })
  })
})
