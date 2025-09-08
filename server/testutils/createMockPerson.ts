import { randomUUID } from 'crypto'
import Person from '../types/entities/person'

const createMockPerson = (): Person => ({
  personId: randomUUID(),
  nomisId: randomUUID(),
  personName: 'John',
  dateOfBirth: '2000-12-01T00:00:00.000Z',
  address: '123 Street',
  deviceActivations: [
    {
      deviceActivationId: 123456,
      deviceId: 123456,
      personId: 654321,
      deviceActivationDate: '2024-12-01T00:00:00.000Z',
      deviceDeactivationDate: null,
    },
  ],
})

export default createMockPerson
