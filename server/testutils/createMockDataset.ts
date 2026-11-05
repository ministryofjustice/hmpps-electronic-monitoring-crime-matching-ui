import { Dataset } from '../management-information/dataset'

const createMockDataset = (id: string): Dataset => ({
  id,
  title: `Dataset ${id}`,
  description: `Description for ${id}`,
  filters: [],
  columns: [],
  retrieve: async () => ({ rows: [] }),
})

export default createMockDataset
