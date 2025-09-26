import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { Dayjs } from 'dayjs'
import Position from '../types/entities/position'
import { getDeviceActivationDtoSchema, getDeviceActivationPositionsDtoSchema } from '../schemas/dtos/deviceActivation'
import DeviceActivation from '../types/entities/deviceActivation'
import { SortDirection, sortPositionsByTimestamp } from '../utils/sort'

class DeviceActivationsService {
  constructor(private readonly crimeMatchingApiClient: RestClient) {}

  async getDeviceActivation(username: string, deviceActivationId: string): Promise<DeviceActivation> {
    const response = await this.crimeMatchingApiClient.get(
      {
        path: `/device-activations/${deviceActivationId}`,
      },
      asSystem(username),
    )

    return getDeviceActivationDtoSchema.parse(response).data
  }

  async getDeviceActivationPositions(
    username: string,
    deviceActivation: DeviceActivation,
    fromDate: Dayjs,
    toDate: Dayjs,
  ): Promise<Array<Position>> {
    const response = await this.crimeMatchingApiClient.get(
      {
        path: `/device-activations/${deviceActivation.deviceActivationId}/positions`,
        query: {
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
        },
      },
      asSystem(username),
    )

    return getDeviceActivationPositionsDtoSchema
      .parse(response)
      .data.sort(sortPositionsByTimestamp(SortDirection.ASC))
      .map((position, i) => ({
        ...position,
        sequenceNumber: i + 1,
      }))
  }
}

export default DeviceActivationsService
