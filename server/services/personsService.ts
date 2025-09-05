import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { getPersonDtoSchema, getPersonsDtoSchema } from '../schemas/dtos/person'
import GetPersonsDto from '../types/dtos/persons'
import Person from '../types/entities/person'

class PersonsService {
  constructor(private readonly crimeMatchingApiClient: RestClient) {}

  async getPersons(token: string, name: string, nomisId: string, page: string): Promise<GetPersonsDto> {
    if (name === '' && nomisId === '') {
      return {
        data: [],
        pageCount: 1,
        pageNumber: 1,
        pageSize: 10,
      }
    }

    const response = await this.crimeMatchingApiClient.get(
      {
        path: '/persons',
        query: {
          name,
          nomisId,
          include_device_activations: true,
          page,
        },
      },
      asUser(token),
    )

    return getPersonsDtoSchema.parse(response)
  }

  async getPerson(token: string, personId: number): Promise<Person> {
    const response = await this.crimeMatchingApiClient.get(
      {
        path: `/persons/${personId}`,
      },
      asUser(token),
    )

    return getPersonDtoSchema.parse(response).data
  }
}

export default PersonsService
