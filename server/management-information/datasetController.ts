import { RequestHandler } from 'express'
import { ParsedQs } from 'qs'
import DatasetRegistry from './datasetRegistry'
import DatasetQueryParser from './datasetQueryParser'
import DatasetTablePresenter from './datasetTablePresenter'
import { Dataset, DatasetQuery } from './dataset'

class DatasetController {
  private queryParser = new DatasetQueryParser()

  private tablePresenter = new DatasetTablePresenter()

  constructor(private readonly registry: DatasetRegistry) {}

  view: RequestHandler = async (req, res, next) => {
    const { username } = res.locals.user
    const dataset = this.registry.get(req.params.id)

    if (!dataset) {
      next()
      return
    }

    const submitted = req.query.view === 'true'
    const defaultQuery = submitted ? {} : (dataset.defaultQuery?.() ?? {})
    const resolvedQuery = this.resolveQuery(req.query, defaultQuery)
    const queryResult = this.queryParser.parse(resolvedQuery, dataset.filters)
    const result = queryResult.ok && submitted ? await dataset.retrieve(username, queryResult.data) : undefined
    const table = result
      ? this.tablePresenter.presentResults(dataset, result, this.getPaginationHrefPrefix(dataset, resolvedQuery))
      : undefined

    res.render('pages/managementInformation/dataset', {
      dataset,
      table,
      validationErrors: queryResult.ok ? undefined : queryResult.error,
      from: typeof resolvedQuery.from === 'string' ? resolvedQuery.from : '',
      to: typeof resolvedQuery.to === 'string' ? resolvedQuery.to : '',
      policeForceArea: typeof resolvedQuery.policeForceArea === 'string' ? resolvedQuery.policeForceArea : '',
      downloadUrl: table ? this.getDownloadUrl(dataset, resolvedQuery) : undefined,
    })
  }

  private resolveQuery(requestQuery: ParsedQs, defaultQuery: DatasetQuery): ParsedQs {
    return {
      ...requestQuery,
      from: requestQuery.from ?? defaultQuery.from ?? '',
      to: requestQuery.to ?? defaultQuery.to ?? '',
      policeForceArea: requestQuery.policeForceArea ?? defaultQuery.policeForceArea ?? '',
      page: requestQuery.page ?? '1',
    }
  }

  private getQueryParams(dataset: Dataset, query: ParsedQs): URLSearchParams {
    const params = new URLSearchParams()

    for (const filter of dataset.filters) {
      const value = query[filter]

      if (typeof value === 'string') {
        params.set(filter, value)
      }
    }

    return params
  }

  private getPaginationHrefPrefix(dataset: Dataset, query: ParsedQs): string {
    const paginationParams = this.getQueryParams(dataset, query)

    paginationParams.set('view', 'true')

    return `?${paginationParams.toString()}`
  }

  private getDownloadUrl(dataset: Dataset, query: ParsedQs): string {
    const params = this.getQueryParams(dataset, query)
    const queryString = params.toString()

    const path = `/management-information/${encodeURIComponent(dataset.id)}/download`

    return queryString ? `${path}?${queryString}` : path
  }
}

export default DatasetController
