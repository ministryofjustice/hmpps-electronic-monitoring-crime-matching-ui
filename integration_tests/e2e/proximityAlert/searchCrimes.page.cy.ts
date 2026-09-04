import { hubCaseworker } from '../../fixtures/auth'
import Page from '../../pages/page'
import CrimeSearchPage from '../../pages/proximityAlert/crimeSearch'

context('Search Crimes', () => {
  context('Searching for crime versions', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', hubCaseworker)
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
        'Crime reference,\npolice force area',
        'Matched device wearers',
        'Crime type',
        'Crime date',
        'Data ingested',
        'Batch ID',
        'Updates',
        'Source data version',
      ])
      page.dataTable.shouldHaveRows([['Enter a crime reference and click search.']])
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
        'Crime reference,\npolice force area',
        'Matched device wearers',
        'Crime type',
        'Crime date',
        'Data ingested',
        'Batch ID',
        'Updates',
        'Source data version',
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
        'Crime reference,\npolice force area',
        'Matched device wearers',
        'Crime type',
        'Crime date',
        'Data ingested',
        'Batch ID',
        'Updates',
        'Source data version',
      ])
      page.dataTable.shouldHaveRows([
        [
          'aaabbb\nCheshire',
          'Yes',
          'TOMV',
          '01/01/2025',
          '02/01/2026\n12:34:56',
          'CHS20260101',
          'Crime type\nCrime date\nCrime time\nCrime location',
          'Latest version',
        ],
        [
          'aaabbb\nCity of London',
          'No',
          'BOTD',
          '01/01/2025',
          '02/01/2026\n12:34:56',
          'CHS20260101',
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
        .cell(0, 0)
        .find('a')
        .should(
          'have.attr',
          'href',
          '/proximity-alert/b06a517b-666b-4052-8bdc-b735e022c7c5?returnTo=%2Fproximity-alert%3FcrimeReference%3Dabc',
        )
      page.dataTable
        .cell(1, 0)
        .find('a')
        .should(
          'have.attr',
          'href',
          '/proximity-alert/fe1592c0-dc78-46c3-88cd-144f1f1ec022?returnTo=%2Fproximity-alert%3FcrimeReference%3Dabc',
        )

      // And the expected audit message was sent
      cy.expectAuditEvents([
        {
          who: 'USER1',
          details: '{"params":{},"query":{"crimeReference":"abc"}}',
          what: 'PAGE_VIEW_PROXIMITY_ALERT_CRIME_VERSIONS',
          service: 'hmpps-electronic-monitoring-crime-matching-ui',
        },
      ])
    })

    it('should group versions of the same crime under a single crime reference cell', () => {
      // Given an API response with two versions of the same crime followed by a different crime
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
              policeForceArea: 'CHESHIRE',
              crimeType: 'TOMV',
              crimeDate: '2025-01-01T00:00',
              batchId: 'CHS20251230',
              ingestionDateTime: '2026-01-01T12:34:56',
              matched: false,
              versionLabel: 'Version 1',
              updates: 'NA',
            },
            {
              crimeVersionId: '2a1e4c2e-6a3f-4f8a-9c1a-5e6f7a8b9c0d',
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

      Page.verifyOnPage(CrimeSearchPage)

      // Then the first row shows the crime reference and police force area, spanning both of its versions
      cy.get('.crime-versions-table tbody tr')
        .eq(0)
        .find('td')
        .eq(0)
        .should('have.attr', 'rowspan', '2')
        .and('contain.text', 'Cheshire')

      // And the second row (still part of the first crime) has one fewer cell, since the first
      // column is covered by the rowspan from the row above
      cy.get('.crime-versions-table tbody tr').eq(1).find('td').should('have.length', 7)

      // And the third row starts a new crime, so it has its own crime reference cell
      cy.get('.crime-versions-table tbody tr')
        .eq(2)
        .find('td')
        .eq(0)
        .should('have.attr', 'rowspan', '1')
        .and('contain.text', 'City of London')
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
        query: 'crimeRef=abc&pageSize=10',
        response,
      })

      // Stub second page response
      cy.stubGetCrimeVersions({
        status: 200,
        query: 'crimeRef=abc&page=1&pageSize=10',
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

      // And the expected audit message was sent
      cy.expectAuditEvents([
        {
          who: 'USER1',
          details: '{"params":{},"query":{"crimeReference":"abc","page":"2"}}',
          what: 'PAGE_VIEW_PROXIMITY_ALERT_CRIME_VERSIONS',
          service: 'hmpps-electronic-monitoring-crime-matching-ui',
        },
      ])
    })
  })
})
