import { v4 as uuidv4 } from 'uuid'
import { PageElement } from '../page'
import TabComponent from './tabComponent'
import SearchDeviceActivationPositionsFormComponent from './forms/searchDeviceActivationPositions'
import ExportLocationDataFormComponent from './forms/exportLocationDataForm'
import FormCheckboxesComponent from './formCheckboxesComponent'
import SummaryListComponent from './summaryListComponent'

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

  get reportsTab(): TabComponent {
    return new TabComponent('#tab_reports')
  }

  get analysisToggles(): FormCheckboxesComponent {
    return new FormCheckboxesComponent(this.element, 'analysis-toggles')
  }

  get crimeToggle(): FormCheckboxesComponent {
    return new FormCheckboxesComponent(this.element, 'crime-toggle')
  }

  get crimeVersionSummaryList(): SummaryListComponent {
    return new SummaryListComponent('.crime-version-summary-list')
  }

  get viewOnMapLink() {
    return this.element.get('.govuk-link').contains('View on map')
  }

  get versionLabel() {
    return this.element.get('.govuk-tag')
  }

  get form(): SearchDeviceActivationPositionsFormComponent {
    return new SearchDeviceActivationPositionsFormComponent()
  }

  get exportForm(): ExportLocationDataFormComponent {
    return new ExportLocationDataFormComponent()
  }

  // HELPERS

  get deviceWearerToggles() {
    return new FormCheckboxesComponent(this.element, 'device-wearer-toggle')
  }

  get deviceWearerTrackToggles() {
    return new FormCheckboxesComponent(this.element, 'device-wearer-tracks')
  }

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

  shouldHaveProximityControls() {
    this.crimeToggle.shouldExist()
  }

  shouldHaveProximityTabs() {
    this.analysisTab.shouldExist()
    this.reportsTab.shouldExist()
  }

  shouldHaveVersionLabel(value: string) {
    this.versionLabel.should('contain.text', value)
  }

  shouldHaveDeviceWearer(name: string, nomisId: string, deviceId: string, count: string) {
    const wearer = new SummaryListComponent('.device-wearer-summary-list')
    wearer.shouldExist()
    wearer.shouldHaveItem('Name:', name)
    wearer.shouldHaveItem('NOMIS ID:', nomisId)
    wearer.shouldHaveItem('ID:', deviceId)
    wearer.shouldHaveItem('Count:', count)
  }

  shouldNotHaveDeviceWearer() {
    const wearer = new SummaryListComponent('.device-wearer-summary-list')
    wearer.shouldNotExist()
  }
}
