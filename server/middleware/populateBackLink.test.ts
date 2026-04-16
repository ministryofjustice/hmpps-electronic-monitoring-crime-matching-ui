import createMockRequest from '../testutils/createMockRequest'
import createMockResponse from '../testutils/createMockResponse'
import populateBackLink from './populateBackLink'

describe('populateBackLink', () => {
  it('should populate res.locals with the default value when returnTo query param is missing', () => {
    // Given
    const req = createMockRequest()
    const res = createMockResponse()
    const next = jest.fn()
    const middleware = populateBackLink('/default-value')

    // When
    middleware(req, res, next)

    // Then
    expect(next).toHaveBeenCalled()
    expect(res.locals.backLink).toEqual('/default-value')
  })

  it('should populate res.locals with the returnTo query param value when present', () => {
    // Given
    const req = createMockRequest({
      query: {
        returnTo: '/return-to',
      },
    })
    const res = createMockResponse()
    const next = jest.fn()
    const middleware = populateBackLink('/default-value')

    // When
    middleware(req, res, next)

    // Then
    expect(next).toHaveBeenCalled()
    expect(res.locals.backLink).toEqual('/return-to')
  })
})
