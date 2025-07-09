export default function initSubjectSelect() {
  function updateSubjectSelectInputs(radio) {
    document.getElementById('subjectOrderStartDate').value = radio.dataset.start
    document.getElementById('subjectOrderEndDate').value = radio.dataset.end
    document.getElementById('continue').disabled = false
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[type="radio"][name="personId"]').forEach(radio => {
      radio.addEventListener('change', () => updateSubjectSelectInputs(radio))
    })
  })
}
