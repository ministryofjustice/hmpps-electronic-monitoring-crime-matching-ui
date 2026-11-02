import { Paragraph, ImageRun } from 'docx'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { readFileSync } from 'fs'
import path from 'path'
import createMockAuthorisingManager from '../../../../testutils/createMockAuthorisingManager'
import { createMockCrimeVersion } from '../../../../testutils/createMockCrimeVersion'
import presentProximityAlertReportData from '../../../../presenters/proximityAlertReportData'
import witnessStatementSection from './witnessStatementSection'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

jest.mock('docx', () => ({
  ...jest.requireActual('docx'),
  ImageRun: jest.fn().mockImplementation(options => options),
  Paragraph: jest.fn().mockImplementation(options => options),
}))

const mockImageRun = jest.mocked(ImageRun)
const mockParagraph = jest.mocked(Paragraph)

const signature = readFileSync(path.join(__dirname, '../../../../testutils', 'example.png'))

const data = presentProximityAlertReportData(createMockCrimeVersion(), {
  authorisingManager: createMockAuthorisingManager(),
  authorisingManagerSignature: signature,
})

describe('witnessStatementSection', () => {
  it('should create the signature paragraph', async () => {
    await witnessStatementSection({ report: data, wearer: data.matchedDeviceWearers[0] })

    // Then the first call to ImageRun should be for the signature image
    expect(mockImageRun).toHaveBeenNthCalledWith(1, {
      data: signature,
      transformation: { width: 176, height: 100 },
      type: 'jpg',
    })

    // And the first call to Paragraph should be for the signature paragraph containing the ImageRun
    expect(mockParagraph).toHaveBeenNthCalledWith(1, {
      alignment: 'left',
      children: [mockImageRun.mock.results[0].value],
      indent: { left: 0, right: 0 },
      spacing: {
        after: 0,
        before: 0,
      },
    })
  })
})
