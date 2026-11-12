import AppPage from '../appPage'

export default class ManagementInformationLandingPage extends AppPage {
  constructor() {
    super('Management information')
  }

  get datasets() {
    return cy.get('.govuk-list li h3').then(elements => {
      return Cypress._.map(elements, el => {
        return {
          text: el.innerText,
          link: el.querySelector('a')?.getAttribute('href'),
        }
      })
    })
  }
}
