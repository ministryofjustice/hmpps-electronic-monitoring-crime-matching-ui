type DatasetQuery = {
  from?: string
  to?: string
  policeForceArea?: string
}

type DatasetFilter = keyof DatasetQuery

type DatasetColumn = {
  key: string
  heading: string
}

type DatasetResult = {
  rows: Record<string, string | number | null>[]
}

type Dataset = {
  id: string
  title: string
  description: string
  filters: DatasetFilter[]
  columns: DatasetColumn[]

  retrieve(query: DatasetQuery): Promise<DatasetResult>
}

export { Dataset, DatasetColumn, DatasetFilter, DatasetQuery, DatasetResult }
