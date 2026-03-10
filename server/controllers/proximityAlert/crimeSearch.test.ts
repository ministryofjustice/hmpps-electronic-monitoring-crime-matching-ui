import CrimeMatchingClient from '../../data/crimeMatchingClient'
import CrimeService from '../../services/crimeService'
import createMockRequest from '../../testutils/createMockRequest'
import createMockResponse from '../../testutils/createMockResponse'
import CrimeSearchController from './crimeSearch'
import logger from '../../../logger'

jest.mock('../../data/crimeMatchingClient')
jest.mock('../../../logger')

const expectedAuthOptions = {
  tokenType: 'SYSTEM_TOKEN',
  user: {
    username: 'fakeUserName',
  },
}

describe('CrimeSearchController', () => {
  let mockRestClient: jest.Mocked<CrimeMatchingClient>

  beforeEach(() => {
    mockRestClient = new CrimeMatchingClient(logger) as jest.Mocked<CrimeMatchingClient>
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('search', () => {
    it.each([
      [{}, '/proximity-alert'],
      [{ crimeReference: '' }, '/proximity-alert?crimeReference='],
      [{ crimeReference: 'abcdef' }, '/proximity-alert?crimeReference=abcdef'],
    ])('should correctly redirect for body %o to %s', async (body, expected) => {
      // Given
      const req = createMockRequest({ body })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new CrimeService(mockRestClient)
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
      const service = new CrimeService(mockRestClient)
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
      const service = new CrimeService(mockRestClient)
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
        const service = new CrimeService(mockRestClient)
        const controller = new CrimeSearchController(service)

        // When
        await controller.view(req, res, next)

        // Then
        expect(mockRestClient.getCrimeVersions).not.toHaveBeenCalled()
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
      const service = new CrimeService(mockRestClient)
      const controller = new CrimeSearchController(service)

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.getCrimeVersions).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/proximityAlert/crimeSearch', {
        crimeReference: null,
        crimes: [],
        pageCount: 1,
        pageNumber: 1,
        validationErrors: {},
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should present crime versions to the view engine', async () => {
      // Given
      const req = createMockRequest({ query: { crimeReference: 'abc' } })
      const res = createMockResponse()
      const next = jest.fn()
      const service = new CrimeService(mockRestClient)
      const controller = new CrimeSearchController(service)

      mockRestClient.getCrimeVersions.mockResolvedValue({
        data: [
          {
            crimeVersionId: 'b06a517b-666b-4052-8bdc-b735e022c7c5',
            crimeReference: 'aaabbb',
            policeForceArea: 'CHESHIRE',
            crimeType: 'TOMV',
            crimeDate: '2025-01-01T00:00',
            batchId: 'CHS202601012',
            ingestionDateTime: '2026-01-02T12:34',
            matched: true,
            versionLabel: 'Latest version',
            updates: 'Crime type, Crime date, Crime time, Crime location',
          },
          {
            crimeVersionId: 'fe1592c0-dc78-46c3-88cd-144f1f1ec022',
            crimeReference: 'aaabbb',
            policeForceArea: 'CITY_OF_LONDON',
            crimeType: 'BOTD',
            crimeDate: '2025-01-01T00:00',
            batchId: 'CHS202601012',
            ingestionDateTime: '2026-01-02T12:34',
            matched: false,
            versionLabel: 'Version 2',
            updates: 'NA',
          },
        ],
        pageCount: 1,
        pageNumber: 0,
        pageSize: 10,
      })

      // When
      await controller.view(req, res, next)

      // Then
      expect(mockRestClient.getCrimeVersions).toHaveBeenCalledWith(expectedAuthOptions, 'abc')
      expect(res.render).toHaveBeenCalledWith('pages/proximityAlert/crimeSearch', {
        crimeReference: 'abc',
        crimes: [
          {
            crimeVersionId: 'b06a517b-666b-4052-8bdc-b735e022c7c5',
            crimeReference: 'aaabbb',
            policeForceArea: 'Cheshire',
            crimeType: 'TOMV',
            crimeDate: '2025-01-01T00:00',
            batchId: 'CHS202601012',
            ingestionDateTime: '2026-01-02T12:34',
            matched: true,
            matchedText: 'Yes',
            versionLabel: 'Latest version',
            versionColour: 'green',
            updates: 'Crime type, Crime date, Crime time, Crime location',
          },
          {
            crimeVersionId: 'fe1592c0-dc78-46c3-88cd-144f1f1ec022',
            crimeReference: 'aaabbb',
            policeForceArea: 'City of London',
            crimeType: 'BOTD',
            crimeDate: '2025-01-01T00:00',
            batchId: 'CHS202601012',
            ingestionDateTime: '2026-01-02T12:34',
            matched: false,
            matchedText: 'No',
            versionLabel: 'Version 2',
            versionColour: 'grey',
            updates: 'NA',
          },
        ],
        pageCount: 1,
        pageNumber: 1,
        validationErrors: {},
      })
      expect(next).not.toHaveBeenCalled()
    })
  })
})
