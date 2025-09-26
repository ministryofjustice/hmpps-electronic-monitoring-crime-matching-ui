import Position from '../entities/position'

type GetSubjectDto = {
  locations: Array<Position>
}

type CreateSubjectLocationsQueryRequestDto = {
  personId: number
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
