type DatasetQuery = {
  from?: string
  to?: string
  policeForceArea?: string
  page?: number
}

type DatasetFilter = Exclude<keyof DatasetQuery, 'page'>

type DatasetColumnFormat = 'datetime'

type DatasetColumn = {
  key: string
  heading: string
  format?: DatasetColumnFormat
}

type DatasetResult = {
  rows: Record<string, string | number | null>[]
  pagination: {
    pageCount: number
    pageNumber: number
    pageSize: number
  }
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
