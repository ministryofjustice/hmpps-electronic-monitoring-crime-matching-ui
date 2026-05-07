import { AlignmentType, Paragraph, Table, TableCell, TableLayoutType, TextRun, WidthType } from 'docx'
import type { ProximityAlertReportData } from '../../../../presenters/proximityAlertReportData'
import { formatDateTime } from '../../../../utils/date'
import {
  defaultCellProps,
  cellParagraph,
  labelValueRow,
  rowNoSplitAcrossPages,
  sectionHeaderRow,
  sectionHeaderShading,
  spacer,
  strongBlackBorders,
} from '../docxComponents'
import { USABLE_PAGE_WIDTH_WORD_UNITS } from '../constants'

const fmtDate = (dateString: string): string => formatDateTime(dateString, 'DD/MM/YYYY')
const fmtDateTime = (dateTimeString: string): string => formatDateTime(dateTimeString, 'DD/MM/YYYY HH:mm')

// Top boxed table: Date + Title + Summary.
export const topSummaryTable = (report: ProximityAlertReportData): Table => {
  const borders = strongBlackBorders()
  const { crimeVersionData } = report

  const titlePara = new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: 'Acquisitive Crime Proximity Alert', bold: true }),
      new TextRun({ text: '\n', break: 1 }),
      new TextRun({ text: `Crime Reference Number - ${crimeVersionData.crimeReference}`, bold: true }),
    ],
    spacing: { before: 120, after: 120 },
  })

  const summaryParagraph1 =
    'The report below documents the results of a proximity search for the above crime reference number utilising the MoJ Acquisitive Crime Mapping Tool.'
  const summaryParagraph2 =
    "This process is designed to identify persons who are tagged as part of the MoJ's Acquisitive Crime Project being in proximity of an acquisitive crime during the window of opportunity. The MoJ EM Acquisitive Crime Hub have reviewed each match and based on accuracy of the data and the relevance to the enquiry, have qualified the following as proximity match(es)."

  return new Table({
    width: { size: USABLE_PAGE_WIDTH_WORD_UNITS, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      rowNoSplitAcrossPages([
        new TableCell({
          ...defaultCellProps(),
          borders,
          shading: sectionHeaderShading(),
          children: [cellParagraph(`Date: ${fmtDate(report.reportGeneratedAt)}`, { bold: true })],
        }),
      ]),
      rowNoSplitAcrossPages([
        new TableCell({
          ...defaultCellProps(),
          borders,
          children: [titlePara],
        }),
      ]),
      rowNoSplitAcrossPages([
        new TableCell({
          ...defaultCellProps(),
          borders,
          shading: sectionHeaderShading(),
          children: [cellParagraph('Summary', { bold: true })],
        }),
      ]),
      rowNoSplitAcrossPages([
        new TableCell({
          ...defaultCellProps(),
          borders,
          children: [cellParagraph(summaryParagraph1, { spacingAfter: 160 }), cellParagraph(summaryParagraph2)],
        }),
      ]),
    ],
  })
}

// Person-only table: no result/request summary, just the person key/value rows.
export const personOnlyTable = (args: { personTitle: string; personRows: Array<[string, string]> }): Table => {
  const borders = strongBlackBorders()
  const { personTitle, personRows } = args

  const personKeyWidthPct = 33
  const personValueWidthPct = 67

  return new Table({
    width: { size: USABLE_PAGE_WIDTH_WORD_UNITS, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      sectionHeaderRow(personTitle, { useGreen: true }),
      ...personRows.map(([key, value], rowIndex) =>
        labelValueRow(key, value, {
          keyWidthPct: personKeyWidthPct,
          valueWidthPct: personValueWidthPct,
          valueBold: rowIndex === 0,
        }),
      ),
    ],
  })
}

export const personSummarySections = (report: ProximityAlertReportData): Array<Paragraph | Table> =>
  report.matchedDeviceWearers.flatMap((wearer, index) => [
    personOnlyTable({
      personTitle: `Person ${index + 1}`,
      personRows: [
        ['Full name', wearer.name],
        ['DOB:', ''],
        ['PNC number:', ''],
        ['Specified Address:', ''],
        ['EMS ID:', wearer.deviceWearerId],
        ['Offender Manager:', ''],
      ],
    }),
    ...spacer(1),
  ])

// Result Summary (single instance).
export const resultSummaryTable = (matchedCount: number): Table => {
  const borders = strongBlackBorders()

  return new Table({
    width: { size: USABLE_PAGE_WIDTH_WORD_UNITS, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      sectionHeaderRow('Result Summary', { useGreen: true }),
      labelValueRow('Number of qualified matches:', String(matchedCount), {
        keyWidthPct: 50,
        valueWidthPct: 50,
        valueAlign: AlignmentType.CENTER,
        valueBold: true,
      }),
    ],
  })
}

// Request Summary (single instance).
export const requestSummaryTable = (report: ProximityAlertReportData): Table => {
  const borders = strongBlackBorders()
  const { crimeVersionData } = report

  const rows: Array<[string, string]> = [
    ['Crime mapping Batch ID:', crimeVersionData.batchId],
    ['Crime Reference number:', crimeVersionData.crimeReference],
    ['Crime Type:', crimeVersionData.crimeType],
    ['Crime Date/Time from:', fmtDateTime(crimeVersionData.fromDateTime)],
    ['Crime Date/Time to:', fmtDateTime(crimeVersionData.toDateTime)],
    ['Latitude:', String(crimeVersionData.latitude)],
    ['Longitude:', String(crimeVersionData.longitude)],
    ['Crime Text:', crimeVersionData.crimeText || ''],
  ]

  return new Table({
    width: { size: USABLE_PAGE_WIDTH_WORD_UNITS, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      sectionHeaderRow('Request Summary', { useGreen: true }),
      ...rows.map(([key, value]) =>
        labelValueRow(key, value, { keyWidthPct: 50, valueWidthPct: 50, valueAlign: AlignmentType.CENTER }),
      ),
    ],
  })
}
