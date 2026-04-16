import { Document, Packer, Paragraph, TextRun } from 'docx'
import type CrimeVersion from '../../types/crimeVersion'
import type { ProximityAlertReportImages } from './mapImageRendererService'

export type BuildProximityAlertReportDocxArgs = {
  crimeVersion: CrimeVersion
  deviceIds: string[]
  capturedMapState?: string
  images: ProximityAlertReportImages
}

export default class ProximityAlertReportDocxService {
  async build(args: BuildProximityAlertReportDocxArgs): Promise<Buffer> {
    const { crimeVersion, deviceIds, capturedMapState, images } = args

    const document = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Proximity Alert report', bold: true })],
            }),
            new Paragraph(`Crime version ID: ${crimeVersion.crimeVersionId}`),
            new Paragraph(`Crime reference: ${crimeVersion.crimeReference}`),
            new Paragraph(`Selected device IDs: ${deviceIds.join(', ')}`),
            new Paragraph(`Captured map state provided: ${capturedMapState ? 'Yes' : 'No'}`),
            new Paragraph(`Overview image present: ${images.image1Jpg ? 'Yes' : 'No'}`),
          ],
        },
      ],
    })

    return Packer.toBuffer(document)
  }
}
