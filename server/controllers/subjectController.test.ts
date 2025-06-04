import type { NextFunction, Request, Response } from 'express'
import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import Logger from 'bunyan'
import SubjectService from '../services/subjectService'
import SubjectController from './subjectController'
import getMockSubject from '../../test/mocks/mockSubject'

jest.mock('../services/subjectService')

const mockSubject = getMockSubject()

describe('SubjectController', () => {
  let logger: jest.Mocked<Logger>
  let mockRestClient: jest.Mocked<RestClient>
  let mockSubjectService: jest.Mocked<SubjectService>
  let subjectController: SubjectController
  let req: Request
  let res: Response
  let next: NextFunction

  beforeEach(() => {
    mockRestClient = new RestClient(
      'crimeMatchingApi',
      {
        url: '',
        timeout: { response: 0, deadline: 0 },
        agent: { timeout: 0 },
      },
      logger,
    ) as jest.Mocked<RestClient>
    mockSubjectService = new SubjectService(mockRestClient) as jest.Mocked<SubjectService>
    subjectController = new SubjectController(mockSubjectService)

    req = {
      // @ts-expect-error stubbing session
      session: {},
      query: {},
      params: {},
      user: {
        username: '',
        token: '',
        authSource: '',
      },
    }

    // @ts-expect-error stubbing res.render
    res = {
      locals: {
        user: {
          username: 'fakeUserName',
          token: 'fakeUserToken',
          authSource: 'nomis',
          userId: 'fakeId',
          name: 'fake user',
          displayName: 'fuser',
          userRoles: ['fakeRole'],
          staffId: 123,
        },
      },
      redirect: jest.fn(),
      render: jest.fn(),
      set: jest.fn(),
      send: jest.fn(),
    }

    next = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('get search results', () => {
    it('shoud render a view containing subject results if there is a queryExecutionId', async () => {
      mockSubjectService.getSearchResults.mockResolvedValue([mockSubject])
      req.query.search_id = 'query-execution-id'

      await subjectController.getSearchResults(req, res, next)

      expect(res.render).toHaveBeenCalledWith(
        'pages/subject/index',
        expect.objectContaining({ subjects: [mockSubject] }),
      )
    })

    it('shoud render a view containing no results if there is no queryExecutionId', async () => {
      await subjectController.getSearchResults(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/subject/index')
    })
  })

  describe('submit search query', () => {
    it('shoud redirect if there are no validation errors', async () => {
      mockSubjectService.submitSearchQuery.mockResolvedValue({ queryExecutionId: 'query-execution-id' })
      req.body = { name: 'John', nomisId: '' }

      await subjectController.submitSearch(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(`/location-data/subjects?search_id=query-execution-id`)
    })

    it('shoud render a view containing no results if there is a validation error', async () => {
      req.body = { name: '', nomisId: '' }
      const errorSummaryList: { text: string; href: string }[] = []
      errorSummaryList.push({
        text: 'You must enter a value for either Name or NOMIS ID',
        href: '/',
      })

      await subjectController.submitSearch(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/subject/index', { errorSummaryList })
    })
  })
})
