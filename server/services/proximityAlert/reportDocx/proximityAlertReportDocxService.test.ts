import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import ProximityAlertReportDocxService from './proximityAlertReportDocxService'
import type { ProximityAlertReportData } from '../../../presenters/proximityAlertReportData'
import type { ProximityAlertReportImages } from '../proximityAlertMapImageService'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

// Minimal valid 1x1 JPEG
const tinyJpeg = Buffer.from(
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAF/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/ASP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/ASP/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Al//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EABQQAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z',
  'base64',
)

describe('ProximityAlertReportDocxService', () => {
  describe('build', () => {
    it('should build a docx containing generated map images', async () => {
      // Given
      const service = new ProximityAlertReportDocxService()

      const report: ProximityAlertReportData = {
        reportGeneratedAt: '2026-04-29T12:00:00.000Z',
        crimeVersionData: {
          crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
          crimeReference: 'crime1',
          batchId: 'batch1',
          crimeType: 'Aggravated Burglary',
          fromDateTime: '2025-01-01T00:00:00Z',
          toDateTime: '2025-01-01T01:00:00Z',
          latitude: 10,
          longitude: 10,
          crimeText: 'text',
        },
        matchedDeviceWearers: [
          {
            deviceWearerId: '1',
            deviceId: 1,
            name: 'name1',
            nomisId: 'nomisId1',
            positions: [],
          },
        ],
      }

      const images: ProximityAlertReportImages = {
        overviewUserViewJpg: tinyJpeg,
        overviewFittedToDeviceWearersJpg: tinyJpeg,
        deviceWearerWithTracksJpgByDeviceId: {
          '1': tinyJpeg,
        },
        deviceWearerFittedWithoutTracksJpgByDeviceId: {
          '1': tinyJpeg,
        },
      }

      // When
      const buffer = await service.build({
        report,
        images,
      })

      // Then
      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.length).toBeGreaterThan(0)

      // DOCX files are ZIP files and start with the PK file signature.
      expect(buffer.subarray(0, 2).toString()).toBe('PK')
    })
  })
})
