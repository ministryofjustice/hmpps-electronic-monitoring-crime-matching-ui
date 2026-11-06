import DatasetQueryParser from './datasetQueryParser'
import { policeForceAreas } from '../data/policeForceAreas'

describe('DatasetQueryParser', () => {
  const parser = new DatasetQueryParser()

  describe('parse', () => {
    it('parses valid dates into ISO format', () => {
      const result = parser.parse(
        {
          from: '01/10/2026',
          to: '31/10/2026',
        },
        ['from', 'to'],
      )

      expect(result).toEqual({
        ok: true,
        data: {
          from: '2026-10-01',
          to: '2026-10-31',
        },
      })
    })

    it('parses a valid police force area', () => {
      const policeForceArea = [...policeForceAreas.keys()][0]

      const result = parser.parse({ policeForceArea }, ['policeForceArea'])

      expect(result).toEqual({
        ok: true,
        data: { policeForceArea },
      })
    })

    it('returns an empty query when no parameters are provided', () => {
      const result = parser.parse({}, ['from', 'to', 'policeForceArea'])

      expect(result).toEqual({
        ok: true,
        data: {},
      })
    })

    it('accepts empty filter values', () => {
      const result = parser.parse(
        {
          from: '',
          to: '',
          policeForceArea: '',
        },
        ['from', 'to', 'policeForceArea'],
      )

      expect(result).toEqual({
        ok: true,
        data: {},
      })
    })

    it('ignores filters that are not enabled', () => {
      const result = parser.parse(
        {
          from: '01/10/2026',
          to: '31/10/2026',
          policeForceArea: 'INVALID',
        },
        ['from'],
      )

      expect(result).toEqual({
        ok: true,
        data: {
          from: '2026-10-01',
        },
      })
    })

    it('returns an empty query when no filters are enabled', () => {
      const result = parser.parse(
        {
          from: 'invalid',
          policeForceArea: 'INVALID',
        },
        [],
      )

      expect(result).toEqual({
        ok: true,
        data: {},
      })
    })

    it.each([
      ['from', 'Enter a valid from date'],
      ['to', 'Enter a valid to date'],
    ] as const)('rejects an invalid %s date format', (filter, errorMessage) => {
      const result = parser.parse({ [filter]: '2026-10-01' }, [filter])

      expect(result).toEqual({
        ok: false,
        error: {
          [filter]: errorMessage,
        },
      })
    })

    it.each([['31/02/2026'], ['32/01/2026'], ['00/01/2026'], ['01/13/2026'], ['29/02/2025']])(
      'rejects invalid calendar date %s',
      date => {
        const result = parser.parse({ from: date }, ['from'])

        expect(result).toEqual({
          ok: false,
          error: {
            from: 'Enter a valid from date',
          },
        })
      },
    )

    it('accepts a valid leap year date', () => {
      const result = parser.parse({ from: '29/02/2024' }, ['from'])

      expect(result).toEqual({
        ok: true,
        data: {
          from: '2024-02-29',
        },
      })
    })

    it('accepts the same from and to date', () => {
      const result = parser.parse(
        {
          from: '01/10/2026',
          to: '01/10/2026',
        },
        ['from', 'to'],
      )

      expect(result).toEqual({
        ok: true,
        data: {
          from: '2026-10-01',
          to: '2026-10-01',
        },
      })
    })

    it('rejects a date range where from is after to', () => {
      const result = parser.parse(
        {
          from: '31/10/2026',
          to: '01/10/2026',
        },
        ['from', 'to'],
      )

      expect(result).toEqual({
        ok: false,
        error: {
          to: 'To date must be on or after from date',
        },
      })
    })

    it('rejects an unknown police force area', () => {
      const result = parser.parse({ policeForceArea: 'INVALID' }, ['policeForceArea'])

      expect(result).toEqual({
        ok: false,
        error: {
          policeForceArea: 'Select a valid police force area',
        },
      })
    })

    it('rejects repeated query parameters', () => {
      const result = parser.parse(
        {
          from: ['01/10/2026', '02/10/2026'],
        },
        ['from'],
      )

      expect(result).toEqual({
        ok: false,
        error: {
          from: 'Enter a valid from date',
        },
      })
    })

    it('rejects nested query parameters', () => {
      const result = parser.parse(
        {
          from: { value: '01/10/2026' },
        },
        ['from'],
      )

      expect(result).toEqual({
        ok: false,
        error: {
          from: 'Enter a valid from date',
        },
      })
    })

    it('returns errors for multiple invalid filters', () => {
      const result = parser.parse(
        {
          from: '31/02/2026',
          to: 'invalid',
          policeForceArea: 'INVALID',
        },
        ['from', 'to', 'policeForceArea'],
      )

      expect(result).toEqual({
        ok: false,
        error: {
          from: 'Enter a valid from date',
          to: 'Enter a valid to date',
          policeForceArea: 'Select a valid police force area',
        },
      })
    })

    it('does not validate date ordering when a date is invalid', () => {
      const result = parser.parse(
        {
          from: 'invalid',
          to: '01/10/2026',
        },
        ['from', 'to'],
      )

      expect(result).toEqual({
        ok: false,
        error: {
          from: 'Enter a valid from date',
        },
      })
    })
  })
})
