import { AlignmentType, Paragraph, Table, TableCell, TableLayoutType, TextRun, WidthType } from 'docx'
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
} from '../docxComponents'

const fmtDate = (dateString: string): string => formatDateTime(dateString, 'DD/MM/YYYY')
const fmtDateTime = (dateString: string): string => formatDateTime(dateString, 'DD/MM/YYYY HH:mm')

// This section contains the witness statement content of the report and a narrative statement
// from the hub manager.
const witnessStatementTable = (args: {
  report: ProximityAlertReportData
  wearer: ProximityAlertReportDeviceWearer
}): Table => {
  const { report, wearer } = args
  const borders = strongBlackBorders()
  const { crimeVersionData } = report

  const statementOf = ''
  const occupation = ''
  const preferredEmail = ''
  const address = ''

  const firstPosition = wearer.positions[0]
  const lastPosition = wearer.positions[wearer.positions.length - 1]
  const firstDateTime = firstPosition ? fmtDateTime(firstPosition.capturedDateTime) : ''
  const lastDateTime = lastPosition ? fmtDateTime(lastPosition.capturedDateTime) : ''

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
          children: [new TextRun({ text: 'Statement of: ', bold: true }), new TextRun({ text: statementOf })],
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
          children: [new TextRun({ text: 'Occupation: ', bold: true }), new TextRun({ text: occupation })],
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
          children: [new TextRun({ text: 'Age: ', bold: true }), new TextRun({ text: 'Over 18' })],
          spacing: { before: 0, after: 0 },
        }),
      ],
    }),
  ])

  const declarationText =
    'This statement consisting of ______ pages, signed by me, is true to the best of my knowledge and belief. I make it known that, if it is given in evidence, I shall be liable to prosecution if I have wilfully stated in it, anything that I know to be false or do not believe to be true.'

  const declarationRow = rowNoSplitAcrossPages([
    new TableCell({
      ...defaultCellProps(),
      borders,
      columnSpan: 2,
      children: [
        new Paragraph({ children: [new TextRun(declarationText)], spacing: { before: 120, after: 120 } }),
        new Paragraph({
          children: [new TextRun({ text: 'Signature:', bold: true })],
          spacing: { before: 0, after: 0 },
        }),
        ...spacer(3),
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
      borders,
      columnSpan: 2,
      children: [
        new Paragraph({
          children: [
            new TextRun(
              'I am currently employed by the Ministry of Justice (MoJ) as MoJ EM Hub Manager within the Electronic Monitoring Acquisitive Crime Hub (EMAC Hub).',
            ),
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
            new TextRun(
              `On ${fmtDate(report.reportGeneratedAt)} I reviewed a qualified match in relation to crime data supplied by `,
            ),
            new TextRun({ text: '', bold: true }),
            new TextRun(
              '. As a result of this process, I can confirm the attached match in relation to an allegation of ',
            ),
            new TextRun({ text: crimeVersionData.crimeType, bold: true }),
            new TextRun(' - Crime Reference No. '),
            new TextRun({ text: crimeVersionData.crimeReference, bold: true }),
            new TextRun('.'),
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
          children: [cellParagraph(wearer.name, { alignment: AlignmentType.CENTER, bold: true })],
        }),
        new TableCell({
          ...defaultCellProps(),
          borders,
          children: [cellParagraph(firstDateTime, { alignment: AlignmentType.CENTER, bold: true })],
        }),
        new TableCell({
          ...defaultCellProps(),
          borders,
          children: [cellParagraph(lastDateTime, { alignment: AlignmentType.CENTER, bold: true })],
        }),
      ]),
    ],
  })

  const exhibitsRow = rowNoSplitAcrossPages([
    new TableCell({
      ...defaultCellProps(),
      borders,
      columnSpan: 2,
      children: [
        new Paragraph({
          children: [
            new TextRun(
              "I further produce the attached screen shot which documents the subject's movements within proximity of this allegation of crime:",
            ),
          ],
          spacing: { before: 200, after: 200 },
        }),
        witnessMiniTable,
        new Paragraph({ children: [], spacing: { before: 200, after: 0 } }),
        bulletParagraph(`Exhibit EMAC/01 - Image of the tracks for ${wearer.name} on the data.`, { spacingAfter: 60 }),
        bulletParagraph('Exhibit EMAC/02 - Key for interpreting symbols on crime map', { spacingAfter: 60 }),
        bulletParagraph(`Exhibit EMAC/03 - Table of ${wearer.name}'s locations within the vicinity.`, {
          spacingAfter: 200,
        }),
        new Paragraph({
          children: [new TextRun({ text: 'SIGNATURE:', bold: true })],
          spacing: { before: 0, after: 0 },
        }),
        ...spacer(3),
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
          children: [new TextRun({ text: `Email: ${preferredEmail}`, bold: true })],
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
