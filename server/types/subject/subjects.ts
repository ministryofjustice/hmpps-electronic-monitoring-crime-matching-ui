type Subject = {
  nomisId: string
  name: string
  dateOfBirth: string
  address: string
  orderStartDate: string
  orderEndDate: string | null
  deviceId: string
  tagPeriodStartDate: string
  tagPeriodEndDate: string | null
}

type GetSubjectsQueryResponseDto = Array<Subject>

type CreateSubjectsQueryRequestDto = {
  name: string
  nomisId: string
}

type CreateSubjectsQueryResponseDto = {
  queryExecutionId: string
}

export { CreateSubjectsQueryRequestDto, CreateSubjectsQueryResponseDto, Subject, GetSubjectsQueryResponseDto }
