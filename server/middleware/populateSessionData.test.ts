import createMockRequest from '../testutils/createMockRequest'
import createMockResponse from '../testutils/createMockResponse'
import populateSessionData from './populateSessionData'

describe('populateSessionData', () => {
  it('should populate res.locals with empty objects when no data in session', async () => {
    // Given
    const req = createMockRequest()
    const res = createMockResponse()
    const next = jest.fn()

    // When
    await populateSessionData(req, res, next)

    // Then
    expect(next).toHaveBeenCalled()
    expect(res.locals.formData).toEqual({})
    expect(res.locals.errors).toEqual({})
    expect(req.session.validationErrors).toBeUndefined()
  })

  it('should populate res.locals.errors with data when data in session', async () => {
    // Given
    const req = createMockRequest(
      {},
      {
        formData: {
          field1: 'abc',
        },
        validationErrors: [
          { field: 'field1', message: 'A validation message' },
          { field: 'field2', message: 'A second message' },
        ],
      },
    )
    const res = createMockResponse()
    const next = jest.fn()

    // When
    await populateSessionData(req, res, next)

    // Then
    expect(next).toHaveBeenCalled()
    expect(res.locals.formData).toEqual({
      field1: 'abc',
    })
    expect(res.locals.errors).toEqual({
      field1: {
        text: 'A validation message',
      },
      field2: {
        text: 'A second message',
      },
    })
    expect(req.session.validationErrors).toBeUndefined()
  })
})
