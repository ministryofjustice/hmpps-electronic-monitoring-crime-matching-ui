type DeviceActivation = {
  deviceActivationId: number
  deviceId: number
  personId: number
  deviceActivationDate: string
  deviceDeactivationDate: string | null
}

export default DeviceActivation
