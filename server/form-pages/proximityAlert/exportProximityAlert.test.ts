import {
  parseExportProximityAlertRequest,
  toExportProximityAlertForm,
  withExportProximityAlertError,
} from './exportProximityAlert'

describe('exportProximityAlert form page', () => {
  describe('parseExportProximityAlertRequest', () => {
    it('should parse a valid export request with all fields populated', () => {
      // Given
      const capturedMapState = JSON.stringify({
        mapWidthPx: 1200,
        mapHeightPx: 800,
        devicePixelRatio: 2,
        view: {
          center: [12345, 67890],
          resolution: 4.5,
          rotation: 0,
        },
      })

      const body = {
        'device-wearer-toggle': ['device-wearer-1', 'device-wearer-2'],
        'device-wearer-tracks': ['device-wearer-tracks-1'],
        'analysis-toggles': ['device-wearer-circles-', 'device-wearer-labels-'],
        capturedMapState,
      }

      // When
      const result = parseExportProximityAlertRequest(body)

      // Then
      expect(result).toEqual({
        success: true,
        exportData: {
          deviceIds: ['1', '2'],
          capturedMapState,
        },
        formState: {
          selectedDeviceIds: ['1', '2'],
          selectedTrackDeviceIds: ['1'],
          showConfidenceCircles: true,
          showLocationNumbering: true,
          capturedMapState,
        },
      })
    })

    it('should parse single string form values', () => {
      // Given
      const capturedMapState = JSON.stringify({
        mapWidthPx: 1200,
        mapHeightPx: 800,
        devicePixelRatio: 2,
        view: {
          center: [12345, 67890],
          resolution: 4.5,
          rotation: 0,
        },
      })

      const body = {
        'device-wearer-toggle': 'device-wearer-1',
        'device-wearer-tracks': 'device-wearer-tracks-1',
        'analysis-toggles': 'device-wearer-labels-',
        capturedMapState,
      }

      // When
      const result = parseExportProximityAlertRequest(body)

      // Then
      expect(result).toEqual({
        success: true,
        exportData: {
          deviceIds: ['1'],
          capturedMapState,
        },
        formState: {
          selectedDeviceIds: ['1'],
          selectedTrackDeviceIds: ['1'],
          showConfidenceCircles: false,
          showLocationNumbering: true,
          capturedMapState,
        },
      })
    })

    it('should treat missing checkbox fields as unchecked when parsing a submitted form', () => {
      // Given
      const body = {
        'device-wearer-toggle': ['device-wearer-1'],
      }

      // When
      const result = parseExportProximityAlertRequest(body)

      // Then
      expect(result).toEqual({
        success: true,
        exportData: {
          deviceIds: ['1'],
          capturedMapState: undefined,
        },
        formState: {
          selectedDeviceIds: ['1'],
          selectedTrackDeviceIds: [],
          showConfidenceCircles: false,
          showLocationNumbering: false,
          capturedMapState: undefined,
        },
      })
    })

    it('should ignore malformed checkbox values', () => {
      // Given
      const body = {
        'device-wearer-toggle': ['device-wearer-1', 'unexpected-value', 'device-wearer-2'],
        'device-wearer-tracks': ['device-wearer-tracks-1', 'bad-track-value'],
        'analysis-toggles': ['device-wearer-circles-', 'unexpected-toggle'],
      }

      // When
      const result = parseExportProximityAlertRequest(body)

      // Then
      expect(result).toEqual({
        success: true,
        exportData: {
          deviceIds: ['1', '2'],
          capturedMapState: undefined,
        },
        formState: {
          selectedDeviceIds: ['1', '2'],
          selectedTrackDeviceIds: ['1'],
          showConfidenceCircles: true,
          showLocationNumbering: false,
          capturedMapState: undefined,
        },
      })
    })

    it('should return unsuccessfully when capturedMapState is invalid json', () => {
      // Given
      const body = {
        'device-wearer-toggle': ['device-wearer-1'],
        'device-wearer-tracks': ['device-wearer-tracks-1'],
        'analysis-toggles': ['device-wearer-labels-'],
        capturedMapState: '{invalid-json}',
      }

      // When
      const result = parseExportProximityAlertRequest(body)

      // Then
      expect(result).toEqual({
        success: false,
        formState: {
          selectedDeviceIds: ['1'],
          selectedTrackDeviceIds: ['1'],
          showConfidenceCircles: false,
          showLocationNumbering: true,
          capturedMapState: '{invalid-json}',
        },
      })
    })
  })

  describe('withExportProximityAlertError', () => {
    it('should add an error to the export proximity alert state', () => {
      // Given
      const state = {
        selectedDeviceIds: ['1'],
        selectedTrackDeviceIds: ['1'],
        showConfidenceCircles: true,
        showLocationNumbering: false,
        capturedMapState: 'captured-map-state',
      }

      // When
      const result = withExportProximityAlertError(state, 'Invalid export request.')

      // Then
      expect(result).toEqual({
        error: 'Invalid export request.',
        selectedDeviceIds: ['1'],
        selectedTrackDeviceIds: ['1'],
        showConfidenceCircles: true,
        showLocationNumbering: false,
        capturedMapState: 'captured-map-state',
      })
    })
  })

  describe('toExportProximityAlertForm', () => {
    it('should build an export proximity alert form from state', () => {
      // Given
      const crimeVersionId = '78d41bd9-5450-4bbb-89d4-42ba75659f50'
      const state = {
        selectedDeviceIds: ['1'],
        selectedTrackDeviceIds: ['1'],
        showConfidenceCircles: true,
        showLocationNumbering: false,
        capturedMapState: 'some-map-state',
      }

      // When
      const result = toExportProximityAlertForm(crimeVersionId, state)

      // Then
      expect(result).toEqual({
        url: '/proximity-alert/78d41bd9-5450-4bbb-89d4-42ba75659f50/export-proximity-alert',
        selectedDeviceIds: ['1'],
        selectedTrackDeviceIds: ['1'],
        showConfidenceCircles: true,
        showLocationNumbering: false,
        capturedMapState: 'some-map-state',
      })
    })

    it('should build an export proximity alert form with default values when no state exists', () => {
      // Given
      const crimeVersionId = '78d41bd9-5450-4bbb-89d4-42ba75659f50'

      // When
      const result = toExportProximityAlertForm(crimeVersionId)

      // Then
      expect(result).toEqual({
        url: '/proximity-alert/78d41bd9-5450-4bbb-89d4-42ba75659f50/export-proximity-alert',
        selectedDeviceIds: [],
        selectedTrackDeviceIds: [],
        showConfidenceCircles: true,
        showLocationNumbering: true,
        capturedMapState: undefined,
      })
    })
  })
})
