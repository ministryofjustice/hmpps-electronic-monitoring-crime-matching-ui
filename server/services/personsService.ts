import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import { getPersonDtoSchema, getPersonsDtoSchema } from '../schemas/dtos/person'
import GetPersonsDto from '../types/dtos/persons'
import Person from '../types/entities/person'
import CrimeMatchingClient from '../data/crimeMatchingClient'

class PersonsService {
  constructor(private readonly crimeMatchingApiClient: CrimeMatchingClient) {}

  private parsePageNumber(page: string): string | undefined {
    const pageNumber = parseInt(page.trim(), 10)

    if (!Number.isNaN(pageNumber)) {
      // API is 0-indexed, UI is 1-indexed
      return (pageNumber - 1).toString()
    }

    return undefined
  }

  async getPersons(username: string, searchField: string, searchTerm: string, page: string): Promise<GetPersonsDto> {
    const parsedPageNumber = this.parsePageNumber(page)
    const response = await this.crimeMatchingApiClient.getPersonsBySearchTerm(
      asSystem(username),
      searchField,
      searchTerm,
      parsedPageNumber,
    )

    return getPersonsDtoSchema.parse(response)
  }

  async getPerson(username: string, personId: string): Promise<Person> {
    const response = await this.crimeMatchingApiClient.getPerson(asSystem(username), personId)

    return getPersonDtoSchema.parse(response).data
  }
}

export default PersonsService
