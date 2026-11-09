import { RequestHandler } from 'express'
import { ParsedQs } from 'qs'
import DatasetRegistry from './datasetRegistry'
import DatasetQueryParser from './datasetQueryParser'
import DatasetTablePresenter from './datasetTablePresenter'
import { DatasetQuery } from './dataset'

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
    const table = result ? this.tablePresenter.presentResults(dataset, result) : undefined

    res.render('pages/managementInformation/dataset', {
      dataset,
      table,
      validationErrors: queryResult.ok ? undefined : queryResult.error,
      from: typeof resolvedQuery.from === 'string' ? resolvedQuery.from : '',
      to: typeof resolvedQuery.to === 'string' ? resolvedQuery.to : '',
      policeForceArea: typeof resolvedQuery.policeForceArea === 'string' ? resolvedQuery.policeForceArea : '',
    })
  }

  private resolveQuery(requestQuery: ParsedQs, defaultQuery: DatasetQuery): ParsedQs {
    return {
      ...requestQuery,
      from: requestQuery.from ?? defaultQuery.from ?? '',
      to: requestQuery.to ?? defaultQuery.to ?? '',
      policeForceArea: requestQuery.policeForceArea ?? defaultQuery.policeForceArea ?? '',
    }
  }
}

export default DatasetController
