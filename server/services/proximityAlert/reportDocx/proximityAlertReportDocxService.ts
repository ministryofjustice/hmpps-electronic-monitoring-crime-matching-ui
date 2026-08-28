import { Document, Packer, PageBreak, Paragraph, Table } from 'docx'
import type { ProximityAlertReportData } from '../../../presenters/proximityAlertReportData'
import type { ProximityAlertReportImages } from '../proximityAlertMapImageService'
import { A4_HEIGHT_WORD_UNITS, A4_WIDTH_WORD_UNITS, PAGE_MARGIN_WORD_UNITS } from './constants'
import { spacer } from './docxComponents'
import {
  personSummarySections,
  requestSummaryTable,
  resultSummaryTable,
  topSummaryTable,
} from './sections/overviewSection'
import disclaimerTable from './sections/disclaimerSection'
import exhibitMapKeySection from './sections/exhibitMapKeySection'
import exhibitPositionsSection from './sections/exhibitPositionsSection'
import { fillerHeightForMapPage, mapImagePageTable } from './sections/mapImageSection'
import witnessStatementTable from './sections/witnessStatementSection'

export type BuildProximityAlertReportDocxArgs = {
  report: ProximityAlertReportData
  images: ProximityAlertReportImages
}

const requiredImage = (
  imagesByDeviceId: Record<string, Buffer>,
  deviceWearerId: string,
  imageDescription: string,
): Buffer => {
  const image = imagesByDeviceId[String(deviceWearerId)]

  if (!image) {
    throw new Error(`${imageDescription} image is required for device wearer ${deviceWearerId}`)
  }

  return image
}

export default class ProximityAlertReportDocxService {
  // Builds a DOCX report containing the provided images and metadata.
  // The report is returned as a Buffer of the generated DOCX file.
  async build(args: BuildProximityAlertReportDocxArgs): Promise<Buffer> {
    const { report, images } = args
    const children: Array<Paragraph | Table> = []

    children.push(topSummaryTable(report))
    children.push(...spacer(1))

    children.push(...personSummarySections(report))

    children.push(resultSummaryTable(report.matchedDeviceWearers.length))
    children.push(...spacer(1))
    children.push(requestSummaryTable(report))

    children.push(new Paragraph({ children: [new PageBreak()] }))
    children.push(
      mapImagePageTable({
        title: "Images of the crime map with all person's proximity tracks",
        showTitleRow: true,
        jpg: images.overviewJpg,
        report,
        fillerHeightWordUnits: fillerHeightForMapPage(images.overviewJpg, true),
      }),
    )

    children.push(...spacer(1))
    children.push(disclaimerTable())

    const wearerSections = await Promise.all(
      report.matchedDeviceWearers.map(async wearer => {
        const sections: Array<Paragraph | Table> = []

        sections.push(new Paragraph({ children: [new PageBreak()] }))
        sections.push(await witnessStatementTable({ report, wearer }))

        const deviceWearerJpg = requiredImage(images.deviceWearerJpgByDeviceId, wearer.deviceWearerId, 'Device wearer')

        sections.push(new Paragraph({ children: [new PageBreak()] }))
        sections.push(
          mapImagePageTable({
            title: `Exhibit EMAC/01 - Image of maps and tracks for ${wearer.name}`,
            showTitleRow: true,
            jpg: deviceWearerJpg,
            report,
            fillerHeightWordUnits: fillerHeightForMapPage(deviceWearerJpg, true),
          }),
        )

        sections.push(new Paragraph({ children: [new PageBreak()] }))
        sections.push(exhibitMapKeySection())

        sections.push(new Paragraph({ children: [new PageBreak()] }))
        sections.push(exhibitPositionsSection(wearer))

        return sections
      }),
    )

    children.push(...wearerSections.flat())

    const document = new Document({
      styles: {
        default: {
          document: {
            run: { font: 'Arial', size: 22 },
            paragraph: { spacing: { after: 120 } },
          },
        },
      },
      sections: [
        {
          properties: {
            page: {
              size: { width: A4_WIDTH_WORD_UNITS, height: A4_HEIGHT_WORD_UNITS },
              margin: {
                top: PAGE_MARGIN_WORD_UNITS,
                bottom: PAGE_MARGIN_WORD_UNITS,
                left: PAGE_MARGIN_WORD_UNITS,
                right: PAGE_MARGIN_WORD_UNITS,
              },
            },
          },
          children,
        },
      ],
    })

    return Packer.toBuffer(document)
  }
}
