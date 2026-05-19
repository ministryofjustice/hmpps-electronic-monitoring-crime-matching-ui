import { AlignmentType, Paragraph, ShadingType, Table, TableCell, TableLayoutType, TextRun, WidthType } from 'docx'
import type { ProximityAlertReportDeviceWearer } from '../../../../presenters/proximityAlertReportData'
import { formatDateTime } from '../../../../utils/date'
import {
  defaultCellProps,
  cellParagraph,
  defaultHeaderCellProps,
  rowNoSplitAcrossPages,
  sectionHeaderShading,
  strongBlackBorders,
} from '../docxComponents'
import PROXIMITY_ALERT_REPORT_CONTENT from '../../../../constants/proximityAlert/reportContent'

const fmtDateTime = (dateString: string): string => formatDateTime(dateString, 'DD/MM/YYYY HH:mm')

const exhibitPositionsSection = (wearer: ProximityAlertReportDeviceWearer): Table => {
  const borders = strongBlackBorders()
  const { exhibitPositions } = PROXIMITY_ALERT_REPORT_CONTENT

  const headingRow = rowNoSplitAcrossPages([
    new TableCell({
      ...defaultCellProps(),
      borders,
      shading: sectionHeaderShading(),
      columnSpan: 7,
      children: [
        cellParagraph(`${exhibitPositions.heading.prefix}${wearer.name}'s ${exhibitPositions.heading.suffix}`, {
          bold: true,
          alignment: AlignmentType.CENTER,
        }),
      ],
    }),
  ])

  const descriptionRow = rowNoSplitAcrossPages([
    new TableCell({
      ...defaultCellProps(),
      margins: { top: 160, bottom: 160, left: 80, right: 80 },
      borders,
      columnSpan: 7,
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: `${exhibitPositions.description} `,
              size: 19,
            }),
            new TextRun({
              text: exhibitPositions.note,
              italics: true,
              bold: true,
              size: 19,
            }),
          ],
          spacing: { before: 0, after: 0 },
        }),
      ],
    }),
  ])

  const headerCell = (text: string, widthPct: number): TableCell =>
    new TableCell({
      ...defaultHeaderCellProps(),
      borders,
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: '4472C4' },
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      children: [
        cellParagraph(text, {
          bold: true,
          color: 'FFFFFF',
          alignment: AlignmentType.CENTER,
          size: 17,
          spacingBefore: 5,
          spacingAfter: 5,
        }),
      ],
    })

  const dataCell = (text: string, shaded: boolean): TableCell =>
    new TableCell({
      ...defaultCellProps(),
      borders,
      shading: shaded ? { type: ShadingType.CLEAR, color: 'auto', fill: 'D9E2F3' } : undefined,
      children: [cellParagraph(text, { alignment: AlignmentType.CENTER, size: 18 })],
    })

  const headerRow = rowNoSplitAcrossPages([
    headerCell(exhibitPositions.columns[0], 13),
    headerCell(exhibitPositions.columns[1], 15),
    headerCell(exhibitPositions.columns[2], 13),
    headerCell(exhibitPositions.columns[3], 14),
    headerCell(exhibitPositions.columns[4], 18),
    headerCell(exhibitPositions.columns[5], 13),
    headerCell(exhibitPositions.columns[6], 14),
  ])

  const dataRows = wearer.positions.map((position, index) => {
    const shaded = index % 2 === 1

    return rowNoSplitAcrossPages([
      dataCell(position.sequenceLabel, shaded),
      dataCell(fmtDateTime(position.capturedDateTime), shaded),
      dataCell(String(position.latitude), shaded),
      dataCell(String(position.longitude), shaded),
      dataCell(String(position.confidenceCircle), shaded),
      dataCell(String(position.speed ?? ''), shaded),
      dataCell(String(position.direction ?? ''), shaded),
    ])
  })

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [headingRow, descriptionRow, headerRow, ...dataRows],
  })
}

export default exhibitPositionsSection
