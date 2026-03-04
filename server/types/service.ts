type ServiceResult<T> =
  | {
      ok: true
      data: T
    }
  | {
      ok: false
      validationErrors: Record<string, string>
      error?: string
    }

type PaginatedServiceResult<T> =
  | {
      ok: true
      data: Array<T>
      pageCount: number
      pageNumber: number
      pageSize: number
    }
  | {
      ok: false
      validationErrors: Record<string, string>
    }

export { PaginatedServiceResult, ServiceResult }
