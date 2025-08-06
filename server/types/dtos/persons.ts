import Person from '../entities/person'
import { PaginatedResponse } from '../pagination'

type GetPersonsDto = PaginatedResponse<Person>

export default GetPersonsDto
