import { queryElement, queryElementAll } from '../../utils/utils'

const padDate = (input: HTMLInputElement) => {
  const value = input.value.trim()

  // Match: d/m/yyyy | dd/m/yyyy | d/mm/yyyy | dd/mm/yyyy
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return

  const [, dayMatched, monthMatched, year] = match

  // eslint-disable-next-line no-param-reassign
  input.value = `${dayMatched.padStart(2, '0')}/${monthMatched.padStart(2, '0')}/${year}`
}

const initialiseDateFilterForm = () => {
  const form = queryElement(document, '#dateFilterForm', HTMLFormElement)
  if (!form) return

  const inputs = queryElementAll(form, 'input', HTMLInputElement)
  const continueButton = queryElement(form, '#continue', HTMLButtonElement)
  const resetButton = queryElement(form, '#reset', HTMLButtonElement)

  const main = document.querySelector('main')
  const pageType = main?.dataset.page
  const isSubjectPage = pageType === 'subject'

  continueButton.disabled = isSubjectPage
  resetButton.disabled = isSubjectPage

  const enableButtons = () => {
    continueButton.disabled = false
    resetButton.disabled = false
  }

  inputs.forEach(input => {
    input.addEventListener('input', enableButtons)
    input.addEventListener('change', enableButtons)

    if (input.classList.contains('moj-js-datepicker-input')) {
      input.addEventListener('change', () => {
        padDate(input)
        enableButtons()
      })
    }
  })

  form.addEventListener('reset', () => {
    continueButton.disabled = isSubjectPage
    resetButton.disabled = true
  })
}

export default initialiseDateFilterForm
