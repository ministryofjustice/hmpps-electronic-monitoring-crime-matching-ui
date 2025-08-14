import { v4 as uuidv4 } from 'uuid'
import { PageElement } from '../page'
import FormCheckboxComponent from './formCheckboxComponent'
import TabComponent from './tabComponent'
import SearchDeviceActivationPositionsFormComponent from './forms/searchDeviceActivationPositions'

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

  get showLocationToggle(): FormCheckboxComponent {
    return new FormCheckboxComponent(this.element, 'Show locations')
  }

  get showConfidenceCirclesToggle(): FormCheckboxComponent {
    return new FormCheckboxComponent(this.element, 'Show confidence circles')
  }

  get showTracksToggle(): FormCheckboxComponent {
    return new FormCheckboxComponent(this.element, 'Show tracks')
  }

  get showLocationNumberingToggle(): FormCheckboxComponent {
    return new FormCheckboxComponent(this.element, 'Show location numbering')
  }

  get form(): SearchDeviceActivationPositionsFormComponent {
    return new SearchDeviceActivationPositionsFormComponent()
  }

  // HELPERS

  shouldExist(): void {
    this.element.should('exist')
  }

  shouldHaveControls() {
    this.showLocationToggle.shouldExist()
    this.showConfidenceCirclesToggle.shouldExist()
    this.showTracksToggle.shouldExist()
    this.showLocationNumberingToggle.shouldExist()
  }

  shouldHaveTabs() {
    this.analysisTab.shouldExist()
    this.timeTab.shouldExist()
  }
}
