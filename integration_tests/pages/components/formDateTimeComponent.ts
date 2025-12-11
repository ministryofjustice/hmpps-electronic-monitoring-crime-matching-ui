import { v4 as uuidv4 } from 'uuid'

import { PageElement } from '../page'
import FormInputComponent from './formInputComponent'
import FormDateComponent from './formDateComponent'

export type FormDateTimeData = {
  date: string
  hour: string
  minute: string
  second?: string
}

export default class FormDateTimeComponent {
  private elementCacheId: string = uuidv4()

  constructor(
    private readonly parent: PageElement,
    private readonly id: string,
    private readonly name: string,
    private readonly label: string,
  ) {
    this.parent.get(this.id, { log: true }).as(`${this.elementCacheId}-element`)
    this.element.should('exist')
  }

  // PROPERTIES

  get element(): PageElement {
    return cy.get(`@${this.elementCacheId}-element`, { log: true })
  }

  get dateComponent(): FormDateComponent {
    return new FormDateComponent(this.element, this.label)
  }

  get hourComponent(): FormInputComponent {
    return new FormInputComponent(this.element, 'Hour')
  }

  get minuteComponent(): FormInputComponent {
    return new FormInputComponent(this.element, 'Minute')
  }

  // HELPERS

  set(data: FormDateTimeData) {
    this.dateComponent.set(data.date)
    this.hourComponent.set(data.hour)
    this.minuteComponent.set(data.minute)
  }

  shouldBeDisabled() {
    this.dateComponent.shouldBeDisabled()
    this.hourComponent.shouldBeDisabled()
    this.minuteComponent.shouldBeDisabled()
  }

  shouldNotBeDisabled(): void {
    this.dateComponent.shouldNotBeDisabled()
    this.hourComponent.shouldNotBeDisabled()
    this.minuteComponent.shouldNotBeDisabled()
  }

  shouldHaveValue(data: FormDateTimeData) {
    this.dateComponent.shouldHaveValue(data.date)
    this.hourComponent.shouldHaveValue(data.hour)
    this.minuteComponent.shouldHaveValue(data.minute)
  }

  shouldHaveValidationMessage(message: string) {
    this.dateComponent.shouldHaveValidationMessage(message)
  }

  shouldNotHaveValidationMessage(): void {
    this.dateComponent.shouldNotHaveValidationMessage()
  }
}
