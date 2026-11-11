import { Component } from 'govuk-frontend'

class CopyDataset extends Component<HTMLButtonElement> {
  constructor(root: HTMLButtonElement) {
    super(root)

    root.addEventListener('click', () => this.copy())
  }

  private async copy(): Promise<void> {
    const url = this.$root.dataset.copyUrl

    if (!url) {
      return
    }

    this.$root.disabled = true

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to retrieve dataset')
      }

      await navigator.clipboard.writeText(await response.text())

      this.showStatus('Table copied to clipboard', true)
    } catch {
      this.showStatus('Unable to copy table. Try again or download the CSV.', false)
    } finally {
      this.$root.disabled = false
    }
  }

  private showStatus(message: string, success: boolean): void {
    const status = document.getElementById('copy-dataset-status')

    if (!status) {
      return
    }

    status.textContent = message
    status.classList.toggle('app-copy-status--success', success)
    status.classList.toggle('app-copy-status--error', !success)
    status.hidden = false
  }

  static moduleName = 'copy-dataset'
}

export default CopyDataset
