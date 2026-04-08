import { v4 as uuidv4 } from 'uuid'
import { PageElement } from '../page'
import TabComponent from './tabComponent'
import SearchDeviceActivationPositionsFormComponent from './forms/searchDeviceActivationPositions'
import ExportLocationDataFormComponent from './forms/exportLocationDataForm'
import FormCheckboxesComponent from './formCheckboxesComponent'

export default class MapSidebarComponent {
  private elementCacheId: string = uuidv4()

  constructor(private readonly parent: PageElement) {
    this.parent.get('.app-map__sidebar', { log: false }).as(`${this.elementCacheId}-element`)
  }

  // PROPERTIES

  get element(): PageElement {
    return cy.get(`@${this.elementCacheId}-element`, { log: false })
  }

  get analysisTab(): TabComponent {
    return new TabComponent('#tab_analysis')
  }

  get timeTab(): TabComponent {
    return new TabComponent('#tab_time')
  }

  get analysisToggles(): FormCheckboxesComponent {
    return new FormCheckboxesComponent(this.element, 'analysis-toggles')
  }

  get form(): SearchDeviceActivationPositionsFormComponent {
    return new SearchDeviceActivationPositionsFormComponent()
  }

  get exportForm(): ExportLocationDataFormComponent {
    return new ExportLocationDataFormComponent()
  }

  // HELPERS

  shouldExist(): void {
    this.element.should('exist')
  }

  shouldHaveControls() {
    this.analysisToggles.shouldExist()
  }

  shouldHaveTabs() {
    this.analysisTab.shouldExist()
    this.timeTab.shouldExist()
  }
}
