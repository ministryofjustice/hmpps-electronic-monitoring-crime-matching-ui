// The table component as described at https://design-system.service.gov.uk/components/table/

export type GovUkTableCell = {
  // If `html` is set, this is not required. Text for cells in table rows. If `html` is provided, the `text` option will be ignored.
  text?: string

  // If `text` is set, this is not required. HTML for cells in table rows. If `html` is provided, the `text` option will be ignored.
  html?: string

  // Specify format of a cell. Currently we only use "numeric".
  format?: 'numeric'

  // Classes to add to the table row cell.
  classes?: string

  // Specify how many columns a cell extends.
  colspan?: number

  // Specify how many rows a cell extends.
  rowspan?: number

  // HTML attributes (for example data attributes) to add to the table cell.
  attributes?: Record<string, string>
}
