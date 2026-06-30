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
      cy.stubGetHubManagers()
      cy.stubCreateHubManager({
        status: 201,
        response: {
          data: {
            id: '2cbd9196-3051-4aa1-a5f7-d322ca1b89e7',
            name: '',
            hasSignature: true,
          },
        },
      })
      cy.stubUpdateHubManagerSignature({
        id: '2cbd9196-3051-4aa1-a5f7-d322ca1b89e7',
        status: 200,
        response: {
          data: {
            id: '2cbd9196-3051-4aa1-a5f7-d322ca1b89e7',
            name: '',
            hasSignature: true,
          },
        },
      })
    })

    it('should display the create hub manager form', () => {
      // When the user loads the page
      cy.visit('/hub-managers/create')

      const page = Page.verifyOnPage(CreateHubManagerPage)

      // Then the form should be visible
      page.createManagerForm.nameField.element.should('exist')
      page.createManagerForm.signatureField.element.should('exist')
      page.createManagerForm.createButton.should('exist')
    })

    it('should show validation errors if the form is submitted with no data', () => {
      // When the user loads the page
      cy.visit('/hub-managers/create')

      let page = Page.verifyOnPage(CreateHubManagerPage)

      // And submits the form
      page.createManagerForm.createButton.click()

      // Then the page should have reloaded
      cy.url().should('include', '/hub-managers/create')
      page = Page.verifyOnPage(CreateHubManagerPage)

      // And should have validation messages
      page.createManagerForm.nameField.shouldHaveValidationMessage('Enter a name')
      page.createManagerForm.signatureField.shouldHaveValidationMessage('Upload a file')
    })

    it('should create a hub manager and redirect to the list', () => {
      // When the user loads the page
      cy.visit('/hub-managers/create')

      const page = Page.verifyOnPage(CreateHubManagerPage)

      // And submits the form
      page.createManagerForm.fillInWith({
        name: 'Test manager',
        signature: {
          contents: 'Test content',
          fileName: 'signature.png',
        },
      })
      page.createManagerForm.createButton.click()

      // Then the page should redirect to the list
      Page.verifyOnPage(ListHubManagersPage)

      // And the expected audit messages are sent
      cy.expectAuditEvents([
        {
          who: 'USER1',
          what: 'CREATE_ATTEMPT_HUB_MANAGER',
          service: 'hmpps-electronic-monitoring-crime-matching-ui',
          details: {
            name: 'Test manager',
          },
        },
        {
          who: 'USER1',
          what: 'CREATE_SUCCESS_HUB_MANAGER',
          service: 'hmpps-electronic-monitoring-crime-matching-ui',
          details: {
            name: 'Test manager',
          },
        },
      ])
    })
  })
})
