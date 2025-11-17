import { queryElement, queryElementAll } from '../../utils/utils'

const padDate = (input: HTMLInputElement) => {
  const value = input.value.trim()

  // Match dates where day and month can be 1 or 2 digits:
  // E.g. d/m/yyyy, dd/m/yyyy, d/mm/yyyy, or dd/mm/yyyy
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return

  const [, dayMatched, monthMatched, year] = match

  const day = dayMatched.padStart(2, '0')
  const month = monthMatched.padStart(2, '0')

  // eslint-disable-next-line no-param-reassign
  input.value = `${day}/${month}/${year}`
}

const initialiseDateFilterForm = () => {
  const form = queryElement(document, '#dateFilterForm', HTMLFormElement)

  if (form) {
    const inputs = queryElementAll(form, 'input', HTMLInputElement)
    const continueButton = queryElement(form, '#continue', HTMLButtonElement)
    const resetButton = queryElement(form, '#reset', HTMLButtonElement)

    const main = document.querySelector('main')
    const pageType = main?.dataset.page
    const isSubjectPage = pageType === 'subject'

    continueButton.disabled = isSubjectPage
    resetButton.disabled = isSubjectPage

    inputs.forEach(input => {
      input.addEventListener('change', () => {
        continueButton.disabled = false
        resetButton.disabled = false
      })

      if (input.classList.contains('moj-js-datepicker-input')) {
        input.addEventListener('change', () => {
          padDate(input)
        })
      }
    })

    form.addEventListener('reset', () => {
      continueButton.disabled = isSubjectPage
      resetButton.disabled = true
    })
  }
}

export default initialiseDateFilterForm
