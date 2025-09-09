import DeviceActivation from './deviceActivation'

type Person = {
  personId: string
  name: string
  nomisId: string
  pncRef: string
  address: string
  dateOfBirth: string
  probationPractitioner: string
  deviceActivations: Array<DeviceActivation>
}

export default Person
