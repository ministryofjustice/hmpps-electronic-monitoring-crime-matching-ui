import { randomUUID } from 'crypto'
import Person from '../types/entities/person'

const createMockPerson = (): Person => ({
  personId: randomUUID(),
  nomisId: randomUUID(),
  personName: 'John',
  pncRef: 'YY/NNNNNNND',
  dateOfBirth: '2000-12-01T00:00:00.000Z',
  address: '123 Street',
  probationPractitioner: 'John Smith',
  deviceActivations: [
    {
      deviceActivationId: 123456,
      deviceId: 123456,
      deviceName: '123456',
      personId: 654321,
      deviceActivationDate: '2024-12-01T00:00:00.000Z',
      deviceDeactivationDate: null,
      orderStart: '2024-12-01T00:00:00.000Z',
      orderEnd: '2024-12-31T00:00:00.000Z',
    },
  ],
})

export default createMockPerson
