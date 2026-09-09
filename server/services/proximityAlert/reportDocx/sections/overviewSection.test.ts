import { TextRun } from 'docx'
import { ProximityAlertReportData } from '../../../../presenters/proximityAlertReportData'
import { personSummarySections } from './overviewSection'

jest.mock('docx', () => ({
  ...jest.requireActual('docx'),
  TextRun: jest.fn().mockImplementation(options => options),
}))

const mockedTextRun = jest.mocked(TextRun)

const reportData: ProximityAlertReportData = {
  reportGeneratedAt: '',
  authorisingManager: {
    hasSignature: true,
    id: '',
    name: '',
    occupation: '',
  },
  crimeVersionData: {
    batchId: '',
    crimeReference: '',
    crimeText: '',
    crimeType: '',
    crimeVersionId: '',
    fromDateTime: '',
    latitude: 0,
    longitude: 0,
    policeForceArea: '',
    toDateTime: '',
  },
  matchedDeviceWearers: [
    {
      address: '',
      dateOfBirth: '',
      deviceId: 1,
      deviceWearerId: '',
      name: 'Joe Bloggs',
      nomisId: '',
      pncRef: '',
      positions: [],
    },
  ],
  authorisingManagerSignature: Buffer.from(''),
}

describe('overviewSection', () => {
  describe('personSummarySections', () => {
    beforeEach(() => {
      mockedTextRun.mockClear()
    })

    it('does not make the full name value bold', () => {
      personSummarySections(reportData)

      expect(mockedTextRun).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          text: 'Joe Bloggs',
          bold: false,
        }),
      )
    })
  })
})
