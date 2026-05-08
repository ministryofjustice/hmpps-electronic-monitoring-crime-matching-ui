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

  const statementOf = authorisingManager.name
  const occupation = 'MoJ EM Hub Manager'
  const preferredEmail = 'mojacquisitivecrimehub@justice.gov.uk'
  const address = '102 Petty France, Westminster, London, SW1H 9AJ'

  const firstPosition = wearer.positions[0]
  const lastPosition = wearer.positions[wearer.positions.length - 1]
  const firstDateTime = firstPosition ? fmtDateTime(firstPosition.capturedDateTime) : ''
  const lastDateTime = lastPosition ? fmtDateTime(lastPosition.capturedDateTime) : ''

  const signature = await signatureParagraphs(authorisingManagerSignature)

  const witnessHeaderParas: Paragraph[] = [
    paragraph('WITNESS STATEMENT', { bold: true, alignment: AlignmentType.CENTER, spacingAfter: 60 }),
    paragraph('(CJ Act 1967, s.9; MC Act 1980, ss.5A(3) (a) and 5B; Criminal Procedure Rules 2005, Rule 27.1)', {
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
          children: [new TextRun({ text: `Statement of: ${statementOf}`, bold: true })],
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
          children: [new TextRun({ text: `Occupation: ${occupation}`, bold: true })],
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
          children: [new TextRun({ text: 'Age: Over 18', bold: true })],
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
            new TextRun('This statement consisting of '),
            new TextRun({ text: 'XX', bold: true, color: 'FF0000' }),
            new TextRun(
              ' pages, signed by me, is true to the best of my knowledge and belief. I make it known that, if it is given in evidence, I shall be liable to prosecution if I have wilfully stated in it, anything that I know to be false or do not believe to be true.',
            ),
          ],
          spacing: { before: 120, after: 120 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Signature:', bold: true })],
          spacing: { before: 0, after: 0 },
        }),
        ...signature,
        new Paragraph({
          children: [new TextRun({ text: statementOf || ' ', bold: true })],
          spacing: { before: 0, after: 0 },
        }),
        new Paragraph({
          children: [new TextRun({ text: `Date: ${fmtDate(report.reportGeneratedAt)}`, bold: true })],
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
            new TextRun('I am currently employed by the Ministry of Justice (MoJ) as '),
            new TextRun({ text: occupation, bold: true }),
            new TextRun(' within the Electronic Monitoring Acquisitive Crime Hub (EMAC Hub).'),
          ],
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun(
              'The main function of the EMAC Hub is to utilise the MoJ crime mapping tool to cross check acquisitive crime data supplied by participating Police Forces with the movement data of persons who are subject to acquisitive crime licence conditions. An EMAC Hub Caseworker manually reviews matches and based on accuracy of the data will qualify matches based on their own professional judgement.',
            ),
          ],
          spacing: { before: 0, after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun('On '),
            new TextRun({ text: fmtDate(report.reportGeneratedAt), bold: true }),
            new TextRun(' I reviewed a qualified match in relation to crime data supplied by '),
            new TextRun({ text: '', bold: true }),
            new TextRun(
              '. As a result of this process, I can confirm the attached match in relation to an allegation of ',
            ),
            new TextRun({
              text: `${crimeVersionData.crimeType} - Crime Reference No. ${crimeVersionData.crimeReference}.`,
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
          children: [cellParagraph('Person name', { bold: true, alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          ...defaultCellProps(),
          borders,
          shading: sectionHeaderShading(),
          width: { size: 34, type: WidthType.PERCENTAGE },
          children: [
            cellParagraph('First location point in vicinity\ndate/time', {
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
            cellParagraph('Last location point in vicinity\ndate/time', {
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
          children: [
            new TextRun(
              "I further produce the attached screen shot which documents the subject's movements within proximity of this allegation of crime:",
            ),
          ],
          spacing: { before: 200, after: 200 },
        }),
        bulletParagraph(`Exhibit EMAC/01 - Image of the tracks for ${wearer.name} on the data.`, { spacingAfter: 60 }),
        bulletParagraph(`Exhibit EMAC/02 - Detailed image of map and locations for ${wearer.name}`, {
          spacingAfter: 60,
        }),
        bulletParagraph('Exhibit EMAC/03 - Key for interpreting symbols on crime map', { spacingAfter: 60 }),
        bulletParagraph(`Exhibit EMAC/04 - Table of ${wearer.name}'s locations within the vicinity.`, {
          spacingAfter: 200,
        }),
        new Paragraph({
          children: [new TextRun({ text: 'SIGNATURE:', bold: true })],
          spacing: { before: 0, after: 0 },
        }),
        ...signature,
        new Paragraph({
          children: [new TextRun({ text: statementOf || ' ', bold: true })],
          spacing: { before: 0, after: 0 },
        }),
        new Paragraph({
          children: [new TextRun({ text: `Date: ${fmtDate(report.reportGeneratedAt)}`, bold: true })],
          spacing: { before: 0, after: 0 },
        }),
        new Paragraph({ children: [], spacing: { before: 200, after: 0 } }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Email: ', bold: true }),
            new TextRun({ text: preferredEmail, underline: {}, bold: true }),
            new TextRun({ text: ' (preferred communication method)', bold: true }),
          ],
          spacing: { before: 0, after: 60 },
        }),
        new Paragraph({
          children: [new TextRun({ text: `Address: ${address}`, bold: true })],
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
