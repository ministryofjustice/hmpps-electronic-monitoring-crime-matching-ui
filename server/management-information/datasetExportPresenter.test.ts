import createMockDataset from '../testutils/createMockDataset'
import DatasetExportPresenter from './datasetExportPresenter'

describe('DatasetExportPresenter', () => {
  const presenter = new DatasetExportPresenter()

  const dataset = createMockDataset('test', {
    columns: [
      { key: 'policeForce', heading: 'Police force' },
      { key: 'crimeReference', heading: 'Crime reference' },
      { key: 'matched', heading: 'Matched crimes' },
    ],
  })

  describe('toCsv', () => {
    it('exports headings and values in dataset column order', () => {
      const result = {
        rows: [
          {
            matched: 100,
            crimeReference: 'CRIME-001',
            policeForce: 'Metropolitan',
          },
        ],
      }

      expect(presenter.toCsv(dataset, result)).toBe(
        'Police force,Crime reference,Matched crimes\nMetropolitan,CRIME-001,100\n',
      )
    })

    it('escapes commas, quotes and newlines', () => {
      const result = {
        rows: [
          {
            policeForce: 'Metropolitan, London',
            crimeReference: 'Crime "A"\nReference',
            matched: 100,
          },
        ],
      }

      expect(presenter.toCsv(dataset, result)).toBe(
        'Police force,Crime reference,Matched crimes\n"Metropolitan, London","Crime ""A""\nReference",100\n',
      )
    })

    it('escapes spreadsheet formulas', () => {
      const result = {
        rows: [
          {
            policeForce: 'Metropolitan',
            crimeReference: '=1+1',
            matched: 100,
          },
        ],
      }

      expect(presenter.toCsv(dataset, result)).toBe(
        "Police force,Crime reference,Matched crimes\nMetropolitan,'=1+1,100\n",
      )
    })

    it('exports headings only when there are no rows', () => {
      expect(presenter.toCsv(dataset, { rows: [] })).toBe('Police force,Crime reference,Matched crimes\n')
    })
  })

  describe('toTsv', () => {
    it('exports tab-separated headings and values', () => {
      const result = {
        rows: [
          {
            policeForce: 'Metropolitan',
            crimeReference: 'CRIME-001',
            matched: 100,
          },
        ],
      }

      expect(presenter.toTsv(dataset, result)).toBe(
        'Police force\tCrime reference\tMatched crimes\nMetropolitan\tCRIME-001\t100\n',
      )
    })

    it('escapes embedded tabs and newlines', () => {
      const result = {
        rows: [
          {
            policeForce: 'Metropolitan',
            crimeReference: 'Crime\tReference\nA',
            matched: 100,
          },
        ],
      }

      expect(presenter.toTsv(dataset, result)).toBe(
        'Police force\tCrime reference\tMatched crimes\nMetropolitan\t"Crime\tReference\nA"\t100\n',
      )
    })
  })
})
