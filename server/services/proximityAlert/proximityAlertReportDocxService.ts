import { AlignmentType, Document, ImageRun, Packer, PageBreak, Paragraph, TextRun } from 'docx'
import { imageSize } from 'image-size'
import type { ProximityAlertReportData } from '../../presenters/proximityAlertReportData'
import type { ProximityAlertReportImages } from './proximityAlertMapImageService'

export type BuildProximityAlertReportDocxArgs = {
  report: ProximityAlertReportData
  images: ProximityAlertReportImages
}

// DOCX library uses twips (1/1440 inch). A4 size and margins are defined in these units.
// Values below are standard A4 dimensions converted to twips.
const A4_WIDTH_WORD_UNITS = 11906
const A4_HEIGHT_WORD_UNITS = 16838
const PAGE_MARGIN_WORD_UNITS = 720 // 0.5 inch margin

// DOCX library ImageRun transformation sizes are in pixels,
// so we need to convert the maximum page width from word units to pixels to ensure images
// fit within the page when rendered.
const WORD_UNITS_PER_PX = 15
const USABLE_PAGE_WIDTH_WORD_UNITS = A4_WIDTH_WORD_UNITS - PAGE_MARGIN_WORD_UNITS - PAGE_MARGIN_WORD_UNITS
const MAP_IMAGE_WIDTH_SAFETY_MARGIN_PX = 8
const MAX_MAP_IMAGE_WIDTH_PX =
  Math.floor(USABLE_PAGE_WIDTH_WORD_UNITS / WORD_UNITS_PER_PX) - MAP_IMAGE_WIDTH_SAFETY_MARGIN_PX

// Scales an image buffer proportionally to fit within the maximum page width.
const scaledImageSize = (jpg: Buffer, maxWidthPx = MAX_MAP_IMAGE_WIDTH_PX): { width: number; height: number } => {
  // image-size library can read dimensions from a JPEG buffer without fully decoding the image,
  // so is ideal for this purpose.
  const dimensions = imageSize(jpg)

  if (!dimensions.width || !dimensions.height) {
    throw new Error('Could not read image dimensions')
  }

  const scale = Math.min(1, maxWidthPx / dimensions.width)

  return {
    width: Math.round(dimensions.width * scale),
    height: Math.round(dimensions.height * scale),
  }
}

// Creates a centred DOCX paragraph containing a scaled image.
const imageParagraph = (jpg: Buffer): Paragraph => {
  const size = scaledImageSize(jpg)

  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    indent: { left: 0, right: 0 },
    children: [
      new ImageRun({
        data: jpg,
        type: 'jpg',
        transformation: size,
      }),
    ],
  })
}

export default class ProximityAlertReportDocxService {
  // Builds a DOCX report containing the provided images and metadata.
  // The report is returned as a Buffer of the generated DOCX file.
  async build(args: BuildProximityAlertReportDocxArgs): Promise<Buffer> {
    const { report, images } = args
    const { crimeVersionData, matchedDeviceWearers } = report
    const deviceIds = matchedDeviceWearers.map(deviceWearer => deviceWearer.deviceWearerId)

    const children: Paragraph[] = [
      new Paragraph({
        children: [new TextRun({ text: 'Proximity Alert report', bold: true })],
      }),
      new Paragraph(`Crime version ID: ${crimeVersionData.crimeVersionId}`),
      new Paragraph(`Crime reference: ${crimeVersionData.crimeReference}`),
      new Paragraph(`Selected device IDs: ${deviceIds.join(', ')}`),
      new Paragraph(`Overview image present: ${images.overviewUserViewJpg ? 'Yes' : 'No'}`),
    ]

    if (images.overviewUserViewJpg) {
      children.push(new Paragraph('Overview user view'))
      children.push(imageParagraph(images.overviewUserViewJpg))
    }

    if (images.overviewFittedToDeviceWearersJpg) {
      children.push(new Paragraph({ children: [new PageBreak()] }))
      children.push(new Paragraph('Overview fitted to device wearers'))
      children.push(imageParagraph(images.overviewFittedToDeviceWearersJpg))
    }

    deviceIds.forEach(deviceId => {
      const withTracks = images.deviceWearerWithTracksJpgByDeviceId[deviceId]
      const fittedWithoutTracks = images.deviceWearerFittedWithoutTracksJpgByDeviceId[deviceId]

      if (withTracks) {
        children.push(new Paragraph({ children: [new PageBreak()] }))
        children.push(new Paragraph(`Device wearer ${deviceId} with tracks`))
        children.push(imageParagraph(withTracks))
      }

      if (fittedWithoutTracks) {
        children.push(new Paragraph({ children: [new PageBreak()] }))
        children.push(new Paragraph(`Device wearer ${deviceId} fitted without tracks`))
        children.push(imageParagraph(fittedWithoutTracks))
      }
    })

    const document = new Document({
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
