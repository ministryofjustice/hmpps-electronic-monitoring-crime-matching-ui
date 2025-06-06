import type { Request } from 'express'

const createMockRequest = (overrideProperties: Partial<Request> = {}): Request => {
  return {
    // @ts-expect-error stubbing session
    session: {},
    query: {},
    params: {},
    user: {
      username: '',
      token: '',
      authSource: '',
    },
    ...overrideProperties,
  }
}

export default createMockRequest
