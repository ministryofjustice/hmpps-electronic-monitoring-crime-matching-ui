import Page from '../../pages/page'
import CrimeSearchPage from '../../pages/proximityAlert/crimeSearch'

context('Search Crimes', () => {
  context('Searching for crime versions', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should display an empty table on page load', () => {
      // When the user loads the page with no query params
      cy.visit('/proximity-alert')

      const page = Page.verifyOnPage(CrimeSearchPage)

      // Then the crime reference field should be empty
      page.searchForm.crimeReferenceField.shouldHaveValue('')

      // And the table should have 1 row
      page.dataTable.shouldHaveColumns([
        'Matched',
        'Crime reference',
        'Police force area,\nBatch ID',
        'Crime type',
        'Crime date',
        'Ingestion date,\ntime',
        'Updates',
        'Versions',
      ])
      page.dataTable.shouldHaveRows([['Enter a crime number and click search.']])
      page.dataTable.shouldNotHavePagination()
    })

    it('should display an empty table if no results', () => {
      // Given an API response with no results
      cy.stubGetCrimeVersions()

      // When the user loads the page with query params
      cy.visit('/proximity-alert?crimeReference=abc')

      const page = Page.verifyOnPage(CrimeSearchPage)

      // Then the crime reference field should show the search term
      page.searchForm.crimeReferenceField.shouldHaveValue('abc')

      // And the table should have 1 row
      page.dataTable.shouldHaveColumns([
        'Matched',
        'Crime reference',
        'Police force area,\nBatch ID',
        'Crime type',
        'Crime date',
        'Ingestion date,\ntime',
        'Updates',
        'Versions',
      ])
      page.dataTable.shouldHaveRows([['No results found for abc.']])
      page.dataTable.shouldNotHavePagination()
    })

    it('should display crime versions', () => {
      // Given an API response with many crime versions
      cy.stubGetCrimeVersions({
        status: 200,
        query: '.*',
        response: {
          data: [
            {
              crimeVersionId: 'b06a517b-666b-4052-8bdc-b735e022c7c5',
              crimeReference: 'aaabbb',
              policeForceArea: 'CHESHIRE',
              crimeType: 'TOMV',
              crimeDate: '2025-01-01T00:00',
              batchId: 'CHS20260101',
              ingestionDateTime: '2026-01-02T12:34:56',
              matched: true,
              versionLabel: 'Latest version',
              updates: 'Crime type, Crime date, Crime time, Crime location',
            },
            {
              crimeVersionId: 'fe1592c0-dc78-46c3-88cd-144f1f1ec022',
              crimeReference: 'aaabbb',
              policeForceArea: 'CITY_OF_LONDON',
              crimeType: 'BOTD',
              crimeDate: '2025-01-01T00:00',
              batchId: 'CHS20260101',
              ingestionDateTime: '2026-01-02T12:34:56',
              matched: false,
              versionLabel: 'Version 2',
              updates: 'NA',
            },
          ],
          pageCount: 1,
          pageNumber: 0,
          pageSize: 30,
        },
      })

      // When the user loads the page with query params
      cy.visit('/proximity-alert?crimeReference=abc')

      const page = Page.verifyOnPage(CrimeSearchPage)

      // Then the crime reference field should show the search term
      page.searchForm.crimeReferenceField.shouldHaveValue('abc')

      // And the table should have many rows
      page.dataTable.shouldHaveColumns([
        'Matched',
        'Crime reference',
        'Police force area,\nBatch ID',
        'Crime type',
        'Crime date',
        'Ingestion date,\ntime',
        'Updates',
        'Versions',
      ])
      page.dataTable.shouldHaveRows([
        [
          'Yes',
          'aaabbb',
          'Cheshire,\nCHS20260101',
          'TOMV',
          '01/01/2025',
          '02/01/2026\n12:34:56',
          'Crime type\nCrime date\nCrime time\nCrime location',
          'Latest version',
        ],
        [
          'No',
          'aaabbb',
          'City of London,\nCHS20260101',
          'BOTD',
          '01/01/2025',
          '02/01/2026\n12:34:56',
          'NA',
          'Version 2',
        ],
      ])
      page.dataTable.shouldNotHavePagination()

      // And the version column should have the correct tags
      page.dataTable.cell(0, 7).find('.govuk-tag').should('have.class', 'govuk-tag--green')
      page.dataTable.cell(1, 7).find('.govuk-tag').should('have.class', 'govuk-tag--grey')

      // And the crime reference column should have the correct links
      page.dataTable
        .cell(0, 1)
        .find('a')
        .should('have.attr', 'href', '/proximity-alert/b06a517b-666b-4052-8bdc-b735e022c7c5')
      page.dataTable
        .cell(1, 1)
        .find('a')
        .should('have.attr', 'href', '/proximity-alert/fe1592c0-dc78-46c3-88cd-144f1f1ec022')
    })

    it('should show allow the user to navigate to other pages in the result set', () => {
      const response = {
        data: [
          {
            crimeVersionId: 'b06a517b-666b-4052-8bdc-b735e022c7c5',
            crimeReference: 'aaabbb',
            policeForceArea: 'CHESHIRE',
            crimeType: 'TOMV',
            crimeDate: '2025-01-01T00:00',
            batchId: 'CHS20260101',
            ingestionDateTime: '2026-01-02T12:34:56',
            matched: true,
            versionLabel: 'Latest version',
            updates: 'Crime type, Crime date, Crime time, Crime location',
          },
        ],
        pageCount: 2,
        pageNumber: 0,
        pageSize: 30,
      }

      // Stub first page response
      cy.stubGetCrimeVersions({
        status: 200,
        query: 'crimeRef=abc',
        response,
      })

      // Stub second page response
      cy.stubGetCrimeVersions({
        status: 200,
        query: 'crimeRef=abc&page=1',
        response: {
          ...response,
          pageNumber: 1,
        },
      })

      // When the user loads the page
      cy.visit('/proximity-alert?crimeReference=abc')

      const page = Page.verifyOnPage(CrimeSearchPage)

      // Then the table should have pagination
      page.dataTable.shouldHavePagination()
      page.dataTable.pagination.shouldHaveCurrentPage('1')
      page.dataTable.pagination.shouldHaveNextButton()
      page.dataTable.pagination.shouldNotHavePrevButton()

      // When the user navigates to the next page
      page.dataTable.pagination.next.click()

      // Then the url should include the page number and the original query
      cy.url().should('include', '?crimeReference=abc&page=2')

      // And the table should have pagination
      page.dataTable.shouldHavePagination()
      page.dataTable.pagination.shouldHaveCurrentPage('2')
      page.dataTable.pagination.shouldNotHaveNextButton()
      page.dataTable.pagination.shouldHavePrevButton()
    })
  })
})
