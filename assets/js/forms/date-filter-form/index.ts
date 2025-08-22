const initialiseDateFilterForm = () => {
  const form = document.getElementById('dateFilterForm')

  if (form) {
    const inputs = form.querySelectorAll('input')
    const continueButton = form.querySelector('#continue') as HTMLButtonElement

    inputs.forEach(input => {
      input.addEventListener('change', () => {
        continueButton.disabled = false
      })
    })
  }
}

export default initialiseDateFilterForm
