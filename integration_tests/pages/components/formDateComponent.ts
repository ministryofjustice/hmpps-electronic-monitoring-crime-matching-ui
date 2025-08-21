import FormInputComponent from './formInputComponent'

export default class FormDateComponent extends FormInputComponent {
  get validationMessage() {
    return this.element.parents('.moj-datepicker', { log: false }).find('.govuk-error-message', { log: false })
  }
}
