type DatasetQuery = {
  from?: string
  to?: string
  policeForceArea?: string
}

type DatasetFilter = keyof DatasetQuery

type DatasetColumnFormat = 'datetime'

type DatasetColumn = {
  key: string
  heading: string
  format?: DatasetColumnFormat
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

  defaultQuery?: () => DatasetQuery

  retrieve(username: string, query: DatasetQuery): Promise<DatasetResult>
}

export { Dataset, DatasetColumn, DatasetColumnFormat, DatasetFilter, DatasetQuery, DatasetResult }
