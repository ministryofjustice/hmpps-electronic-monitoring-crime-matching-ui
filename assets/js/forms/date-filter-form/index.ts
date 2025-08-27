import { queryElement, queryElementAll } from '../../utils/utils'

const initialiseDateFilterForm = () => {
  const form = queryElement(document, '#dateFilterForm', HTMLFormElement)

  if (form) {
    const inputs = queryElementAll(form, 'input', HTMLInputElement)
    const continueButton = queryElement(form, '#continue', HTMLButtonElement)
    const resetButton = queryElement(form, '#reset', HTMLButtonElement)

    inputs.forEach(input => {
      input.addEventListener('change', () => {
        continueButton.disabled = false
        resetButton.disabled = false
      })
    })

    form.addEventListener('reset', () => {
      continueButton.disabled = true
      resetButton.disabled = true
    })
  }
}

export default initialiseDateFilterForm
