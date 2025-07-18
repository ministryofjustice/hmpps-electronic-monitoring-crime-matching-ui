const querySelectorAllHtmlElement = (selector: string) => {
  return Array.from(document.querySelectorAll(selector)).filter(node => node instanceof HTMLElement)
}

const updateSubjectSelectInputs = (radio: HTMLElement) => {
  const startDate = document.getElementById('subjectOrderStartDate') as HTMLInputElement
  const endDate = document.getElementById('subjectOrderEndDate') as HTMLInputElement
  const continueButton = document.getElementById('continue') as HTMLButtonElement

  if (startDate) {
    startDate.value = radio.dataset.start || ''
  }

  if (endDate) {
    endDate.value = radio.dataset.end || ''
  }

  if (continueButton) {
    continueButton.disabled = false
  }
}

const initSubjectSelect = () => {
  document.addEventListener('DOMContentLoaded', () => {
    const personSelectors = querySelectorAllHtmlElement('input[type="radio"][nam="personId"]')

    personSelectors.forEach(radio => {
      radio.addEventListener('change', () => updateSubjectSelectInputs(radio))
    })
  })
}

export default initSubjectSelect
