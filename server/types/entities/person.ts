import DeviceActivation from './deviceActivation'

type Person = {
  personId: string
  personName: string
  nomisId: string
  address: string
  dateOfBirth: string
  deviceActivations: Array<DeviceActivation>
}

export default Person
