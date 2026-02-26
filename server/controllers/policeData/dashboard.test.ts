import PoliceDataService from '../../services/policeDataService'
import createMockRequest from '../../testutils/createMockRequest'
import createMockResponse from '../../testutils/createMockResponse'
import PoliceDataDashboardController from './dashboard'

describe('PoliceDataDashboardController', () => {
  describe('search', () => {
    it.each([
      [{}, '/police-data/dashboard'],
      [{ policeForceArea: 'METROPOLITAN' }, '/police-data/dashboard?policeForceArea=METROPOLITAN'],
      [{ batchId: 'MPS20251110' }, '/police-data/dashboard?batchId=MPS20251110'],
      [{ fromDate: '01/1/2026' }, '/police-data/dashboard?fromDate=01%2F1%2F2026'],
      [{ toDate: '02/1/2026' }, '/police-data/dashboard?toDate=02%2F1%2F2026'],
      [
        { policeForceArea: 'METROPOLITAN', batchId: 'MPS20251110', fromDate: '01/1/2026', toDate: '02/1/2026' },
        '/police-data/dashboard?batchId=MPS20251110&policeForceArea=METROPOLITAN&fromDate=01%2F1%2F2026&toDate=02%2F1%2F2026',
      ],
    ])('should correctly redirect for body %o to %s', async (body, expected) => {
      // Given
      const req = createMockRequest({ body })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PoliceDataService()
      const controller = new PoliceDataDashboardController(service)

      // When
      await controller.search(req, res, next)

      // Then
      expect(res.redirect).toHaveBeenCalledWith(303, expected)
      expect(next).not.toHaveBeenCalled()
    })

    it('should not include unknown fields in the redirect', async () => {
      // Given
      const req = createMockRequest({ body: { foo: 'bar' } })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PoliceDataService()
      const controller = new PoliceDataDashboardController(service)

      // When
      await controller.search(req, res, next)

      // Then
      expect(res.redirect).toHaveBeenCalledWith(303, '/police-data/dashboard')
      expect(next).not.toHaveBeenCalled()
    })

    it('should encode query parameters correctly', async () => {
      // Given
      const req = createMockRequest({ body: { batchId: 'A&B=C' } })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new PoliceDataService()
      const controller = new PoliceDataDashboardController(service)

      // When
      await controller.search(req, res, next)

      // Then
      expect(res.redirect).toHaveBeenCalledWith(303, '/police-data/dashboard?batchId=A%26B%3DC')
      expect(next).not.toHaveBeenCalled()
    })
  })
})
