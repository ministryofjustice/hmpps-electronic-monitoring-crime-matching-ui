import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import { getPersonDtoSchema, getPersonsDtoSchema } from '../schemas/dtos/person'
import GetPersonsDto from '../types/dtos/persons'
import Person from '../types/entities/person'
import CrimeMatchingClient from '../data/crimeMatchingClient'

class PersonsService {
  constructor(private readonly crimeMatchingApiClient: CrimeMatchingClient) {}

  async getPersons(username: string, searchField: string, searchTerm: string, page: string): Promise<GetPersonsDto> {
    const response = await this.crimeMatchingApiClient.getPersonsBySearchTerm(
      asSystem(username),
      searchField,
      searchTerm,
      page,
    )

    return getPersonsDtoSchema.parse(response)
  }

  async getPerson(username: string, personId: number): Promise<Person> {
    const response = await this.crimeMatchingApiClient.getPerson(asSystem(username), personId)

    return getPersonDtoSchema.parse(response).data
  }
}

export default PersonsService
