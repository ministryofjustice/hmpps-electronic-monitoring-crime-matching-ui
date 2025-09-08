import SubjectPage from '../../pages/locationData/subject'
import Page from '../../pages/page'
import sampleLocations from './fixtures/sample-locations'

const deviceActivationId = '1'
const query = 'from=2025-01-01T01:20:03.000Z&to=2025-01-02T02:04:50.000Z'
const url = `/location-data/device-activations/${deviceActivationId}?${query}`

context('Location Data', () => {
  context('Submitting the form', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should redirect to the same view with new query parameters when submitting valid data', () => {
      cy.stubGetDeviceActivation()
      cy.stubGetDeviceActivationPositions({
        status: 200,
        deviceActivationId,
        query: 'from=\\S+&to=\\S+',
        response: sampleLocations,
      })

      // Visit the subject page with a valid url
      cy.visit(url)

      let page = Page.verifyOnPage(SubjectPage)

      page.map.sidebar.form.fillInWith({
        fromDate: {
          date: '03/01/2025',
          hour: '1',
          minute: '2',
          second: '3',
        },
        toDate: {
          date: '04/01/2025',
          hour: '4',
          minute: '5',
          second: '6',
        },
      })
      page.map.sidebar.form.continueButton.click()

      page = Page.verifyOnPage(SubjectPage)
      cy.url().should('contain', '?from=2025-01-03T01:02:03.000Z&to=2025-01-04T04:05:06.000Z')

      page.map.sidebar.form.fromDateField.shouldHaveValue({
        date: '03/01/2025',
        hour: '01',
        minute: '02',
        second: '03',
      })
      page.map.sidebar.form.toDateField.shouldHaveValue({
        date: '04/01/2025',
        hour: '04',
        minute: '05',
        second: '06',
      })
    })

    it('should display validation messages if the form is submitted with invalid values', () => {
      cy.stubGetDeviceActivation()
      cy.stubGetDeviceActivationPositions({
        status: 200,
        deviceActivationId,
        query: 'from=\\S+&to=\\S+',
        response: sampleLocations,
      })

      // Visit the subject page with a valid url
      cy.visit(url)

      let page = Page.verifyOnPage(SubjectPage)

      page.map.sidebar.form.fillInWith({
        fromDate: {
          date: '00/01/2025',
          hour: '1',
          minute: '2',
          second: '3',
        },
        toDate: {
          date: '00/01/2025',
          hour: '4',
          minute: '5',
          second: '6',
        },
      })
      page.map.sidebar.form.continueButton.click()

      page = Page.verifyOnPage(SubjectPage)

      // The view should continue to display the last valid search
      cy.url().should('contain', query)

      // The view should display the incorrect form data + validation messages
      page.map.sidebar.form.fromDateField.shouldHaveValue({
        date: '00/01/2025',
        hour: '1',
        minute: '2',
        second: '3',
      })
      page.map.sidebar.form.fromDateField.shouldHaveValidationMessage('You must enter a valid value for date')
      page.map.sidebar.form.toDateField.shouldHaveValue({
        date: '00/01/2025',
        hour: '4',
        minute: '5',
        second: '6',
      })
      page.map.sidebar.form.toDateField.shouldHaveValidationMessage('You must enter a valid value for date')
    })

    it('should display validation messages if submitted to date is before from date', () => {
      cy.stubGetDeviceActivation()
      cy.stubGetDeviceActivationPositions({
        status: 200,
        deviceActivationId,
        query: 'from=\\S+&to=\\S+',
        response: sampleLocations,
      })

      // Visit the subject page with a valid url
      cy.visit(url)

      let page = Page.verifyOnPage(SubjectPage)

      page.map.sidebar.form.fillInWith({
        fromDate: {
          date: '02/01/2025',
          hour: '1',
          minute: '2',
          second: '3',
        },
        toDate: {
          date: '01/01/2025',
          hour: '4',
          minute: '5',
          second: '6',
        },
      })
      page.map.sidebar.form.continueButton.click()

      page = Page.verifyOnPage(SubjectPage)

      // The view should continue to display the last valid search
      cy.url().should('contain', query)

      // The view should display the incorrect form data + validation messages
      page.map.sidebar.form.fromDateField.shouldHaveValue({
        date: '02/01/2025',
        hour: '1',
        minute: '2',
        second: '3',
      })
      page.map.sidebar.form.fromDateField.shouldNotHaveValidationMessage()
      page.map.sidebar.form.toDateField.shouldHaveValue({
        date: '01/01/2025',
        hour: '4',
        minute: '5',
        second: '6',
      })
      page.map.sidebar.form.toDateField.shouldHaveValidationMessage('To date must be after From date')
    })

    it('should display validation messages if submitted date range exceeds 48 hours', () => {
      cy.stubGetDeviceActivation()
      cy.stubGetDeviceActivationPositions({
        status: 200,
        deviceActivationId,
        query: 'from=\\S+&to=\\S+',
        response: sampleLocations,
      })

      // Visit the subject page with a valid url
      cy.visit(url)

      let page = Page.verifyOnPage(SubjectPage)

      page.map.sidebar.form.fillInWith({
        fromDate: {
          date: '01/01/2025',
          hour: '1',
          minute: '2',
          second: '3',
        },
        toDate: {
          date: '03/01/2025',
          hour: '4',
          minute: '5',
          second: '6',
        },
      })
      page.map.sidebar.form.continueButton.click()

      page = Page.verifyOnPage(SubjectPage)

      // The view should continue to display the last valid search
      cy.url().should('contain', query)

      // The view should display the incorrect form data + validation messages
      page.map.sidebar.form.fromDateField.shouldHaveValue({
        date: '01/01/2025',
        hour: '1',
        minute: '2',
        second: '3',
      })
      page.map.sidebar.form.fromDateField.shouldHaveValidationMessage(
        'Date and time search window should not exceed 48 hours',
      )
      page.map.sidebar.form.toDateField.shouldHaveValue({
        date: '03/01/2025',
        hour: '4',
        minute: '5',
        second: '6',
      })
      page.map.sidebar.form.toDateField.shouldNotHaveValidationMessage()
    })

    it('should display validation messages if submitted from date is before device activation', () => {
      cy.stubGetDeviceActivation({
        deviceActivationId: '1',
        status: 200,
        response: {
          data: {
            deviceActivationId: 1,
            deviceId: 123456789,
            deviceName: '123456789',
            personId: 123456789,
            deviceActivationDate: '2025-01-01T00:00:00.000Z',
            deviceDeactivationDate: '2025-01-03T00:00:00.000Z',
            orderStart: '2024-12-01T00:00:00.000Z',
            orderEnd: '2024-12-31T00:00:00.000Z',
          },
        },
      })
      cy.stubGetDeviceActivationPositions({
        status: 200,
        deviceActivationId,
        query: 'from=\\S+&to=\\S+',
        response: sampleLocations,
      })

      // Visit the subject page with a valid url
      cy.visit(url)

      let page = Page.verifyOnPage(SubjectPage)

      page.map.sidebar.form.fillInWith({
        fromDate: {
          date: '02/12/2024',
          hour: '1',
          minute: '2',
          second: '3',
        },
        toDate: {
          date: '03/12/2024',
          hour: '4',
          minute: '5',
          second: '6',
        },
      })
      page.map.sidebar.form.continueButton.click()

      page = Page.verifyOnPage(SubjectPage)

      // The view should continue to display the last valid search
      cy.url().should('contain', query)

      // The view should display the incorrect form data + validation messages
      page.map.sidebar.form.fromDateField.shouldHaveValue({
        date: '02/12/2024',
        hour: '1',
        minute: '2',
        second: '3',
      })
      page.map.sidebar.form.fromDateField.shouldHaveValidationMessage('Update date to inside tag period')
      page.map.sidebar.form.toDateField.shouldHaveValue({
        date: '03/12/2024',
        hour: '4',
        minute: '5',
        second: '6',
      })
      page.map.sidebar.form.toDateField.shouldNotHaveValidationMessage()
    })

    it('should display validation messages if submitted from date is after device deactivation', () => {
      cy.stubGetDeviceActivation({
        deviceActivationId: '1',
        status: 200,
        response: {
          data: {
            deviceActivationId: 1,
            deviceId: 123456789,
            deviceName: '123456789',
            personId: 123456789,
            deviceActivationDate: '2025-01-01T00:00:00.000Z',
            deviceDeactivationDate: '2025-01-03T00:00:00.000Z',
            orderStart: '2024-12-01T00:00:00.000Z',
            orderEnd: '2024-12-31T00:00:00.000Z',
          },
        },
      })
      cy.stubGetDeviceActivationPositions({
        status: 200,
        deviceActivationId,
        query: 'from=\\S+&to=\\S+',
        response: sampleLocations,
      })

      // Visit the subject page with a valid url
      cy.visit(url)

      let page = Page.verifyOnPage(SubjectPage)

      page.map.sidebar.form.fillInWith({
        fromDate: {
          date: '02/02/2025',
          hour: '1',
          minute: '2',
          second: '3',
        },
        toDate: {
          date: '03/02/2025',
          hour: '4',
          minute: '5',
          second: '6',
        },
      })
      page.map.sidebar.form.continueButton.click()

      page = Page.verifyOnPage(SubjectPage)

      // The view should continue to display the last valid search
      cy.url().should('contain', query)

      // The view should display the incorrect form data + validation messages
      page.map.sidebar.form.fromDateField.shouldHaveValue({
        date: '02/02/2025',
        hour: '1',
        minute: '2',
        second: '3',
      })
      page.map.sidebar.form.fromDateField.shouldNotHaveValidationMessage()
      page.map.sidebar.form.toDateField.shouldHaveValue({
        date: '03/02/2025',
        hour: '4',
        minute: '5',
        second: '6',
      })
      page.map.sidebar.form.toDateField.shouldHaveValidationMessage('Update date to inside tag period')
    })
  })
})
