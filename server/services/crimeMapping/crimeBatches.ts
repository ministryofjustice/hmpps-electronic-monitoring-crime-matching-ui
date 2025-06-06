import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import logger from '../../../logger'
import { z } from 'zod'

type CrimeBatch = {
    prisonName: string
}

type CrimeBatchesSearchResult = {
    data: Array<CrimeBatch>
}

const crimeBatchSearchResult = z.object({
    data: z.array(z.object({
        prisonName: z.string()
    }))
})

type a = z.infer<typeof crimeBatchSearchResult>

export default class CrimeBatchesService {
    constructor(private readonly crimeMatchingApiClient: RestClient) {}

    async getResults(userToken: string, queryId?: string): Promise<CrimeBatchesSearchResult> {
        if (queryId === undefined) {
            return {
                data: []
            }
        }

        const response = await this.crimeMatchingApiClient.get({
            path: `crime-batchs?id=${queryId}`
        }, asUser(userToken))

        return crimeBatchSearchResult.parse(response)
     }
}
