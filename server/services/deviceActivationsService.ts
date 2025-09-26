import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import { Dayjs } from 'dayjs'
import Position from '../types/entities/position'
import { getDeviceActivationDtoSchema, getDeviceActivationPositionsDtoSchema } from '../schemas/dtos/deviceActivation'
import DeviceActivation from '../types/entities/deviceActivation'
import { SortDirection, sortPositionsByTimestamp } from '../utils/sort'
import CrimeMatchingClient from '../data/crimeMatchingClient'

class DeviceActivationsService {
  constructor(private readonly crimeMatchingApiClient: CrimeMatchingClient) {}

  async getDeviceActivation(username: string, deviceActivationId: string): Promise<DeviceActivation> {
    const response = await this.crimeMatchingApiClient.getDeviceActivation(asSystem(username), deviceActivationId)

    return getDeviceActivationDtoSchema.parse(response).data
  }

  async getDeviceActivationPositions(
    username: string,
    deviceActivation: DeviceActivation,
    fromDate: Dayjs,
    toDate: Dayjs,
  ): Promise<Array<Position>> {
    const response = await this.crimeMatchingApiClient.getDeviceActivationPositions(
      asSystem(username),
      deviceActivation.deviceActivationId,
      fromDate.toISOString(),
      toDate.toISOString(),
      'GPS',
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
