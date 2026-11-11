import createMockDataset from '../testutils/createMockDataset'
import DatasetPresenter from './datasetPresenter'

describe('DatasetPresenter', () => {
  const presenter = new DatasetPresenter()

  const dataset = createMockDataset('test', {
    columns: [
      { key: 'policeForce', heading: 'Police force' },
      { key: 'matched', heading: 'Matched crimes' },
      { key: 'matchedAt', heading: 'Matched at', format: 'datetime' },
    ],
  })

  describe('present', () => {
    it('maps dataset columns and formats values', () => {
      const result = {
        rows: [
          {
            policeForce: 'Metropolitan',
            matched: 100,
            matchedAt: '2026-10-01T00:00:00.000Z',
          },
        ],
      }

      expect(presenter.present(dataset, result)).toEqual({
        headings: ['Police force', 'Matched crimes', 'Matched at'],
        rows: [['Metropolitan', '100', '01/10/2026, 01:00:00']],
      })
    })

    it('maps values in the order defined by the dataset columns', () => {
      const result = {
        rows: [
          {
            matchedAt: '2026-10-01T00:00:00.000Z',
            matched: 100,
            policeForce: 'Metropolitan',
          },
        ],
      }

      expect(presenter.present(dataset, result).rows).toEqual([['Metropolitan', '100', '01/10/2026, 01:00:00']])
    })

    it('formats datetimes in GMT', () => {
      const result = {
        rows: [
          {
            policeForce: 'Metropolitan',
            matched: 100,
            matchedAt: '2026-11-09T10:30:00.000Z',
          },
        ],
      }

      expect(presenter.present(dataset, result).rows).toEqual([['Metropolitan', '100', '09/11/2026, 10:30:00']])
    })

    it('renders missing values as empty strings', () => {
      const result = {
        rows: [
          {
            policeForce: 'Metropolitan',
            matched: 100,
          },
        ],
      }

      expect(presenter.present(dataset, result).rows).toEqual([['Metropolitan', '100', '']])
    })

    it('returns headings and no rows when the dataset is empty', () => {
      const result = {
        rows: [],
        pagination: {
          pageCount: 1,
          pageNumber: 1,
          pageSize: 10,
        },
      }
      expect(presenter.present(dataset, result)).toEqual({
        headings: ['Police force', 'Matched crimes', 'Matched at'],
        rows: [],
      })
    })
  })
})
