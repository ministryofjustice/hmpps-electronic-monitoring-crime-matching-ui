import HubManager from '../types/hubManager'

const createMockAuthorisingManager = (overrides: Partial<HubManager> = {}): HubManager => ({
  hasSignature: true,
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Test manager',
  occupation: 'MOJ EM Hub Manager',
  ...overrides,
})

export default createMockAuthorisingManager
