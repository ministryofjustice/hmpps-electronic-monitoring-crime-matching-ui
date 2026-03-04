import CrimeMatchingResult from '../../types/crimeMatchingResult'
import { formatDateTime } from '../../utils/date'
import generateCsv from '../helpers/csv'

const headers = [
  'POLICE FORCE',
  'BATCH ID',
  'CRIME REF',
  'CRIME TYPE',
  'FROM DATE/TIME',
  'TO DATE/TIME',
  'CRIME LATITUDE',
  'CRIME LONGITUDE',
  'OTHER INFO',
  'DEVICE ID',
  'DEVICE NAME',
  'SUBJECT IDENTIFIER',
  'OFFENDER NAME',
  'NOMIS ID',
  'PNC REF',
  'OFFENDER ADDRESS',
  'OFFENDER DATE OF BIRTH',
  'OFFENDER MANAGER',
]

const getRow = (crimeMatchingResult: CrimeMatchingResult): Array<string> => {
  return [
    crimeMatchingResult.policeForce,
    crimeMatchingResult.batchId,
    crimeMatchingResult.crimeRef,
    crimeMatchingResult.crimeType,
    formatDateTime(crimeMatchingResult.crimeDateTimeFrom, 'DD/MM/YYYY HH:mm'),
    formatDateTime(crimeMatchingResult.crimeDateTimeTo, 'DD/MM/YYYY HH:mm'),
    crimeMatchingResult.crimeLatitude.toString(),
    crimeMatchingResult.crimeLongitude.toString(),
    crimeMatchingResult.crimeText,
    crimeMatchingResult.deviceId.toString(),
    crimeMatchingResult.deviceName,
    crimeMatchingResult.subjectId,
    crimeMatchingResult.subjectName,
    crimeMatchingResult.subjectNomisId,
    crimeMatchingResult.subjectPncRef,
    crimeMatchingResult.subjectAddress,
    crimeMatchingResult.subjectDateOfBirth,
    crimeMatchingResult.subjectManager,
  ]
}

const getRows = (crimeMatchingResults: Array<CrimeMatchingResult>): Array<Array<string>> => {
  return crimeMatchingResults.map(getRow)
}

const generateCrimeMatchingResultExport = (crimeMatchingResults: Array<CrimeMatchingResult>): string => {
  return generateCsv([headers, ...getRows(crimeMatchingResults)])
}

export default generateCrimeMatchingResultExport
