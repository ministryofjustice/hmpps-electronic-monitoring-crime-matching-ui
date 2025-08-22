import initialiseDateFilterForm from '../../forms/date-filter-form'

const querySelectorAllHtmlElement = (selector: string) => {
  return Array.from(document.querySelectorAll(selector)).filter(node => node instanceof HTMLElement)
}

const handleRadioChange = (radio: HTMLElement) => {
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

const initialiseLocationDataDeviceActivationSearchView = () => {
  const radios = querySelectorAllHtmlElement('input[type="radio"][name="deviceActivationId"]')

  radios.forEach(radio => {
    radio.addEventListener('change', () => handleRadioChange(radio))
  })

  initialiseDateFilterForm()
}

export default initialiseLocationDataDeviceActivationSearchView
