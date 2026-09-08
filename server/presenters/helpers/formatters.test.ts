import { withFallback } from './formatters'

describe('formatters', () => {
  describe('withFallback', () => {
    it.each([[undefined], [null], ['']])(
      '%s it should use the default fallback withFallback(%s)',
      (value: string | null | undefined) => {
        expect(withFallback(value)).toEqual('N/A')
      },
    )

    it.each([[undefined], [null], ['']])(
      'should use the provided fallback withFallback(%s)',
      (value: string | null | undefined) => {
        expect(withFallback(value, 'override')).toEqual('override')
      },
    )

    it('should use the value if not empty, null or undefined', () => {
      expect(withFallback('test')).toEqual('test')
      expect(withFallback('test', 'override')).toEqual('test')
    })
  })
})
