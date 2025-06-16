export type PaginatedResponse<T> = {
  data: Array<T>
  pageCount: number
  pageNumber: number
  pageSize: number
}
