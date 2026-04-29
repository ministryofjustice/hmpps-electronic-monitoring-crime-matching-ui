import ProximityAlertReportDocxService from './proximityAlertReportDocxService'
import type { CrimeVersion } from '../../types/crimeVersion'
import type { ProximityAlertReportImages } from './proximityAlertMapImageService'

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

      const crimeVersion = {
        crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
        crimeReference: 'crime1',
      } as CrimeVersion

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
        crimeVersion,
        deviceIds: ['1'],
        capturedMapState,
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
