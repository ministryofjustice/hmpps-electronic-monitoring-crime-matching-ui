import { Component } from 'govuk-frontend'

/**
 * Select All Component
 *
 * This allows a single checkbox element to select many other checkbox elements
 * if their value matches the pattern defined in the value of the control checkbox.
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
    const re = new RegExp(this.$input.value)
    const allCheckboxes = document.querySelectorAll("input[type='checkbox']").entries()

    return [...allCheckboxes]
      .filter(([_, element]) => re.test((element as HTMLInputElement).value))
      .map(([_, e]) => e as HTMLInputElement)
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
      this.$input.checked = this.targets.every(target => target.checked)
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
