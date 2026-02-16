import path from 'path'
import fs from 'fs'
import type { MatchingResultFixture } from '../../presenters/proximityAlert/mapPositions'

export type ProximityAlertFixtureName = 'clustered' | 'opposite' | 'sparse'

export const ID_TO_FIXTURE: Record<string, ProximityAlertFixtureName> = {
  '1': 'clustered',
  '2': 'opposite',
  '3': 'sparse',
}

const FIXTURE_TO_FILE: Record<ProximityAlertFixtureName, string> = {
  clustered: 'matching-result-clustered.json',
  opposite: 'matching-result-opposite-sides.json',
  sparse: 'matching-result-single-wearer-sparse.json',
}

export function loadProximityAlertFixtureById(id: string): {
  fixtureName: ProximityAlertFixtureName
  matchingResult: MatchingResultFixture
} {
  const fixtureName = ID_TO_FIXTURE[id] ?? 'clustered'
  const fileName = FIXTURE_TO_FILE[fixtureName]

  const filePath = path.resolve(process.cwd(), `server/fixtures/proximity-alert/${fileName}`)

  const raw = fs.readFileSync(filePath, 'utf-8')
  const matchingResult = JSON.parse(raw) as MatchingResultFixture

  return { fixtureName, matchingResult }
}
