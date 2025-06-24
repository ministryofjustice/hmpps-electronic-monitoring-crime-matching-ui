type SubjectLocation = {
  personId: string
  longitude: string
  latitude: string
  confidence: string
  direction: string
  dateTime: string
}

type GetSubjectLocationsQueryResponseDto = Array<SubjectLocation>

type CreateSubjectLocationsQueryRequestDto = {
  personId?: string
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

export {
  CreateSubjectLocationsQueryRequestDto,
  CreateSubjectLocationsQueryResponseDto,
  SubjectLocation,
  GetSubjectLocationsQueryResponseDto,
}
