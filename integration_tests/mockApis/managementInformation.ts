import { stubFor } from './wiremock'

// Wiremock base path
const baseUrl = '/crime-matching/management-information'

type StubGetDatasetRequest = {
  id: string
  query: {
    from?: string
    to?: string
    policeForceArea?: string
    page?: number
  }
}

type StubGetDatasetResponse =
  | {
      status: number
      body: {
        data: Array<unknown>

        pageCount: number
        pageNumber: number
        pageSize: number
      }
    }
  | {
      status: 404
      body: string
    }
  | {
      status: 500
      body: string
    }

type StubGetManagementInformationDatasetOptions = {
  request: StubGetDatasetRequest
  response: StubGetDatasetResponse
}

const stubGetManagementInformationDataset = (options: StubGetManagementInformationDatasetOptions) => {
  return stubFor({
    request: {
      method: 'GET',
      urlPath: `${baseUrl}/${options.request.id}`,
      queryParameters: {
        ...(options.request.query.from && {
          from: { equalTo: options.request.query.from },
        }),
        ...(options.request.query.to && {
          to: { equalTo: options.request.query.to },
        }),
        ...(options.request.query.policeForceArea && {
          policeForceArea: { equalTo: options.request.query.policeForceArea },
        }),
        ...(options.request.query.page !== undefined && {
          page: { equalTo: options.request.query.page.toString() },
        }),
      },
    },
    response: {
      status: options.response.status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: options.response.body,
    },
  })
}

export { StubGetManagementInformationDatasetOptions }

export default {
  stubGetManagementInformationDataset,
}
