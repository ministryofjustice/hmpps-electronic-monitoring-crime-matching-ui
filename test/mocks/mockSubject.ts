import { randomUUID } from 'crypto'
import { Subject } from '../../server/types/subject/subjects'

const getMockSubject = (): Subject => ({
  nomisId: randomUUID(),
  name: 'John',
  dateOfBirth: '2000-12-01T00:00:00.000Z',
  address: '123 Street',
  orderStartDate: '2024-12-01T00:00:00.000Z',
  orderEndDate: null,
  deviceId: '123456',
  tagPeriodStartDate: '2024-12-01T00:00:00.000Z',
  tagPeriodEndDate: null,
})

export default getMockSubject
