import createMockRequest from '../testutils/createMockRequest'
import createMockResponse from '../testutils/createMockResponse'
import populateConstants from './populateConstants'

describe('populateConstants', () => {
  it('should populate res.locals with the application constants', () => {
    // Given
    const req = createMockRequest()
    const res = createMockResponse()
    const next = jest.fn()

    // When
    populateConstants(req, res, next)

    // Then
    expect(next).toHaveBeenCalled()
    expect(res.locals.URLS).toBeDefined()
  })
})
