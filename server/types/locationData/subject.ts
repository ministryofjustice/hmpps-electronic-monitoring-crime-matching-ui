import { Location } from '../location'

type GetSubjectDto = {
  locations: Array<Location>
}

type CreateSubjectLocationsQueryRequestDto = {
  personId: string
  fromDate: DateAndTimeInput
  toDate: DateAndTimeInput
  orderStartDate: string
  orderEndDate: string
}

type CreateSubjectLocationsQueryResponseDto = {
  queryExecutionId: string
}

type DateAndTimeInput = {
  date: string
  hour: string
  minute: string
  second: string
}

export { CreateSubjectLocationsQueryRequestDto, CreateSubjectLocationsQueryResponseDto, GetSubjectDto }
