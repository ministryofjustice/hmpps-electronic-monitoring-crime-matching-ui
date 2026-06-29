import { hubManager } from '../../fixtures/auth'
import CreateHubManagerPage from '../../pages/hubManagers/create'
import ListHubManagersPage from '../../pages/hubManagers/list'
import Page from '../../pages/page'

context('Create Hub Manager', () => {
  context('Creating a hub manager', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', hubManager)
      cy.signIn()
    })

    it('should navigate to the create hub managers page', () => {
      // Given a successful api response
      cy.stubGetHubManagers()

      // When the user loads the page
      cy.visit('/hub-managers')

      const page = Page.verifyOnPage(ListHubManagersPage)

      // And clicks the create hub manager button
      page.createHubManagerButton.click()

      // Then the user should be taken to the create hub manager page
      Page.verifyOnPage(CreateHubManagerPage)
    })

    it('should display a list of hub managers', () => {
      // Given a successful api response
      cy.stubGetHubManagers({
        status: 200,
        response: {
          data: [
            {
              id: '205250b7-c150-410e-8dca-70c170dcec85',
              name: 'Test manager 1',
              hasSignature: true,
            },
          ],
        },
      })

      // When the user loads the page
      cy.visit('/hub-managers')

      const page = Page.verifyOnPage(ListHubManagersPage)

      // Then the user should be shown a list of hub managers
      page.dataTable.shouldHaveColumns(['Name', 'Has signature?', 'Actions'])
      page.dataTable.shouldHaveRows([['Test manager 1', 'true', 'Delete']])

      // And the expected audit message was sent
      cy.expectAuditEvents([
        {
          who: 'USER1',
          details: '{"params":{},"query":{}}',
          what: 'PAGE_VIEW_HUB_MANAGERS',
          service: 'hmpps-electronic-monitoring-crime-matching-ui',
        },
      ])

      // And the actions column should have a form to delete the hub manager
      page.dataTable
        .cell(0, 2)
        .find('form')
        .should('have.attr', 'action', '/hub-managers/205250b7-c150-410e-8dca-70c170dcec85/delete')
    })

    it('should delete a hub manager', () => {
      // Given a successful api response
      cy.stubGetHubManagers({
        status: 200,
        response: {
          data: [
            {
              id: '205250b7-c150-410e-8dca-70c170dcec85',
              name: 'Test manager 1',
              hasSignature: true,
            },
          ],
        },
      })
      cy.stubDeleteHubManager({
        id: '205250b7-c150-410e-8dca-70c170dcec85',
        status: 204,
      })

      // When the user loads the page
      cy.visit('/hub-managers')

      const page = Page.verifyOnPage(ListHubManagersPage)

      // And the user clicks delete
      page.dataTable.cell(0, 2).find('form').submit()

      // Then the user should be shown an updated list of hub managers
      Page.verifyOnPage(ListHubManagersPage)

      // And the expected audit messages are sent
      cy.expectAuditEvents([
        {
          who: 'USER1',
          details: '{"params":{"id":"205250b7-c150-410e-8dca-70c170dcec85"}}',
          what: 'DELETE_ATTEMPT_HUB_MANAGER',
          service: 'hmpps-electronic-monitoring-crime-matching-ui',
        },
        {
          who: 'USER1',
          details: '{"params":{"id":"205250b7-c150-410e-8dca-70c170dcec85"}}',
          what: 'DELETE_SUCCESS_HUB_MANAGER',
          service: 'hmpps-electronic-monitoring-crime-matching-ui',
        },
      ])
    })
  })
})
