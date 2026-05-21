type DeviceActivation = {
  deviceActivationId: number
  deviceId: number
  deviceName: string
  personId: string
  deviceActivationDate: string
  deviceDeactivationDate: string | null
  orderStart: string
  orderEnd: string
}

export default DeviceActivation
