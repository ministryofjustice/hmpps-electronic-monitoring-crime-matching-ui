type DeviceActivation = {
  deviceActivationId: number
  deviceId: number
  deviceName: string
  personId: number
  deviceActivationDate: string
  deviceDeactivationDate: string | null
  orderStart: string
  orderEnd: string
}

export default DeviceActivation
