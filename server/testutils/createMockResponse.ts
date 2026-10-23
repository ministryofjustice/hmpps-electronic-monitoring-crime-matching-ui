import type { Response } from 'express'

const createMockResponse = (roles: Array<string> = ['fakeRole']): Response => {
  // @ts-expect-error stubbing res.render
  return {
    locals: {
      user: {
        username: 'fakeUserName',
        token: 'fakeUserToken',
        authSource: 'nomis',
        userId: 'fakeId',
        userUuid: '11111111-1111-1111-1111-111111111111',
        name: 'fake user',
        displayName: 'fuser',
        userRoles: roles,
        staffId: 123,
      },
      errors: {},
    },
    redirect: jest.fn(),
    render: jest.fn(),
    set: jest.fn(),
    setHeader: jest.fn(),
    send: jest.fn(),
  }
}

export default createMockResponse
