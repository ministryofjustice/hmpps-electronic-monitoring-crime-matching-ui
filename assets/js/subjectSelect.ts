const querySelectorAllHtmlElement = (selector: string) => {
  return Array.from(document.querySelectorAll(selector)).filter(node => node instanceof HTMLElement)
}

const updateFormState = (radio: HTMLElement) => {
  const deviceActivationId = radio.getAttribute('value')
  const form = document.getElementById('dateFilterForm')
  const continueButton = document.getElementById('continue') as HTMLButtonElement

  if (continueButton) {
    continueButton.disabled = false
  }

  if (form) {
    form.setAttribute('action', `/location-data/device-activations/${deviceActivationId}`)
  }
}

const initSubjectSelect = () => {
  document.addEventListener('DOMContentLoaded', () => {
    const radios = querySelectorAllHtmlElement('input[type="radio"][name="deviceActivationId"]')

    radios.forEach(radio => {
      radio.addEventListener('change', () => updateFormState(radio))
    })
  })
}

export default initSubjectSelect
