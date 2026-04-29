import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import CrimeMatchingClient from '../data/crimeMatchingClient'
import Result from '../types/result'
import { ServiceResult } from '../types/service'
import HubManager from '../types/hubManager'
import { getHubManagerDtoSchema, getHubManagersDtoSchema } from '../schemas/hubManager'

class HubManagersService {
  constructor(private readonly crimeMatchingApiClient: CrimeMatchingClient) {}

  private parseName(name?: string): Result<string, string> {
    if (name === undefined) {
      return { ok: false, error: 'Enter a name' }
    }

    const sanitised = name.trim()

    if (sanitised.length > 0) {
      return { ok: true, data: sanitised }
    }

    return { ok: false, error: 'Enter a name' }
  }

  async createHubManager(
    username: string,
    name?: string,
    file?: Express.Multer.File,
  ): Promise<ServiceResult<HubManager>> {
    const parsedName = this.parseName(name)

    if (!parsedName.ok || !file) {
      return {
        ok: false,
        validationErrors: {
          ...(!parsedName.ok ? { name: parsedName.error } : {}),
          ...(!file ? { file: 'Upload a file' } : {}),
        },
      }
    }

    const createHubManagerResponse = await this.crimeMatchingApiClient.createHubManager(
      asSystem(username),
      parsedName.data,
    )
    const hubManager = getHubManagerDtoSchema.parse(createHubManagerResponse).data
    const updateSignatureResponse = await this.crimeMatchingApiClient.updateHubManagerSignature(
      asSystem(username),
      hubManager.id,
      file,
    )
    const updatedHubManager = getHubManagerDtoSchema.parse(updateSignatureResponse).data

    return {
      ok: true,
      data: updatedHubManager,
    }
  }

  async deleteHubManager(username: string, id: string) {
    return this.crimeMatchingApiClient.deleteHubManager(asSystem(username), id)
  }

  async getHubManagers(username: string): Promise<ServiceResult<Array<HubManager>>> {
    const result = await this.crimeMatchingApiClient.getHubManagers(asSystem(username))

    return {
      ok: true,
      ...getHubManagersDtoSchema.parse(result),
    }
  }
}

export default HubManagersService
