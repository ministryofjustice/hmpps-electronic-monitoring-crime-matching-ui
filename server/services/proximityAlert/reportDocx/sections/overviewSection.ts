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
  noBorder,
  strongBlackBorders,
} from '../docxComponents'
import PROXIMITY_ALERT_REPORT_CONTENT from '../../../../constants/proximityAlert/reportContent'
import { USABLE_PAGE_WIDTH_WORD_UNITS } from '../constants'

const fmtDate = (dateString: string): string => formatDateTime(dateString, 'DD/MM/YYYY')
const fmtDateTime = (dateTimeString: string): string => formatDateTime(dateTimeString, 'DD/MM/YYYY HH:mm')

// Top boxed table: Date + Title + Summary.
export const topSummaryTable = (report: ProximityAlertReportData): Table => {
  const borders = strongBlackBorders()
  const { crimeVersionData } = report
  const { summary } = PROXIMITY_ALERT_REPORT_CONTENT

  const titlePara = new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: summary.title, bold: true }),
      new TextRun({ text: '\n', break: 1 }),
      new TextRun({ text: `${summary.crimeReferencePrefix} - ${crimeVersionData.crimeReference}`, bold: true }),
    ],
    spacing: { before: 120, after: 120 },
  })

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
          children: [cellParagraph(`${summary.dateLabel}: ${fmtDate(report.reportGeneratedAt)}`, { bold: true })],
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
          children: [cellParagraph(summary.heading, { bold: true })],
        }),
      ]),
      rowNoSplitAcrossPages([
        new TableCell({
          ...defaultCellProps(),
          borders,
          children: [cellParagraph(summary.paragraph1, { spacingAfter: 160 }), cellParagraph(summary.paragraph2)],
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

  const innerTable = new Table({
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

  return new Table({
    width: { size: USABLE_PAGE_WIDTH_WORD_UNITS, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      rowNoSplitAcrossPages([
        new TableCell({
          margins: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          },
          borders: {
            top: noBorder(),
            bottom: noBorder(),
            left: noBorder(),
            right: noBorder(),
          },
          children: [innerTable],
        }),
      ]),
    ],
  })
}

export const personSummarySections = (report: ProximityAlertReportData): Array<Paragraph | Table> => {
  const { personSummary } = PROXIMITY_ALERT_REPORT_CONTENT

  return report.matchedDeviceWearers.flatMap((wearer, personIndex) => [
    personOnlyTable({
      personTitle: `${personSummary.titlePrefix} ${personIndex + 1}`,
      personRows: [
        [personSummary.rows.fullName, wearer.name],
        [personSummary.rows.dateOfBirth, wearer.dateOfBirth],
        [personSummary.rows.pncNumber, wearer.pncRef],
        [personSummary.rows.address, wearer.address],
        [personSummary.rows.emsId, wearer.deviceWearerId],
      ],
    }),
    ...spacer(1),
  ])
}

// Result Summary (single instance).
export const resultSummaryTable = (matchedCount: number): Table => {
  const borders = strongBlackBorders()
  const { resultSummary } = PROXIMITY_ALERT_REPORT_CONTENT

  return new Table({
    width: { size: USABLE_PAGE_WIDTH_WORD_UNITS, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      sectionHeaderRow(resultSummary.heading, { useGreen: true }),
      labelValueRow(resultSummary.matchedCountLabel, String(matchedCount), {
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
  const { requestSummary } = PROXIMITY_ALERT_REPORT_CONTENT

  const rows: Array<[string, string]> = [
    [requestSummary.rows.batchId, crimeVersionData.batchId],
    [requestSummary.rows.crimeReference, crimeVersionData.crimeReference],
    [requestSummary.rows.crimeType, crimeVersionData.crimeType],
    [requestSummary.rows.fromDateTime, fmtDateTime(crimeVersionData.fromDateTime)],
    [requestSummary.rows.toDateTime, fmtDateTime(crimeVersionData.toDateTime)],
    [requestSummary.rows.latitude, String(crimeVersionData.latitude)],
    [requestSummary.rows.longitude, String(crimeVersionData.longitude)],
    [requestSummary.rows.crimeText, crimeVersionData.crimeText || requestSummary.noCrimeText],
  ]

  return new Table({
    width: { size: USABLE_PAGE_WIDTH_WORD_UNITS, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      sectionHeaderRow(requestSummary.heading, { useGreen: true }),
      ...rows.map(([key, value]) =>
        labelValueRow(key, value, { keyWidthPct: 50, valueWidthPct: 50, valueAlign: AlignmentType.CENTER }),
      ),
    ],
  })
}
