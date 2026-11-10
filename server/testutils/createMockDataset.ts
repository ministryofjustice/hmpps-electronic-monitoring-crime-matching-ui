import { Dataset } from '../management-information/dataset'

const createMockDataset = (id: string, overrides: Partial<Dataset> = {}): Dataset => ({
  id,
  title: `Dataset ${id}`,
  description: `Description for ${id}`,
  filters: [],
  columns: [
    { key: 'policeForce', heading: 'Police force' },
    { key: 'matched', heading: 'Matched crimes' },
  ],
  retrieve: jest.fn().mockResolvedValue({
    rows: [{ policeForce: 'Metropolitan', matched: 100 }],
    pagination: { pageCount: 1, pageNumber: 0, pageSize: 10 },
  }),
  ...overrides,
})

export default createMockDataset
