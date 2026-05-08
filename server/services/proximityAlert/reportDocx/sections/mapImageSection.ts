import {
  AlignmentType,
  HeightRule,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  VerticalAlign,
  WidthType,
} from 'docx'
import type { ProximityAlertReportData } from '../../../../presenters/proximityAlertReportData'
import { formatDateTime } from '../../../../utils/date'
import { USABLE_PAGE_HEIGHT_WORD_UNITS } from '../constants'
import {
  defaultCellProps,
  cellParagraph,
  noBorder,
  rowNoSplitAcrossPages,
  sectionHeaderShading,
  strongBlackBorders,
} from '../docxComponents'
import { imageParagraph, pxToWordUnits, scaledImageSize } from '../imageHelpers'

const fmtDateTime = (dateString: string): string => formatDateTime(dateString, 'DD/MM/YYYY HH:mm')

// Details of Allegation (nested table for map pages).
const detailsOfAllegationTable = (report: ProximityAlertReportData): Table => {
  const borders = strongBlackBorders()
  const { crimeVersionData } = report

  const detailRows: Array<[string, string]> = [
    ['Crime Type', crimeVersionData.crimeType],
    ['Crime Reference', crimeVersionData.crimeReference],
    ['Crime Batch', crimeVersionData.batchId],
    ['From Date/Time', fmtDateTime(crimeVersionData.fromDateTime)],
    ['To Date/Time', fmtDateTime(crimeVersionData.toDateTime)],
    ['Crime Location\n(Lat/Long)', `${crimeVersionData.latitude}\n${crimeVersionData.longitude}`],
  ]

  const additionalInfoRowSpan = detailRows.length

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      rowNoSplitAcrossPages([
        new TableCell({
          ...defaultCellProps(),
          borders,
          shading: sectionHeaderShading(),
          columnSpan: 3,
          children: [
            cellParagraph('Details of Allegation', {
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
          width: { size: 22, type: WidthType.PERCENTAGE },
          children: [cellParagraph(detailRows[0][0])],
        }),
        new TableCell({
          ...defaultCellProps(),
          borders,
          width: { size: 33, type: WidthType.PERCENTAGE },
          children: [cellParagraph(detailRows[0][1], { alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          ...defaultCellProps(),
          borders: { ...borders, bottom: borders.bottom },
          width: { size: 45, type: WidthType.PERCENTAGE },
          rowSpan: additionalInfoRowSpan,
          children: [
            cellParagraph('Additional Information', {
              alignment: AlignmentType.CENTER,
              underline: true,
            }),
            cellParagraph(crimeVersionData.crimeText || 'N/A', {
              spacingBefore: 120,
            }),
          ],
        }),
      ]),

      ...detailRows.slice(1).map(([label, value]) =>
        rowNoSplitAcrossPages([
          new TableCell({
            ...defaultCellProps(),
            borders,
            width: { size: 22, type: WidthType.PERCENTAGE },
            children: [cellParagraph(label)],
          }),
          new TableCell({
            ...defaultCellProps(),
            borders,
            width: { size: 33, type: WidthType.PERCENTAGE },
            children: String(value)
              .split('\n')
              .map(line => cellParagraph(line, { alignment: AlignmentType.CENTER })),
          }),
        ]),
      ),
    ],
  })
}

// Map page “frame” table: optional title row + image + allegation table + filler.
export const mapImagePageTable = (args: {
  title?: string
  showTitleRow?: boolean
  jpg: Buffer
  report: ProximityAlertReportData
  fillerHeightWordUnits: number
}): Table => {
  const { title, showTitleRow = true, jpg, report, fillerHeightWordUnits } = args

  const borders = strongBlackBorders()
  const imageCellPadding = { top: 0, bottom: 0, left: 0, right: 0 } as const

  const gapBeforeDetailsWordUnits = 360
  const rows: TableRow[] = []

  if (showTitleRow) {
    rows.push(
      rowNoSplitAcrossPages([
        new TableCell({
          ...defaultCellProps(),
          borders,
          shading: sectionHeaderShading(),
          children: [cellParagraph(title ?? '', { bold: true, alignment: AlignmentType.CENTER })],
        }),
      ]),
    )
  }

  rows.push(
    rowNoSplitAcrossPages([
      new TableCell({
        verticalAlign: VerticalAlign.TOP,
        margins: imageCellPadding,
        borders: { ...borders, bottom: noBorder() },
        children: [imageParagraph(jpg)],
      }),
    ]),
  )

  rows.push(
    rowNoSplitAcrossPages([
      new TableCell({
        ...defaultCellProps(),
        borders: { ...borders, top: noBorder(), bottom: noBorder() },
        children: [
          new Paragraph({ children: [], spacing: { before: gapBeforeDetailsWordUnits, after: 0 } }),
          detailsOfAllegationTable(report),
        ],
      }),
    ]),
  )

  rows.push(
    rowNoSplitAcrossPages(
      [
        new TableCell({
          ...defaultCellProps(),
          borders: { ...borders, top: noBorder() },
          children: [new Paragraph({ children: [], spacing: { before: 0, after: 0 } })],
        }),
      ],
      { heightWordUnits: fillerHeightWordUnits, heightRule: HeightRule.EXACT },
    ),
  )

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders,
    rows,
  })
}

export const fillerHeightForMapPage = (jpg: Buffer, hasTitleRow: boolean): number => {
  const imageSizeForPage = scaledImageSize(jpg)
  const imageHeightWordUnits = pxToWordUnits(imageSizeForPage.height)
  const titleRowWordUnits = hasTitleRow ? 520 : 0
  const detailsBlockHeightWordUnits = 3400
  const safetyBufferHeightWordUnits = 500

  return Math.max(
    0,
    USABLE_PAGE_HEIGHT_WORD_UNITS -
      (titleRowWordUnits + imageHeightWordUnits + detailsBlockHeightWordUnits + safetyBufferHeightWordUnits),
  )
}
