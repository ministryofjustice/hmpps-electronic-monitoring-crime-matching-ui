// The mojAlert component as described at https://design-patterns.service.justice.gov.uk/components/alert/.
export type MojAlertVariant = 'error' | 'information' | 'success' | 'warning'

export type MojAlert = {
  // The text that displays in the alert. Any string can be used. If you set html, this option is not required and is ignored.
  text?: string

  // The HTML to use in the alert. Any string can be used. If you set html, text is not required and is ignored.
  html?: string

  // A short title for each alert, used as a unique accessible label. Can be displayed as a heading in the alert using showTitleAsHeading.
  title?: string

  // Set to true to display the title as a heading. The default is false.
  showTitleAsHeading?: boolean

  // The HTML tag used for the heading if showTitleAsHeading is true. You can only use the values “h2”, “h3”, or “h4”. The default is “h2”
  headingTag?: string

  // The alert variant being used. It’s “information”, “success”, “warning” or “error”. The default is “information”.
  variant?: MojAlertVariant

  // Overrides the value of the role attribute for the alert. Defaults to “region”.
  role?: string

  // If role is set to “alert”, JavaScript moves the keyboard focus to the alert when the page loads. To disable this behaviour, set disableAutoFocus to true.
  disableAutoFocus?: boolean

  // Set to true to allow the alert to be dismissed. The default is false.
  dismissible?: boolean

  // The text label for the dismiss button. The default is “Dismiss”.
  dismissText?: string

  // A CSS selector for an element to place focus on when the alert is dismissed
  focusOnDismissSelector?: string

  // The classes that you want to add to the alert.
  classes?: string

  // The HTML attributes that you want to add to the alert, for example data attributes.
  attributes?: Record<string, unknown>
}
