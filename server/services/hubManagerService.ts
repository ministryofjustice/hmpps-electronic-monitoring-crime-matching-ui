import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import CrimeMatchingClient from '../data/crimeMatchingClient'
import Result from '../types/result'
import { ServiceResult } from '../types/service'
import HubManager from '../types/hubManager'
import { getHubManagerDtoSchema, getHubManagersDtoSchema } from '../schemas/hubManager'

class HubManagersService {
  constructor(private readonly crimeMatchingApiClient: CrimeMatchingClient) {}

  private parseTextField(value: string | undefined, errorMessage: string): Result<string, string> {
    if (value === undefined) {
      return { ok: false, error: errorMessage }
    }

    const sanitised = value.trim()

    if (sanitised.length > 0) {
      return { ok: true, data: sanitised }
    }

    return { ok: false, error: errorMessage }
  }

  private parseName(name: string | undefined): Result<string, string> {
    return this.parseTextField(name, 'Enter a name')
  }

  private parseOccupation(occupation: string | undefined): Result<string, string> {
    return this.parseTextField(occupation, 'Enter an occupation')
  }

  async createHubManager(
    username: string,
    name: string | undefined,
    occupation: string | undefined,
    file?: Express.Multer.File,
  ): Promise<ServiceResult<HubManager>> {
    const parsedName = this.parseName(name)
    const parsedOccupation = this.parseOccupation(occupation)

    if (!parsedName.ok || !parsedOccupation.ok || !file) {
      return {
        ok: false,
        validationErrors: {
          ...(!parsedName.ok ? { name: parsedName.error } : {}),
          ...(!parsedOccupation.ok ? { occupation: parsedOccupation.error } : {}),
          ...(!file ? { file: 'Upload a file' } : {}),
        },
      }
    }

    const createHubManagerResponse = await this.crimeMatchingApiClient.createHubManager(
      asSystem(username),
      parsedName.data,
      parsedOccupation.data,
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

  async getHubManagersWithSignatures(username: string): Promise<ServiceResult<Array<HubManager>>> {
    const result = await this.crimeMatchingApiClient.getHubManagers(asSystem(username), true)

    return {
      ok: true,
      ...getHubManagersDtoSchema.parse(result),
    }
  }

  async getHubManager(username: string, id: string): Promise<ServiceResult<HubManager>> {
    const result = await this.crimeMatchingApiClient.getHubManager(asSystem(username), id)

    return {
      ok: true,
      ...getHubManagerDtoSchema.parse(result),
    }
  }

  async getHubManagerSignature(username: string, id: string): Promise<ServiceResult<Buffer>> {
    const result = await this.crimeMatchingApiClient.getHubManagerSignature(asSystem(username), id)

    return {
      ok: true,
      data: Buffer.isBuffer(result) ? result : Buffer.from(result as string, 'base64'),
    }
  }
}

export default HubManagersService
