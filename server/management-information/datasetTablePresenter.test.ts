import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import DatasetTablePresenter from './datasetTablePresenter'
import createMockDataset from '../testutils/createMockDataset'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

describe('DatasetTablePresenter', () => {
  const presenter = new DatasetTablePresenter()

  const dataset = createMockDataset('test', {
    columns: [
      { key: 'policeForce', heading: 'Police force' },
      { key: 'matched', heading: 'Matched crimes' },
      { key: 'unmatched', heading: 'Unmatched crimes' },
      { key: 'matchedAt', heading: 'Matched at', format: 'datetime' },
    ],
  })

  describe('presentResults', () => {
    it('maps dataset columns and rows to the table format', () => {
      const result = {
        rows: [
          { policeForce: 'Metropolitan', matched: 100, unmatched: 20, matchedAt: '2026-10-01T00:00:00.000Z' },
          { policeForce: 'West Midlands', matched: 75, unmatched: 15, matchedAt: '2026-10-01T00:00:00.000Z' },
        ],
        pagination: {
          pageCount: 1,
          pageNumber: 0,
          pageSize: 10,
        },
      }

      expect(presenter.presentResults(dataset, result, '?foo=bar')).toEqual({
        columns: [
          { text: 'Police force' },
          { text: 'Matched crimes' },
          { text: 'Unmatched crimes' },
          { text: 'Matched at' },
        ],
        rows: [
          [{ text: 'Metropolitan' }, { text: '100' }, { text: '20' }, { text: '01/10/2026, 01:00:00' }],
          [{ text: 'West Midlands' }, { text: '75' }, { text: '15' }, { text: '01/10/2026, 01:00:00' }],
        ],
        pagination: {
          currentPage: 1,
          hrefPrefix: '?foo=bar',
          pageCount: 1,
        },
      })
    })

    it('maps values in the order defined by the dataset columns', () => {
      const result = {
        rows: [{ unmatched: 20, policeForce: 'Metropolitan', matched: 100, matchedAt: '2026-10-01T00:00:00.000Z' }],
        pagination: {
          pageCount: 1,
          pageNumber: 0,
          pageSize: 10,
        },
      }

      expect(presenter.presentResults(dataset, result, '').rows).toEqual([
        [{ text: 'Metropolitan' }, { text: '100' }, { text: '20' }, { text: '01/10/2026, 01:00:00' }],
      ])
    })

    it('displays a message when there are no results', () => {
      const result = { rows: [], pagination: { pageCount: 1, pageNumber: 0, pageSize: 10 } }

      expect(presenter.presentResults(dataset, result, '').rows).toEqual([
        [
          {
            text: 'No results found for applied filters.',
            colspan: 4,
          },
        ],
      ])
    })
  })
})
