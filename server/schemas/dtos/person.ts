import { z } from 'zod/v4'
import personSchema from '../entities/person'
import { paginatedDtoSchema } from '../pagination'

const getPersonsDtoSchema = paginatedDtoSchema.extend({
  data: z.array(personSchema),
})

export default getPersonsDtoSchema
