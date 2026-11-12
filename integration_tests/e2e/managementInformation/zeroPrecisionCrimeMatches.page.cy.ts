import { hubManager } from '../../fixtures/auth'
import Page from '../../pages/page'
import DatasetPage from '../../pages/managementInformation/dataset'

context('Management Information', () => {
  context('Zero Precision Crime Matches page', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', hubManager)
      cy.signIn()
    })

    it('should display no results on page load', () => {
      // When the user loads the page
      cy.visit('/management-information/zero-precision-crime-matches')

      const page = Page.verifyOnPage(DatasetPage, 'Crime matches with zero-precision positions')

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
    })

    it('should display validation errors when bad filters submitted', () => {
      cy.visit('/management-information/zero-precision-crime-matches')

      const page = Page.verifyOnPage(DatasetPage, 'Crime matches with zero-precision positions')

      // When the user submits the form with invalid dates
      page.form.fillInWith({
        from: 'invalid-date',
        to: 'invalid-date',
      })
      page.form.submitButton.click()

      // Then validation errors should be displayed
      page.form.fromField.shouldHaveValidationMessage('Enter a valid from date')
      page.form.toField.shouldHaveValidationMessage('Enter a valid to date')
    })

    it('should display results when valid filters submitted', () => {
      // Given a stubbed dataset for zero-precision crime matches
      cy.stubGetManagementInformationDataset({
        request: {
          id: 'zero-precision-crime-matches',
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
                crimeReference: '0000001',
                deviceSerialNumber: '000000001',
                matchedAt: '2026-01-01T00:00:00+00:00',
                zeroPrecisionPositionCount: 0,
              },
            ],

            pageCount: 1,
            pageNumber: 0,
            pageSize: 10,
          },
        },
      })

      cy.visit('/management-information/zero-precision-crime-matches')

      const page = Page.verifyOnPage(DatasetPage, 'Crime matches with zero-precision positions')

      // When the user submits the form with valid dates
      page.form.fillInWith({
        from: '01/01/2023',
        to: '31/12/2023',
      })
      page.form.submitButton.click()

      // Then the data table should display results
      page.dataTable.shouldHaveResults()
      page.dataTable.shouldHaveColumns([
        'Police force area',
        'Batch ID',
        'Crime reference',
        'Device serial number',
        'Matched at',
        'Zero-precision positions',
      ])
      page.dataTable.shouldHaveRows([
        ['Metropolitan', 'MPS20260101', '0000001', '000000001', '01/01/2026, 00:00:00', '0'],
      ])
      page.dataTable.shouldNotHavePagination()
    })

    it('should display an empty table when the response contains no data', () => {
      // Given a stubbed dataset for zero-precision crime matches
      cy.stubGetManagementInformationDataset({
        request: {
          id: 'zero-precision-crime-matches',
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

      cy.visit('/management-information/zero-precision-crime-matches')

      const page = Page.verifyOnPage(DatasetPage, 'Crime matches with zero-precision positions')

      // When the user submits the form with valid dates
      page.form.fillInWith({
        from: '01/01/2023',
        to: '31/12/2023',
      })
      page.form.submitButton.click()

      // Then the data table should display results
      page.dataTable.shouldHaveResults()
      page.dataTable.shouldHaveColumns([
        'Police force area',
        'Batch ID',
        'Crime reference',
        'Device serial number',
        'Matched at',
        'Zero-precision positions',
      ])
      page.dataTable.shouldHaveRows([['No results found for applied filters.']])
      page.dataTable.shouldNotHavePagination()
    })

    it('should display pagination when the response indicates many pages', () => {
      // Given a stubbed dataset for zero-precision crime matches
      cy.stubGetManagementInformationDataset({
        request: {
          id: 'zero-precision-crime-matches',
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

      cy.visit('/management-information/zero-precision-crime-matches')

      const page = Page.verifyOnPage(DatasetPage, 'Crime matches with zero-precision positions')

      // When the user submits the form with valid dates
      page.form.fillInWith({
        from: '01/01/2023',
        to: '31/12/2023',
      })
      page.form.submitButton.click()

      // Then the data table should display results
      page.dataTable.shouldHaveResults()
      page.dataTable.shouldHaveColumns([
        'Police force area',
        'Batch ID',
        'Crime reference',
        'Device serial number',
        'Matched at',
        'Zero-precision positions',
      ])
      page.dataTable.shouldHaveRows([['No results found for applied filters.']])
      page.dataTable.shouldHavePagination()
      page.dataTable.pagination.shouldHaveCurrentPage('1')
    })
  })
})
