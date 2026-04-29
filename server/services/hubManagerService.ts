import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import z from 'zod'
import { createFromCapabilitiesMatrixSet } from 'ol/tilegrid/WMTS'
import CrimeMatchingClient from '../data/crimeMatchingClient'
import Result from '../types/result'
import { ServiceResult } from '../types/service'

type HubManager = {
  name: string
  hasSignature: boolean
}

const hubManagerSchema = z.object({
  data: z.object({
    id: z.string(),
    name: z.string(),
    hasSignature: z.boolean(),
  }),
})

const hubManagersSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      hasSignature: z.boolean(),
    }),
  ),
})

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

  private validateCreateHubManagerRequest(
    name: string,
    file?: Express.Multer.File,
  ): Result<{ name: string; file: Express.Multer.File }, Record<string, string>> {
    const validationErrors: Record<string, string> = {}
    const parsedName = this.parseName(name)

    if (!parsedName.ok) {
      validationErrors.name = parsedName.error
    }

    if (!file) {
      validationErrors.file = 'Upload a file'
    }

    if (Object.keys(validationErrors).length > 0) {
      return {
        ok: false,
        error: validationErrors,
      }
    }

    return {
      ok: true,
      data: {
        name: parsedName.ok ? parsedName.data : '',
        file: file!,
      },
    }
  }

  async createHubManagerWithSignature(
    username: string,
    name: string,
    file?: Express.Multer.File,
  ): Promise<ServiceResult<HubManager>> {
    const parsedRequest = this.validateCreateHubManagerRequest(name, file)

    if (!parsedRequest.ok) {
      return {
        ok: false,
        validationErrors: parsedRequest.error,
      }
    }

    const createHubManagerResponse = await this.crimeMatchingApiClient.createHubManager(asSystem(username), name)
    const hubManager = hubManagerSchema.parse(createHubManagerResponse).data
    const updateSignatureResponse = await this.crimeMatchingApiClient.updateHubManagerSignature(
      asSystem(username),
      hubManager.id,
      parsedRequest.data.file,
    )
    const updatedHubManager = hubManagerSchema.parse(updateSignatureResponse).data

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
      ...hubManagersSchema.parse(result),
    }
  }
}

export default HubManagersService
