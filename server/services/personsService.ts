import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { getPersonDtoSchema, getPersonsDtoSchema } from '../schemas/dtos/person'
import GetPersonsDto from '../types/dtos/persons'
import Person from '../types/entities/person'

class PersonsService {
  constructor(private readonly crimeMatchingApiClient: RestClient) {}

  async getPersons(username: string, searchField: string, searchTerm: string, page: string): Promise<GetPersonsDto> {
    const response = await this.crimeMatchingApiClient.get(
      {
        path: '/persons',
        query: {
          [searchField]: searchTerm,
          includeDeviceActivations: true,
          page,
        },
      },
      asSystem(username),
    )

    return getPersonsDtoSchema.parse(response)
  }

  async getPerson(username: string, personId: number): Promise<Person> {
    const response = await this.crimeMatchingApiClient.get(
      {
        path: `/persons/${personId}`,
      },
      asSystem(username),
    )

    return getPersonDtoSchema.parse(response).data
  }
}

export default PersonsService
