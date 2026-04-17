import { Component } from 'govuk-frontend'

/**
 * Select All Component
 *
 * This allows a single checkbox element to select many other checkbox elements
 * if their name matches the value of the control checkbox.
 */
class SelectAll extends Component {
  private targets: Array<HTMLInputElement>

  private syncing: boolean = false

  constructor($root: Element) {
    super($root)

    // Find targets
    this.targets = this.getTargets()

    // Handle events
    this.$input.addEventListener('click', event => this.handleClick(event))

    // Handle updates to targets
    for (const target of this.targets) {
      target.addEventListener('change', () => this.handleTargetChange())
    }
  }

  private get $input(): HTMLInputElement {
    return this.$root.querySelector('input[type="checkbox"]') as HTMLInputElement
  }

  private getTargets(): Array<HTMLInputElement> {
    return [...document.querySelectorAll(`input[type='checkbox'][name=${this.$input.value}]`).entries()].map(
      ([_, element]) => element as HTMLInputElement,
    )
  }

  /**
   * Updates the state of the target checkboxes and fire a 'change' event. The
   * syncing state is recorded.
   */
  private updateTargets(checked: boolean): void {
    this.syncing = true

    for (const checkbox of this.targets) {
      checkbox.checked = checked
      checkbox.dispatchEvent(new Event('change', { bubbles: true }))
    }

    this.syncing = false
  }

  /**
   * Update the state of the "select all" if a target checkbox is changed.
   * Because "selecting all" will trigger "change" events in target checkboxes,
   * we do not update the state of this checkbox if already updating
   */
  private handleTargetChange(): void {
    if (!this.syncing) {
      this.$input.checked = this.targets.some(target => target.checked)
    }
  }

  /**
   * When the "select all" checkbox is clicked, update all target checkboxes
   */
  private handleClick(event: MouseEvent): void {
    this.updateTargets((event.target as HTMLInputElement).checked)
  }

  static moduleName = 'select-all'
}

export default SelectAll
