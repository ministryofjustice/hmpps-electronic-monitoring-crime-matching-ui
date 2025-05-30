import { randomUUID } from 'crypto'
import { Subject } from '../../server/schemas/subject'

const getMockSubject = (): Subject => ({
  nomisId: randomUUID(),
  name: null,
  dateOfBirth: null,
  address: null,
  orderStartDate: null,
  orderEndDate: null,
  deviceId: null,
  tagPeriodStartDate: null,
  tagPeriodEndDate: null,
})

export default getMockSubject
