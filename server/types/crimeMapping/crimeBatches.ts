type CrimeBatch = {
  policeForce: string
  batch: string
  start: string
  end: string
  time: number
  matches: number
  ingestionDate: string
  caseloadMappingDate: string
  crimeMatchingAlgorithmVersion: string
}

type GetCrimeBatchesQueryResponseDto = Array<CrimeBatch>

type CreateCrimeBatchesQueryRequestDto = {
  searchTerm: string
}

type CreateCrimeBatchesQueryResponseDto = {
  queryExecutionId: string
}

export {
  CreateCrimeBatchesQueryRequestDto,
  CreateCrimeBatchesQueryResponseDto,
  CrimeBatch,
  GetCrimeBatchesQueryResponseDto,
}
