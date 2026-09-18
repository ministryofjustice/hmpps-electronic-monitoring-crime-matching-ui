import { AlignmentType, HeightRule, Paragraph, Table, TableCell, TableLayoutType, TableRow, WidthType } from 'docx'
import type { ProximityAlertReportData } from '../../../../presenters/proximityAlertReportData'
import { formatDateTime } from '../../../../utils/date'
import {
  CELL_PADDING_WORD_UNITS,
  USABLE_PAGE_HEIGHT_WORD_UNITS,
  USABLE_PAGE_WIDTH_WORD_UNITS,
  WORD_UNITS_PER_PX,
} from '../constants'
import {
  defaultCellProps,
  cellParagraph,
  fullWidthDxa,
  pctToDxa,
  rowNoSplitAcrossPages,
  sectionHeaderShading,
  strongBlackBorders,
} from '../docxComponents'
import PROXIMITY_ALERT_REPORT_CONTENT from '../../../../constants/proximityAlert/reportContent'
import { imageParagraph } from '../imageHelpers'

const fmtDateTime = (dateString: string): string => formatDateTime(dateString, 'DD/MM/YYYY HH:mm:ss')

// Details of Allegation (nested table for map pages).
const detailsOfAllegationTable = (report: ProximityAlertReportData): Table => {
  const borders = strongBlackBorders()
  const { crimeVersionData } = report
  const detailsOfAllegationContent = PROXIMITY_ALERT_REPORT_CONTENT.detailsOfAllegation

  const detailRows: Array<[string, string]> = [
    [detailsOfAllegationContent.rows.crimeType, crimeVersionData.crimeType],
    [detailsOfAllegationContent.rows.crimeReference, crimeVersionData.crimeReference],
    [detailsOfAllegationContent.rows.batchId, crimeVersionData.batchId],
    [detailsOfAllegationContent.rows.fromDateTime, fmtDateTime(crimeVersionData.fromDateTime)],
    [detailsOfAllegationContent.rows.toDateTime, fmtDateTime(crimeVersionData.toDateTime)],
    [detailsOfAllegationContent.rows.crimeLocation, `${crimeVersionData.latitude}\n${crimeVersionData.longitude}`],
  ]

  const additionalInfoRowSpan = detailRows.length
  const columnWidthPercentages = [22, 33, 45]

  const nestedTableWidthWordUnits =
    USABLE_PAGE_WIDTH_WORD_UNITS - CELL_PADDING_WORD_UNITS.left - CELL_PADDING_WORD_UNITS.right

  return new Table({
    width: { size: nestedTableWidthWordUnits, type: WidthType.DXA },
    columnWidths: columnWidthPercentages.map(pct => pctToDxa(pct, nestedTableWidthWordUnits)),
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
            cellParagraph(detailsOfAllegationContent.heading, {
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
          width: { size: pctToDxa(22, nestedTableWidthWordUnits), type: WidthType.DXA },
          children: [cellParagraph(detailRows[0][0])],
        }),
        new TableCell({
          ...defaultCellProps(),
          borders,
          width: { size: pctToDxa(33, nestedTableWidthWordUnits), type: WidthType.DXA },
          children: [cellParagraph(detailRows[0][1], { alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          ...defaultCellProps(),
          borders: { ...borders, bottom: borders.bottom },
          width: { size: pctToDxa(45, nestedTableWidthWordUnits), type: WidthType.DXA },
          rowSpan: additionalInfoRowSpan,
          children: [
            cellParagraph(detailsOfAllegationContent.additionalInformation, {
              alignment: AlignmentType.CENTER,
              underline: true,
            }),
            cellParagraph(crimeVersionData.crimeText || detailsOfAllegationContent.noAdditionalInformation, {
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
            width: { size: pctToDxa(22, nestedTableWidthWordUnits), type: WidthType.DXA },
            children: [cellParagraph(label)],
          }),
          new TableCell({
            ...defaultCellProps(),
            borders,
            width: { size: pctToDxa(33, nestedTableWidthWordUnits), type: WidthType.DXA },
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
const mapImagePageTable = (args: {
  title?: string
  showTitleRow?: boolean
  jpg: Buffer
  report: ProximityAlertReportData
  fillerHeightWordUnits: number
}): Table => {
  const { title, showTitleRow = true, jpg, report, fillerHeightWordUnits } = args

  const borders = strongBlackBorders()
  const imageFullBleedIndent = { left: -CELL_PADDING_WORD_UNITS.left, right: -CELL_PADDING_WORD_UNITS.right }
  const fillerMarginWordUnits = 40
  const fillerIndent = {
    left: fillerMarginWordUnits - CELL_PADDING_WORD_UNITS.left,
    right: fillerMarginWordUnits - CELL_PADDING_WORD_UNITS.right,
  }

  const gapBeforeDetailsWordUnits = 360

  // Reserve space for the "Details of Allegation" table (its height varies with wrapped
  // crime text) so the image can never grow tall enough to push the table onto a new page.
  const reservedForDetailsTableWordUnits = 4200
  const maxImageHeightWordUnits = Math.max(
    0,
    fillerHeightWordUnits - gapBeforeDetailsWordUnits - reservedForDetailsTableWordUnits,
  )
  const maxImageHeightPx = Math.floor(maxImageHeightWordUnits / WORD_UNITS_PER_PX)

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
    rowNoSplitAcrossPages(
      [
        new TableCell({
          ...defaultCellProps(),
          borders,
          children: [
            imageParagraph(jpg, imageFullBleedIndent, maxImageHeightPx),
            new Paragraph({
              children: [],
              spacing: { before: gapBeforeDetailsWordUnits, after: 0 },
              indent: fillerIndent,
              alignment: AlignmentType.CENTER,
            }),
            detailsOfAllegationTable(report),
          ],
        }),
      ],
      // ATLEAST (not EXACT) so the row only stretches to fill the page when content is short -
      // fillerHeightWordUnits already keeps a generous buffer below a full page's height.
      { heightWordUnits: fillerHeightWordUnits, heightRule: HeightRule.ATLEAST },
    ),
  )

  return new Table({
    width: fullWidthDxa(),
    columnWidths: [USABLE_PAGE_WIDTH_WORD_UNITS],
    layout: TableLayoutType.FIXED,
    borders,
    rows,
  })
}

// Target minimum height for the row holding the map image, allegation table and blank filler,
// so the box visually reaches near the bottom of the page (for pasting in further images later).
// titleRowWordUnits allows for the title wrapping onto 2 lines, and the safety buffer absorbs
// rendering variance (fonts, border/margin rounding) between Word's preview and edit-mode layout,
// so this deliberately stops well short of a full page rather than risking overflow onto a new one.
export const fillerHeightForMapPage = (hasTitleRow: boolean): number => {
  const titleRowWordUnits = hasTitleRow ? 900 : 0
  const safetyBufferHeightWordUnits = 1440

  return Math.max(0, USABLE_PAGE_HEIGHT_WORD_UNITS - (titleRowWordUnits + safetyBufferHeightWordUnits))
}

export default mapImagePageTable
