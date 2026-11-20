import CrimeMatchingClient from '../data/crimeMatchingClient'
import type { Dataset } from './dataset'
import CrimesSubmissionSummary from './datasets/crimesSubmissionSummary'
import ZeroPrecisionCrimeMatches from './datasets/zeroPrecisionCrimeMatches'

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

  static create(crimeMatchingApiClient: CrimeMatchingClient): DatasetRegistry {
    return new DatasetRegistry([
      new CrimesSubmissionSummary(crimeMatchingApiClient),
      new ZeroPrecisionCrimeMatches(crimeMatchingApiClient),
    ])
  }
}

export default DatasetRegistry
