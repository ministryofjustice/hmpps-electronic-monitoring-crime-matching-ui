import { Dataset } from '../management-information/dataset'

const createMockDataset = (id: string, overrides: Partial<Dataset> = {}): Dataset => ({
  id,
  title: `Dataset ${id}`,
  description: `Description for ${id}`,
  filters: [],
  columns: [],
  retrieve: async () => ({ rows: [] }),
  ...overrides,
})

export default createMockDataset
