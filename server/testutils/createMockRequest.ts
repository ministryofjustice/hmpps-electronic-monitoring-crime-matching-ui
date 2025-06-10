import type { Request } from 'express'
import { SessionData } from 'express-session'

const createMockRequest = (
  overrideProperties: Partial<Request> = {},
  sessionData: Partial<SessionData> = {},
): Request => {
  return {
    // @ts-expect-error stubbing session
    session: {
      ...sessionData,
    },
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
