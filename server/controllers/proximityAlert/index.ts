import type { RequestHandler } from 'express'
import path from 'path'
import fs from 'fs'
import config from '../../config'
import toProximityAlertMapPositions, { type MatchingResultFixture } from '../../presenters/proximityAlert/mapPositions'

const ID_TO_FIXTURE: Record<string, string> = {
  '1': 'clustered',
  '2': 'opposite',
  '3': 'sparse',
}

const FIXTURE_TO_FILE: Record<string, string> = {
  clustered: 'matching-result-clustered.json',
  opposite: 'matching-result-opposite-sides.json',
  sparse: 'matching-result-single-wearer-sparse.json',
}

export default class ProximityAlertController {
  // In the real implementation, we'll fetch this data from a service, but for this spike we'll load it from fixtures
  private loadScenarioById(id: string): MatchingResultFixture {
    const fixture = ID_TO_FIXTURE[id] ?? 'clustered'
    const fileName = FIXTURE_TO_FILE[fixture]

    const filePath = path.resolve(process.cwd(), `server/fixtures/proximity-alert/${fileName}`)

    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as MatchingResultFixture
  }

  view: RequestHandler = async (req, res) => {
    const id = String(req.params.id)
    const matchingResult = this.loadScenarioById(id)
    const positions = toProximityAlertMapPositions(matchingResult)

    res.render('pages/proximityAlert/index', {
      apiKey: config.maps.apiKey,
      cspNonce: res.locals.cspNonce,
      usesInternalOverlays: false,
      positions,
      alerts: [],
      selectedFixture: ID_TO_FIXTURE[id] ?? 'clustered',
    })
  }

  generateMapImages: RequestHandler = async (req, res) => {}
}
