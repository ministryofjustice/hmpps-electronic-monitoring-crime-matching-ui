import CrimeService from '../../services/crimeService'
import createMockRequest from '../../testutils/createMockRequest'
import createMockResponse from '../../testutils/createMockResponse'
import CrimeSearchController from './crimeSearch'

describe('CrimeSearchController', () => {
  describe('search', () => {
    it.each([
      [{}, '/proximity-alert'],
      [{ crimeReference: 'abcdef' }, '/proximity-alert?crimeReference=abcdef'],
    ])('should correctly redirect for body %o to %s', async (body, expected) => {
      // Given
      const req = createMockRequest({ body })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new CrimeService()
      const controller = new CrimeSearchController(service)

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
      const service = new CrimeService()
      const controller = new CrimeSearchController(service)

      // When
      await controller.search(req, res, next)

      // Then
      expect(res.redirect).toHaveBeenCalledWith(303, '/proximity-alert')
      expect(next).not.toHaveBeenCalled()
    })

    it('should encode query parameters correctly', async () => {
      // Given
      const req = createMockRequest({ body: { crimeReference: 'A&B=C' } })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new CrimeService()
      const controller = new CrimeSearchController(service)

      // When
      await controller.search(req, res, next)

      // Then
      expect(res.redirect).toHaveBeenCalledWith(303, '/proximity-alert?crimeReference=A%26B%3DC')
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('view', () => {
    it.each([[{ crimeReference: '' }, { crimeReference: 'Enter a crime number.' }]])(
      'should send validation errors to the view engine when the query contains invalid parameters %o',
      async (query, expectedValidationErrors) => {
        // Given
        const req = createMockRequest({ query })
        const res = createMockResponse()
        const next = jest.fn()
        const service = new CrimeService()
        const controller = new CrimeSearchController(service)

        // When
        await controller.view(req, res, next)

        // Then
        expect(res.render).toHaveBeenCalledWith('pages/proximityAlert/crimeSearch', {
          ...query,
          crimes: [],
          pageCount: 1,
          pageNumber: 1,
          validationErrors: expectedValidationErrors,
        })
        expect(next).not.toHaveBeenCalled()
      },
    )

    it('should display an empty table if no crime reference in query', async () => {
      // Given
      const req = createMockRequest({})
      const res = createMockResponse()
      const next = jest.fn()
      const service = new CrimeService()
      const controller = new CrimeSearchController(service)

      // When
      await controller.view(req, res, next)

      // Then
      expect(res.render).toHaveBeenCalledWith('pages/proximityAlert/crimeSearch', {
        crimeReference: null,
        crimes: [],
        pageCount: 1,
        pageNumber: 1,
        validationErrors: {},
      })
      expect(next).not.toHaveBeenCalled()
    })
  })
})
