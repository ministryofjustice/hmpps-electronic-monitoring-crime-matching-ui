import type { Request } from 'express'
import { SessionData } from 'express-session'
import { randomUUID } from 'crypto'

const createMockRequest = (
  overrideProperties: Partial<Request> = {},
  sessionData: Partial<SessionData> = {},
): Request => {
  return {
    // @ts-expect-error stubbing session
    session: {
      ...sessionData,
    },
    id: randomUUID(),
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
