import initialiseDateFilterForm from '../../forms/date-filter-form'
import { queryElement, queryElementAll } from '../../utils/utils'

const handleRadioChange = (radio: HTMLElement, form: HTMLFormElement, continueButton: HTMLButtonElement) => {
  const deviceActivationId = radio.getAttribute('value')

  if (continueButton) {
    // eslint-disable-next-line no-param-reassign
    continueButton.disabled = false
  }

  if (form) {
    form.setAttribute('action', `/location-data/device-activations/${deviceActivationId}`)
  }
}

const initialiseLocationDataDeviceActivationSearchView = () => {
  const form = queryElement(document, '#dateFilterForm', HTMLFormElement)
  const radios = queryElementAll(document, 'input[type="radio"][name="deviceActivationId"]', HTMLInputElement)
  const continueButton = queryElement(document, '#continue', HTMLButtonElement)

  radios.forEach(radio => {
    radio.addEventListener('change', () => handleRadioChange(radio, form, continueButton))

    // Form loaded with radio checked
    if (radio.checked) {
      handleRadioChange(radio, form, continueButton)
    }
  })

  initialiseDateFilterForm()
}

export default initialiseLocationDataDeviceActivationSearchView
