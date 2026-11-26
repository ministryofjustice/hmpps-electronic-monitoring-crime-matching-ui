import { hubManager } from '../../fixtures/auth'
import Page from '../../pages/page'
import DatasetPage from '../../pages/managementInformation/dataset'

context('Management Information', () => {
  context('Crime Matching Result Summary page', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', hubManager)
      cy.signIn()
    })

    it('should display no results on page load', () => {
      // When the user loads the page
      cy.visit('/management-information/crime-matching-result-summary')

      const page = Page.verifyOnPage(DatasetPage, 'Crime matching result summary')

      // Then the data table should not be shown
      page.dataTable.shouldNotHaveResults()
      page.dataTable.shouldNotHavePagination()

      // And the filter form should be visible
      page.form.toField.shouldNotBeDisabled()
      page.form.fromField.shouldNotBeDisabled()

      // And the form should be populated with default values
      const today = new Date()
      const todayString = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
      page.form.fromField.shouldHaveValue(todayString)
      page.form.toField.shouldHaveValue(todayString)
      page.form.policeForceAreaField.shouldHaveValue('')
    })

    it('should display validation errors when bad filters are submitted', () => {
      cy.visit('/management-information/crime-matching-result-summary')

      const page = Page.verifyOnPage(DatasetPage, 'Crime matching result summary')

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
      // Given a stubbed dataset for crime matching result summary
      cy.stubGetManagementInformationDataset({
        request: {
          id: 'crime-matching-result-summary',
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
                policeForceArea: 'Metropolitan',
                batchId: 'MPS20260101',
                automatedMatches: 1,
              },
            ],

            pageCount: 1,
            pageNumber: 0,
            pageSize: 10,
          },
        },
      })

      cy.visit('/management-information/crime-matching-result-summary')

      const page = Page.verifyOnPage(DatasetPage, 'Crime matching result summary')

      // When the user submits the form with valid data
      page.form.fillInWith({
        from: '01/01/2023',
        to: '31/12/2023',
        policeForceArea: 'METROPOLITAN',
      })
      page.form.submitButton.click()

      // Then the data table should display results
      page.dataTable.shouldHaveResults()
      page.dataTable.shouldHaveColumns(['Police force area', 'Batch ID', 'Automated matches'])
      page.dataTable.shouldHaveRows([['Metropolitan', 'MPS20260101', '1']])
      page.dataTable.shouldNotHavePagination()
    })

    it('should display an empty table when the response contains no data', () => {
      // Given a stubbed dataset for crime matching result summary
      cy.stubGetManagementInformationDataset({
        request: {
          id: 'crime-matching-result-summary',
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

      cy.visit('/management-information/crime-matching-result-summary')

      const page = Page.verifyOnPage(DatasetPage, 'Crime matching result summary')

      // When the user submits the form with valid dates
      page.form.fillInWith({
        from: '01/01/2023',
        to: '31/12/2023',
        policeForceArea: 'METROPOLITAN',
      })
      page.form.submitButton.click()

      // Then the data table should display results
      page.dataTable.shouldHaveResults()
      page.dataTable.shouldHaveColumns(['Police force area', 'Batch ID', 'Automated matches'])
      page.dataTable.shouldHaveRows([['No results found for applied filters.']])
      page.dataTable.shouldNotHavePagination()
    })

    it('should display pagination when the response indicates many pages', () => {
      // Given a stubbed dataset for crime matching result summary
      cy.stubGetManagementInformationDataset({
        request: {
          id: 'crime-matching-result-summary',
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
            pageCount: 5,
            pageNumber: 0,
            pageSize: 10,
          },
        },
      })

      cy.visit('/management-information/crime-matching-result-summary')

      const page = Page.verifyOnPage(DatasetPage, 'Crime matching result summary')

      // When the user submits the form with valid data
      page.form.fillInWith({
        from: '01/01/2023',
        to: '31/12/2023',
        policeForceArea: 'METROPOLITAN',
      })
      page.form.submitButton.click()

      // Then the data table should display results
      page.dataTable.shouldHaveResults()
      page.dataTable.shouldHaveColumns(['Police force area', 'Batch ID', 'Automated matches'])
      page.dataTable.shouldHaveRows([['No results found for applied filters.']])
      page.dataTable.shouldHavePagination()
      page.dataTable.pagination.shouldHaveCurrentPage('1')
    })

    it('should download the complete filtered dataset as CSV', () => {
      // Given a stubbed dataset for crime matching result summary
      cy.stubGetManagementInformationDataset({
        request: {
          id: 'crime-matching-result-summary',
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
                policeForceArea: 'Metropolitan',
                batchId: 'MPS20260101',
                automatedMatches: 1,
              },
            ],

            pageCount: 2,
            pageNumber: 0,
            pageSize: 10,
          },
        },
      })

      // And an unpaged response containing all results
      cy.stubGetManagementInformationDataset({
        request: {
          id: 'crime-matching-result-summary',
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
                policeForceArea: 'Metropolitan',
                batchId: 'MPS20260101',
                automatedMatches: 1,
              },
              {
                policeForceArea: 'Bedfordshire',
                batchId: 'BFD20260101',
                automatedMatches: 1,
              },
            ],

            pageCount: 1,
            pageNumber: 0,
            pageSize: 2,
          },
        },
      })

      cy.visit('/management-information/crime-matching-result-summary')

      const page = Page.verifyOnPage(DatasetPage, 'Crime matching result summary')

      page.form.fillInWith({
        from: '01/01/2023',
        to: '31/12/2023',
      })
      page.form.submitButton.click()

      // When the user requests the CSV export
      cy.contains('a', 'Download CSV')
        .invoke('attr', 'href')
        .then(href => {
          cy.request(href!).then(response => {
            expect(response.status).to.eq(200)
            expect(response.headers['content-type']).to.include('text/csv')
            expect(response.headers['content-disposition']).to.include('attachment')
            expect(response.body).to.equal(
              'Police force area,Batch ID,Automated matches\nMetropolitan,MPS20260101,1\nBedfordshire,BFD20260101,1\n',
            )
          })
        })
    })

    it('should copy the complete filtered dataset as TSV', () => {
      // Given a stubbed dataset for crime matching result summary
      cy.stubGetManagementInformationDataset({
        request: {
          id: 'crime-matching-result-summary',
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
                policeForceArea: 'Metropolitan',
                batchId: 'MPS20260101',
                automatedMatches: 1,
              },
            ],

            pageCount: 2,
            pageNumber: 0,
            pageSize: 10,
          },
        },
      })

      // And an unpaged response containing all results
      cy.stubGetManagementInformationDataset({
        request: {
          id: 'crime-matching-result-summary',
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
                policeForceArea: 'Metropolitan',
                batchId: 'MPS20260101',
                automatedMatches: 1,
              },
              {
                policeForceArea: 'Metropolitan',
                batchId: 'MPS20260102',
                automatedMatches: 1,
              },
            ],

            pageCount: 1,
            pageNumber: 0,
            pageSize: 2,
          },
        },
      })

      cy.visit('/management-information/crime-matching-result-summary')

      const page = Page.verifyOnPage(DatasetPage, 'Crime matching result summary')

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
        'Police force area\tBatch ID\tAutomated matches\n' +
          'Metropolitan\tMPS20260101\t1\n' +
          'Metropolitan\tMPS20260102\t1\n',
      )

      // And the user should see a success message
      cy.get('#copy-dataset-status')
        .should('contain.text', 'Table copied to clipboard')
        .and('have.class', 'app-copy-status--success')

      cy.contains('button', 'Copy table').should('not.be.disabled')
    })
  })
})
