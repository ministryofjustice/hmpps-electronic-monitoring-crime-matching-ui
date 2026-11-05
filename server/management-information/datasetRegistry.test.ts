import createMockDataset from '../testutils/createMockDataset'
import DatasetRegistry from './datasetRegistry'

describe('DatasetRegistry', () => {
  describe('constructor', () => {
    it('starts with an empty registry by default', () => {
      const registry = new DatasetRegistry()

      expect(registry.getAll()).toEqual([])
    })

    it('registers datasets provided at construction', () => {
      const first = createMockDataset('first')
      const second = createMockDataset('second')

      const registry = new DatasetRegistry([first, second])

      expect(registry.getAll()).toEqual([first, second])
    })

    it('rejects duplicate dataset IDs at construction', () => {
      const first = createMockDataset('first')
      const duplicate = createMockDataset('first')

      expect(() => new DatasetRegistry([first, duplicate])).toThrow('Dataset already registered: first')
    })
  })

  describe('register', () => {
    it('registers a dataset', () => {
      const registry = new DatasetRegistry()
      const dataset = createMockDataset('first')

      registry.register(dataset)

      expect(registry.get('first')).toBe(dataset)
    })

    it('rejects duplicate dataset IDs', () => {
      const registry = new DatasetRegistry()
      registry.register(createMockDataset('first'))

      expect(() => registry.register(createMockDataset('first'))).toThrow('Dataset already registered: first')
    })
  })

  describe('get', () => {
    it('returns the dataset matching the ID', () => {
      const first = createMockDataset('first')
      const second = createMockDataset('second')
      const registry = new DatasetRegistry([first, second])

      expect(registry.get('second')).toBe(second)
    })

    it('returns undefined for an unknown dataset', () => {
      const registry = new DatasetRegistry()

      expect(registry.get('unknown')).toBeUndefined()
    })
  })

  describe('getAll', () => {
    it('returns all registered datasets in registration order', () => {
      const first = createMockDataset('first')
      const second = createMockDataset('second')
      const registry = new DatasetRegistry()

      registry.register(first)
      registry.register(second)

      expect(registry.getAll()).toEqual([first, second])
    })
  })
})
