import CrimeMatchingClient from '../../data/crimeMatchingClient'
import CrimeVersionController from './crimeSearch'
import logger from '../../../logger'
import createMockRequest from '../../testutils/createMockRequest'
import createMockResponse from '../../testutils/createMockResponse'
import CrimeService from '../../services/crimeService'

jest.mock('../../data/crimeMatchingClient')
jest.mock('../../../logger')

const expectedAuthOptions = {
  tokenType: 'SYSTEM_TOKEN',
  user: {
    username: 'fakeUserName',
  },
}

describe('CrimeVersionController', () => {
    let mockRestClient: jest.Mocked<CrimeMatchingClient>

    beforeEach(() => {
        mockRestClient = new CrimeMatchingClient(logger) as jest.Mocked<CrimeMatchingClient>
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    describe('view', () => {
        it('should correctly present a crime version with matches to the view engine', async () => {
            // Given
            const crimeVersionId = '78d41bd9-5450-4bbb-89d4-42ba75659f50'
            const req = createMockRequest({ params: { crimeVersionId } })
            const res = createMockResponse()
            const next = jest.fn()
            const crimeVersionService = new CrimeService(mockRestClient)
            const controller = new CrimeVersionController(crimeVersionService)

            mockRestClient.getCrimeVersion.mockResolvedValue({
                data: {
                    crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
                    crimeReference : 'crime1',
                    crimeType: 'Aggravated Burglary',
                    crimeDateTimeFrom: '2025-01-01T00:00:00Z',
                    crimeDateTimeTo: '2025-01-01T01:00:00Z',
                    crimeText : 'text',
                    matching: {
                        deviceWearers: [
                            {
                                name: 'name',
                                deviceId: 1,
                                nomisId: 'nomisId',
                                positions: [{
                                        latitude: 10.0,
                                        longitude: 10.0,
                                        sequenceLabel: 'A1',
                                        confidence: 10,
                                        capturedDateTime: '2025-01-01T00:00'
                                    },
                                    {
                                        latitude: 10.0,
                                        longitude: 10.0,
                                        sequenceLabel: 'A2',
                                        confidence: 10,
                                        capturedDateTime: '2025-01-01T02:00'
                                    }]
                            }
                    ]}
                }
            })

            // When
            await controller.view(req, res, next)

            // Then
            expect(mockRestClient.getCrimeVersion).toHaveBeenCalledWith(expectedAuthOptions, crimeVersionId)
            expect(res.render).toHaveBeenCalledWith('pages/proximityAlert/crimeVersion', {
                crimeVersion: {
                    crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
                    crimeReference : 'crime1',
                    crimeType: 'Aggravated Burglary',
                    crimeDateTimeFrom: '2025-01-01T00:00:00Z',
                    crimeDateTimeTo: '2025-01-01T01:00:00Z',
                    crimeText : 'text',
                    matching: {
                        deviceWearers: [
                            {
                                name: 'name',
                                deviceId: 1,
                                nomisId: 'nomisId',
                                positions: 
                                    [{
                                        latitude: 10.0,
                                        longitude: 10.0,
                                        sequenceLabel: 'A1',
                                        confidence: 10,
                                        capturedDateTime: '2025-01-01T00:00'
                                    },
                                    {
                                        latitude: 10.0,
                                        longitude: 10.0,
                                        sequenceLabel: 'A2',
                                        confidence: 10,
                                        capturedDateTime: '2025-01-01T02:00'
                                    }]
                            }
                    ]}
                }
            })
        })

        it('should correctly present a crime version with no matches to the view engine', async () => {
            // Given
            const crimeVersionId = '78d41bd9-5450-4bbb-89d4-42ba75659f50'
            const req = createMockRequest({ params: { crimeVersionId } })
            const res = createMockResponse()
            const next = jest.fn()
            const crimeVersionService = new CrimeService(mockRestClient)
            const controller = new CrimeVersionController(crimeVersionService)

            mockRestClient.getCrimeVersion.mockResolvedValue({
                data: {
                    crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
                    crimeReference : 'crime1',
                    crimeType: 'Aggravated Burglary',
                    crimeDateTimeFrom: '2025-01-01T00:00:00Z',
                    crimeDateTimeTo: '2025-01-01T01:00:00Z',
                    crimeText : 'text',
                    matching: { deviceWearers: [] }
                }
            })

            // When
            await controller.view(req, res, next)

            // Then
            expect(mockRestClient.getCrimeVersion).toHaveBeenCalledWith(expectedAuthOptions, crimeVersionId)
            expect(res.render).toHaveBeenCalledWith('pages/proximityAlert/crimeVersion', {
                crimeVersion: {
                    crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
                    crimeReference : 'crime1',
                    crimeType: 'Aggravated Burglary',
                    crimeDateTimeFrom: '2025-01-01T00:00:00Z',
                    crimeDateTimeTo: '2025-01-01T01:00:00Z',
                    crimeText : 'text',
                    matching: {
                        deviceWearers: [
                            {
                                name: 'name',
                                deviceId: 1,
                                nomisId: 'nomisId',
                                positions: [
                                    {
                                        latitude: 10.0,
                                        longitude: 10.0,
                                        sequenceLabel: 'A1',
                                        confidence: 10,
                                        capturedDateTime: '2025-01-01T00:00'
                                    },
                                    {
                                        latitude: 10.0,
                                        longitude: 10.0,
                                        sequenceLabel: 'A2',
                                        confidence: 10,
                                        capturedDateTime: '2025-01-01T02:00'
                                    }
                                ]
                            }
                    ]}
                }
            })
        })

        it('should correctly present a crime version with no match data to the view engine', async () => {
            // Given
            const crimeVersionId = '78d41bd9-5450-4bbb-89d4-42ba75659f50'
            const req = createMockRequest({ params: { crimeVersionId } })
            const res = createMockResponse()
            const next = jest.fn()
            const crimeVersionService = new CrimeService(mockRestClient)
            const controller = new CrimeVersionController(crimeVersionService)

            mockRestClient.getCrimeVersion.mockResolvedValue({
                data: {
                    crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
                    crimeReference : 'crime1',
                    crimeType: 'Aggravated Burglary',
                    crimeDateTimeFrom: '2025-01-01T00:00:00Z',
                    crimeDateTimeTo: '2025-01-01T01:00:00Z',
                    crimeText : 'text',
                    matching: null
                }
            })

            // When
            await controller.view(req, res, next)

            // Then
            expect(mockRestClient.getCrimeVersion).toHaveBeenCalledWith(expectedAuthOptions, crimeVersionId)
            expect(res.render).toHaveBeenCalledWith('pages/proximityAlert/crimeVersion', {
                crimeVersion: {
                    crimeVersionId: '78d41bd9-5450-4bbb-89d4-42ba75659f50',
                    crimeReference : 'crime1',
                    crimeType: 'Aggravated Burglary',
                    crimeDateTimeFrom: '2025-01-01T00:00:00Z',
                    crimeDateTimeTo: '2025-01-01T01:00:00Z',
                    crimeText : 'text',
                    matching: null
                }
            })
        })
    })
})