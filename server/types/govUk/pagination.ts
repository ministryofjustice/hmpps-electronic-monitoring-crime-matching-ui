// The pagination component as described at https://design-system.service.gov.uk/components/pagination.
export type GovUkPagination = {
  // The items within the pagination component.
  items?: Array<GovUkPaginationItem>

  // A link to the previous page, if there is a previous page.
  previous?: GovUkPaginationPreviousItem

  // A link to the next page, if there is a next page.
  next?: GovUkPaginationNextItem

  // The label for the navigation landmark that wraps the pagination. Defaults to `"Pagination"`.
  landmarkLabel?: string

  // The classes you want to add to the pagination `nav` parent.
  classes?: string

  // The HTML attributes (for example, data attributes) you want to add to the pagination `nav` parent.
  attributes?: Record<string, unknown>
}

export type GovUkPaginationItem = {
  // The pagination item text – usually a page number.  Required unless the item is an ellipsis.
  number?: string

  // The visually hidden label for the pagination item, which will be applied to an `aria-label` and announced by screen readers on the pagination item link. Should include page number. Defaults to, for example "Page 1".
  visuallyHiddenText?: string

  // The link's URL. Required unless the item is an ellipsis.
  href?: string

  // Set to `true` to indicate the current page the user is on.
  current?: boolean

  // Use this option if you want to specify an ellipsis at a given point between numbers. If you set this option as `true`, any other options for the item are ignored.
  ellipsis?: boolean

  // The HTML attributes (for example, data attributes) you want to add to the anchor.
  attributes?: Record<string, unknown>
}

export type GovUkPaginationNextItem = {
  // The text content of the link to the next page. Defaults to `"Next page"`, with 'page' being visually hidden. If `html` is provided, the `text` option will be ignored.
  text?: string

  // The HTML content of the link to the next page. Defaults to `"Next page"`, with 'page' being visually hidden. If `html` is provided, the `text` option will be ignored.
  html?: string

  // The optional label that goes underneath the link to the next page, providing further context for the user about where the link goes.
  labelText?: string

  // The next page's URL.
  href?: string

  // The HTML attributes (for example, data attributes) you want to add to the anchor.
  attributes?: Record<string, unknown>
}

export type GovUkPaginationPreviousItem = {
  // The text content of the link to the previous page. Defaults to `"Previous page"`, with 'page' being visually hidden. If `html` is provided, the `text` option will be ignored.
  text?: string

  // The HTML content of the link to the previous page. Defaults to `"Previous page"`, with 'page' being visually hidden. If `html` is provided, the `text` option will be ignored.
  html?: string

  // The optional label that goes underneath the link to the previous page, providing further context for the user about where the link goes.
  labelText?: string

  // The previous page's URL.
  href?: string

  // The HTML attributes (for example, data attributes) you want to add to the anchor.
  attributes?: Record<string, unknown>
}
