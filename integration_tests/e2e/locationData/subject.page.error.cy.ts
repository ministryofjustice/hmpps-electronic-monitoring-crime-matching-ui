import SubjectPage from '../../pages/locationData/subject'
import Page from '../../pages/page'

const deviceActivationId = '1'
const url = `/location-data/device-activations/${deviceActivationId}`

context('Location Data', () => {
  context('Viewing a device activation - Error States', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should display validation errors if no dates in url', () => {
      cy.stubGetDeviceActivation()
      cy.visit(url)

      const page = Page.verifyOnPage(SubjectPage)

      page.map.shouldExist()
      page.map.shouldNotHaveAlerts()
      page.map.sidebar.shouldExist()
      page.map.sidebar.shouldHaveTabs()
      page.map.sidebar.timeTab.shouldBeActive()
      page.map.sidebar.analysisTab.shouldNotBeActive()
      page.map.sidebar.shouldHaveControls()

      page.map.sidebar.form.checkHasForm()
      page.map.sidebar.form.fromDateField.shouldHaveValidationMessage('You must enter a valid value for date')
      page.map.sidebar.form.toDateField.shouldHaveValidationMessage('You must enter a valid value for date')
    })

    it('should display validation errors if invalid dates in url', () => {
      const from = '2025-00-00T00:00:00.000Z'
      const to = '2025-00-00T00:00:00.000Z'
      cy.stubGetDeviceActivation()
      cy.visit(`${url}?from=${from}&to=${to}`)

      const page = Page.verifyOnPage(SubjectPage)

      page.map.shouldExist()
      page.map.shouldNotHaveAlerts()
      page.map.sidebar.shouldExist()
      page.map.sidebar.shouldHaveTabs()
      page.map.sidebar.timeTab.shouldBeActive()
      page.map.sidebar.analysisTab.shouldNotBeActive()
      page.map.sidebar.shouldHaveControls()

      page.map.sidebar.form.checkHasForm()
      page.map.sidebar.form.fromDateField.shouldHaveValidationMessage('You must enter a valid value for date')
      page.map.sidebar.form.toDateField.shouldHaveValidationMessage('You must enter a valid value for date')
    })

    it('should display validation error if to date is before from date in url', () => {
      const from = '2025-01-02T00:00:00.000Z'
      const to = '2025-01-01T00:00:00.000Z'
      cy.stubGetDeviceActivation()
      cy.visit(`${url}?from=${from}&to=${to}`)

      const page = Page.verifyOnPage(SubjectPage)

      page.map.shouldExist()
      page.map.shouldNotHaveAlerts()
      page.map.sidebar.shouldExist()
      page.map.sidebar.shouldHaveTabs()
      page.map.sidebar.timeTab.shouldBeActive()
      page.map.sidebar.analysisTab.shouldNotBeActive()
      page.map.sidebar.shouldHaveControls()

      page.map.sidebar.form.checkHasForm()
      page.map.sidebar.form.fromDateField.shouldNotHaveValidationMessage()
      page.map.sidebar.form.toDateField.shouldHaveValidationMessage('To date must be after From date')
    })

    it('should display validation errors if date period in url exceed 48 hours', () => {
      const from = '2025-01-01T00:00:00.000Z'
      const to = '2025-01-05T00:00:00.000Z'
      cy.stubGetDeviceActivation()
      cy.visit(`${url}?from=${from}&to=${to}`)

      const page = Page.verifyOnPage(SubjectPage)

      page.map.shouldExist()
      page.map.shouldNotHaveAlerts()
      page.map.sidebar.shouldExist()
      page.map.sidebar.shouldHaveTabs()
      page.map.sidebar.timeTab.shouldBeActive()
      page.map.sidebar.analysisTab.shouldNotBeActive()
      page.map.sidebar.shouldHaveControls()

      page.map.sidebar.form.checkHasForm()
      page.map.sidebar.form.fromDateField.shouldHaveValue({
        date: '01/01/2025',
        hour: '00',
        minute: '00',
        second: '00',
      })
      page.map.sidebar.form.fromDateField.shouldHaveValidationMessage(
        'Date and time search window should not exceed 48 hours',
      )
      page.map.sidebar.form.toDateField.shouldNotHaveValidationMessage()
      page.map.sidebar.form.toDateField.shouldHaveValue({ date: '05/01/2025', hour: '00', minute: '00', second: '00' })
    })

    it('should display validation errors if date period in url exceeds device activation period', () => {
      const from = '2025-02-01T00:00:00.000Z'
      const to = '2025-02-02T00:00:00.000Z'
      cy.stubGetDeviceActivation({
        deviceActivationId: '1',
        status: 200,
        response: {
          data: {
            deviceActivationId: 1,
            deviceId: 123456789,
            personId: 123456789,
            deviceActivationDate: '2025-01-01T00:00:00.000Z',
            deviceDeactivationDate: '2025-01-02T00:00:00.000Z',
          },
        },
      })
      cy.visit(`${url}?from=${from}&to=${to}`)

      const page = Page.verifyOnPage(SubjectPage)

      page.map.shouldExist()
      page.map.shouldNotHaveAlerts()
      page.map.sidebar.shouldExist()
      page.map.sidebar.shouldHaveTabs()
      page.map.sidebar.timeTab.shouldBeActive()
      page.map.sidebar.analysisTab.shouldNotBeActive()
      page.map.sidebar.shouldHaveControls()

      page.map.sidebar.form.checkHasForm()
      page.map.sidebar.form.fromDateField.shouldHaveValue({
        date: '01/02/2025',
        hour: '00',
        minute: '00',
        second: '00',
      })
      page.map.sidebar.form.fromDateField.shouldHaveValidationMessage(
        'Date and time search window should be within device activation date range',
      )
      page.map.sidebar.form.toDateField.shouldNotHaveValidationMessage()
      page.map.sidebar.form.toDateField.shouldHaveValue({ date: '02/02/2025', hour: '00', minute: '00', second: '00' })
    })
  })
})
