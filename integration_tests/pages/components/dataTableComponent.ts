import { v4 as uuidv4 } from 'uuid'
import { PageElement } from '../page'
import PaginationComponent from './pagination'

export default class DataTableComponent {
  private elementCacheId: string = uuidv4()

  constructor() {
    cy.get('.datatable', { log: false }).as(`${this.elementCacheId}-element`)
  }

  // PROPERTIES

  get element(): PageElement {
    return cy.get(`@${this.elementCacheId}-element`, { log: false })
  }

  get table(): PageElement {
    return this.element.get('.govuk-table')
  }

  get noResultsMessage(): PageElement {
    return this.element.get('[data-qa="no-results-message"]')
  }

  get columns(): Cypress.Chainable<Array<string>> {
    return this.element.get('table thead tr th').then(cells => {
      return Cypress._.map(cells, 'innerText')
    })
  }

  get rows(): Cypress.Chainable<Array<Array<string>>> {
    return this.element.get('table tbody tr').then(rows => {
      const out = [] as Array<Array<string>>

      rows.each((_, el) => {
        out.push(Cypress._.map(el.children, 'innerText'))
      })

      return out
    })
  }

  get pagination(): PaginationComponent {
    return new PaginationComponent()
  }

  // HELPERS

  shouldHaveColumns(columns: Array<string>): void {
    this.columns.should('deep.equal', columns)
  }

  shouldHaveRows(rows: Array<Array<string>>): void {
    this.rows.should('deep.equal', rows)
  }

  shouldHaveResults(): void {
    this.table.should('exist')
    this.noResultsMessage.should('not.exist')
  }

  shouldNotHaveResults(): void {
    this.table.should('not.exist')
    this.noResultsMessage.should('have.text', 'There are no results.')
  }

  shouldHavePagination(): void {
    this.pagination.shouldExist()
  }

  shouldNotHavePagination(): void {
    this.pagination.shouldNotExist()
  }
}
