import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { Dayjs } from 'dayjs'
import { Location } from '../types/location'
import { getDeviceActivationDtoSchema, getDeviceActivationPositionsDtoSchema } from '../schemas/dtos/deviceActivation'
import DeviceActivation from '../types/entities/deviceActivation'

class DeviceActivationsService {
  constructor(private readonly crimeMatchingApiClient: RestClient) {}

  async getDeviceActivation(token: string, deviceActivationId: string): Promise<DeviceActivation> {
    const response = await this.crimeMatchingApiClient.get(
      {
        path: `/device-activations/${deviceActivationId}`,
      },
      asUser(token),
    )

    return getDeviceActivationDtoSchema.parse(response).data
  }

  async getDeviceActivationPositions(
    token: string,
    deviceActivation: DeviceActivation,
    fromDate: Dayjs,
    toDate: Dayjs,
  ): Promise<Array<Location>> {
    const response = await this.crimeMatchingApiClient.get(
      {
        path: `/device-activations/${deviceActivation.deviceActivationId}/positions`,
        query: {
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
        },
      },
      asUser(token),
    )

    return getDeviceActivationPositionsDtoSchema.parse(response).data
  }
}

export default DeviceActivationsService
