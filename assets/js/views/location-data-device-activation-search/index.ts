import initialiseDateFilterForm from '../../forms/date-filter-form'
import { queryElement, queryElementAll } from '../../utils/utils'

const handleRadioChange = (radio: HTMLElement, form: HTMLFormElement) => {
  const deviceActivationId = radio.getAttribute('value')

  if (form) {
    form.setAttribute('action', `/location-data/device-activations/${deviceActivationId}`)
    form.setAttribute('style', 'display: block;')
  }
}

const initialiseLocationDataDeviceActivationSearchView = () => {
  const form = queryElement(document, '#dateFilterForm', HTMLFormElement)
  const radios = queryElementAll(document, 'input[type="radio"][name="deviceActivationId"]', HTMLInputElement)
  form.setAttribute('style', 'display: none;')

  radios.forEach(radio => {
    radio.addEventListener('change', () => handleRadioChange(radio, form))

    // Form loaded with radio checked
    if (radio.checked) {
      handleRadioChange(radio, form)
    }
  })

  initialiseDateFilterForm()
}

export default initialiseLocationDataDeviceActivationSearchView
