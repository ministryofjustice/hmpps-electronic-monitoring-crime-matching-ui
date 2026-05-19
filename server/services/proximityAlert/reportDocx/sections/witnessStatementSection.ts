import { AlignmentType, ImageRun, Paragraph, Table, TableCell, TableLayoutType, TextRun, WidthType } from 'docx'
import { fileTypeFromBuffer } from 'file-type'
import type {
  ProximityAlertReportData,
  ProximityAlertReportDeviceWearer,
} from '../../../../presenters/proximityAlertReportData'
import { formatDateTime } from '../../../../utils/date'
import {
  bulletParagraph,
  defaultCellProps,
  cellParagraph,
  paragraph,
  rowNoSplitAcrossPages,
  sectionHeaderShading,
  spacer,
  strongBlackBorders,
  noBottomBorder,
  noTopBorder,
} from '../docxComponents'
import PROXIMITY_ALERT_REPORT_CONTENT from '../../../../constants/proximityAlert/reportContent'

const fmtDate = (dateString: string): string => formatDateTime(dateString, 'DD/MM/YYYY')
const fmtDateTime = (dateString: string): string => formatDateTime(dateString, 'DD/MM/YYYY HH:mm')

const signatureImageType = async (signature: Buffer): Promise<'png' | 'jpg'> => {
  const fileType = await fileTypeFromBuffer(signature)
  return fileType?.mime === 'image/png' ? 'png' : 'jpg'
}

const signatureParagraphs = async (signature?: Buffer): Promise<Paragraph[]> => {
  if (!signature) {
    return spacer(3)
  }

  return [
    new Paragraph({
      children: [
        new ImageRun({
          data: signature,
          type: await signatureImageType(signature),
          transformation: {
            width: 160,
            height: 60,
          },
        }),
      ],
      spacing: { before: 0, after: 0 },
    }),
  ]
}

// This section contains the witness statement content of the report and a narrative statement
// from the hub manager.
const witnessStatementTable = async (args: {
  report: ProximityAlertReportData
  wearer: ProximityAlertReportDeviceWearer
}): Promise<Table> => {
  const { report, wearer } = args
  const borders = strongBlackBorders()
  const { crimeVersionData, authorisingManager, authorisingManagerSignature } = report
  const { witnessStatement } = PROXIMITY_ALERT_REPORT_CONTENT

  const statementOf = authorisingManager.name
  const { occupation } = authorisingManager

  const firstPosition = wearer.positions[0]
  const lastPosition = wearer.positions[wearer.positions.length - 1]
  const firstDateTime = firstPosition ? fmtDateTime(firstPosition.capturedDateTime) : ''
  const lastDateTime = lastPosition ? fmtDateTime(lastPosition.capturedDateTime) : ''

  const signature = await signatureParagraphs(authorisingManagerSignature)

  const witnessHeaderParas: Paragraph[] = [
    paragraph(witnessStatement.heading, { bold: true, alignment: AlignmentType.CENTER, spacingAfter: 60 }),
    paragraph(witnessStatement.legislation, {
      alignment: AlignmentType.CENTER,
      spacingAfter: 0,
    }),
  ]

  const statementRow = rowNoSplitAcrossPages([
    new TableCell({
      ...defaultCellProps(),
      borders,
      width: { size: 50, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          children: [new TextRun({ text: `${witnessStatement.statementOfLabel}: ${statementOf}`, bold: true })],
          spacing: { before: 0, after: 0 },
        }),
      ],
    }),
    new TableCell({
      ...defaultCellProps(),
      borders,
      width: { size: 50, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          children: [new TextRun({ text: `${witnessStatement.occupationLabel}: ${occupation}`, bold: true })],
          spacing: { before: 0, after: 0 },
        }),
      ],
    }),
  ])

  const ageRow = rowNoSplitAcrossPages([
    new TableCell({
      ...defaultCellProps(),
      borders,
      columnSpan: 2,
      children: [
        new Paragraph({
          children: [new TextRun({ text: witnessStatement.age, bold: true })],
          spacing: { before: 0, after: 0 },
        }),
      ],
    }),
  ])

  const declarationRow = rowNoSplitAcrossPages([
    new TableCell({
      ...defaultCellProps(),
      borders,
      columnSpan: 2,
      children: [
        new Paragraph({
          children: [
            new TextRun(`${witnessStatement.declaration.prefix} `),
            new TextRun({
              text: witnessStatement.declaration.pageCountPlaceholder,
              bold: true,
              color: 'FF0000',
            }),
            new TextRun(` ${witnessStatement.declaration.suffix}`),
          ],
          spacing: { before: 120, after: 120 },
        }),
        new Paragraph({
          children: [new TextRun({ text: `${witnessStatement.signatureLabel}: `, bold: true })],
          spacing: { before: 0, after: 0 },
        }),
        ...signature,
        new Paragraph({
          children: [new TextRun({ text: statementOf || ' ', bold: true })],
          spacing: { before: 0, after: 0 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `${witnessStatement.dateLabel}: ${fmtDate(report.reportGeneratedAt)}`, bold: true }),
          ],
          spacing: { before: 0, after: 0 },
        }),
      ],
    }),
  ])

  const narrativeRow = rowNoSplitAcrossPages([
    new TableCell({
      ...defaultCellProps(),
      borders: noBottomBorder(),
      columnSpan: 2,
      children: [
        new Paragraph({
          children: [
            new TextRun(witnessStatement.narrative.employedByPrefix),
            new TextRun({ text: occupation, bold: true }),
            new TextRun(` ${witnessStatement.narrative.employedBySuffix}`),
          ],
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          children: [new TextRun(witnessStatement.narrative.hubFunction)],
          spacing: { before: 0, after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun(`${witnessStatement.narrative.reviewDatePrefix} `),
            new TextRun({ text: fmtDate(report.reportGeneratedAt), bold: true }),
            new TextRun(` ${witnessStatement.narrative.reviewedMatchPrefix} `),
            new TextRun({ text: report.crimeVersionData.policeForceArea, bold: true }),
            new TextRun(`. ${witnessStatement.narrative.reviewedMatchSuffix} `),
            new TextRun({
              text: `${crimeVersionData.crimeType} - ${witnessStatement.narrative.crimeReferencePrefix} ${crimeVersionData.crimeReference}.`,
              bold: true,
            }),
          ],
          spacing: { before: 0, after: 200 },
        }),
      ],
    }),
  ])

  const witnessMiniTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      rowNoSplitAcrossPages([
        new TableCell({
          ...defaultCellProps(),
          borders,
          shading: sectionHeaderShading(),
          width: { size: 33, type: WidthType.PERCENTAGE },
          children: [
            cellParagraph(witnessStatement.miniTableHeaders.personName, {
              bold: true,
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        new TableCell({
          ...defaultCellProps(),
          borders,
          shading: sectionHeaderShading(),
          width: { size: 34, type: WidthType.PERCENTAGE },
          children: [
            cellParagraph(witnessStatement.miniTableHeaders.firstLocationDateTime, {
              bold: true,
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        new TableCell({
          ...defaultCellProps(),
          borders,
          shading: sectionHeaderShading(),
          width: { size: 33, type: WidthType.PERCENTAGE },
          children: [
            cellParagraph(witnessStatement.miniTableHeaders.lastLocationDateTime, {
              bold: true,
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      ]),
      rowNoSplitAcrossPages([
        new TableCell({
          ...defaultCellProps(),
          borders,
          children: [cellParagraph(wearer.name, { alignment: AlignmentType.CENTER, bold: false })],
        }),
        new TableCell({
          ...defaultCellProps(),
          borders,
          children: [cellParagraph(firstDateTime, { alignment: AlignmentType.CENTER, bold: false })],
        }),
        new TableCell({
          ...defaultCellProps(),
          borders,
          children: [cellParagraph(lastDateTime, { alignment: AlignmentType.CENTER, bold: false })],
        }),
      ]),
    ],
  })

  const exhibitsRow = rowNoSplitAcrossPages([
    new TableCell({
      ...defaultCellProps(),
      borders: noTopBorder(),
      columnSpan: 2,
      children: [
        witnessMiniTable,
        new Paragraph({
          children: [new TextRun(witnessStatement.exhibitsIntro)],
          spacing: { before: 200, after: 200 },
        }),
        bulletParagraph(
          `${witnessStatement.exhibits.emac01.prefix} ${wearer.name} ${witnessStatement.exhibits.emac01.suffix}`,
          {
            spacingAfter: 60,
          },
        ),
        bulletParagraph(`${witnessStatement.exhibits.emac02.prefix} ${wearer.name}`, {
          spacingAfter: 60,
        }),
        bulletParagraph(witnessStatement.exhibits.emac03, {
          spacingAfter: 60,
        }),
        bulletParagraph(
          `${witnessStatement.exhibits.emac04.prefix} ${wearer.name}'s ${witnessStatement.exhibits.emac04.suffix}`,
          {
            spacingAfter: 200,
          },
        ),
        new Paragraph({
          children: [new TextRun({ text: `${witnessStatement.signatureLabel.toUpperCase()}: `, bold: true })],
          spacing: { before: 0, after: 0 },
        }),
        ...signature,
        new Paragraph({
          children: [new TextRun({ text: statementOf || ' ', bold: true })],
          spacing: { before: 0, after: 0 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `${witnessStatement.dateLabel}: ${fmtDate(report.reportGeneratedAt)}`, bold: true }),
          ],
          spacing: { before: 0, after: 0 },
        }),
        new Paragraph({ children: [], spacing: { before: 200, after: 0 } }),
        new Paragraph({
          children: [
            new TextRun({ text: `${witnessStatement.emailLabel}: `, bold: true }),
            new TextRun({ text: witnessStatement.preferredEmail, underline: {}, bold: true }),
            new TextRun({ text: ` (${witnessStatement.preferredCommunicationMethod})`, bold: true }),
          ],
          spacing: { before: 0, after: 60 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `${witnessStatement.addressLabel}: ${witnessStatement.address}`, bold: true }),
          ],
          spacing: { before: 0, after: 0 },
        }),
      ],
    }),
  ])

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      rowNoSplitAcrossPages([
        new TableCell({
          ...defaultCellProps(),
          borders,
          columnSpan: 2,
          children: witnessHeaderParas,
        }),
      ]),
      statementRow,
      ageRow,
      declarationRow,
      narrativeRow,
      exhibitsRow,
    ],
  })
}

export default witnessStatementTable
