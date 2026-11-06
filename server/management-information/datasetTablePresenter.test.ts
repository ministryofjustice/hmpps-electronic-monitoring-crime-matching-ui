import createMockDataset from '../testutils/createMockDataset'
import DatasetTablePresenter from './datasetTablePresenter'

describe('DatasetTablePresenter', () => {
  const presenter = new DatasetTablePresenter()

  const dataset = createMockDataset('test', {
    columns: [
      { key: 'policeForce', heading: 'Police force' },
      { key: 'matched', heading: 'Matched crimes' },
      { key: 'unmatched', heading: 'Unmatched crimes' },
    ],
  })

  describe('presentResults', () => {
    it('maps dataset columns and rows to the table format', () => {
      const result = {
        rows: [
          { policeForce: 'Metropolitan', matched: 100, unmatched: 20 },
          { policeForce: 'West Midlands', matched: 75, unmatched: 15 },
        ],
      }

      expect(presenter.presentResults(dataset, result)).toEqual({
        columns: [{ text: 'Police force' }, { text: 'Matched crimes' }, { text: 'Unmatched crimes' }],
        rows: [
          [{ text: 'Metropolitan' }, { text: '100' }, { text: '20' }],
          [{ text: 'West Midlands' }, { text: '75' }, { text: '15' }],
        ],
      })
    })

    it('maps values in the order defined by the dataset columns', () => {
      const result = {
        rows: [{ unmatched: 20, policeForce: 'Metropolitan', matched: 100 }],
      }

      expect(presenter.presentResults(dataset, result).rows).toEqual([
        [{ text: 'Metropolitan' }, { text: '100' }, { text: '20' }],
      ])
    })

    it('displays a message when there are no results', () => {
      const result = { rows: [] }

      expect(presenter.presentResults(dataset, result).rows).toEqual([
        [
          {
            text: 'No results found for applied filters.',
            colspan: 3,
          },
        ],
      ])
    })
  })
})
