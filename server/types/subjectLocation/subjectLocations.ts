type SubjectLocation = {
  nomisId: string
  longitude: string
  latitude: string
  confidence: string
  direction: string
  dateTime: string
}

type GetSubjectLocationsQueryResponseDto = Array<SubjectLocation>

type CreateSubjectLocationsQueryRequestDto = {
  nomisId?: string
  fromDate: string
  fromHour: number
  fromMinute: number
  fromSecond: number
  toDate: string
  toHour: number
  toMinute: number
  toSecond: number
  orderStartDate: string
  orderEndDate: string
}

type CreateSubjectLocationsQueryResponseDto = {
  queryExecutionId: string
}

export { CreateSubjectLocationsQueryRequestDto, CreateSubjectLocationsQueryResponseDto, SubjectLocation, GetSubjectLocationsQueryResponseDto }
