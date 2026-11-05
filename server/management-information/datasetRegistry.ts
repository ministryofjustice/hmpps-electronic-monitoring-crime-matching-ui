import type { Dataset } from './dataset'

class DatasetRegistry {
  private readonly datasets = new Map<string, Dataset>()

  constructor(datasets: Dataset[] = []) {
    datasets.forEach(dataset => this.register(dataset))
  }

  register(dataset: Dataset): void {
    if (this.datasets.has(dataset.id)) {
      throw new Error(`Dataset already registered: ${dataset.id}`)
    }

    this.datasets.set(dataset.id, dataset)
  }

  get(id: string): Dataset | undefined {
    return this.datasets.get(id)
  }

  getAll(): Dataset[] {
    return Array.from(this.datasets.values())
  }
}

export default DatasetRegistry
