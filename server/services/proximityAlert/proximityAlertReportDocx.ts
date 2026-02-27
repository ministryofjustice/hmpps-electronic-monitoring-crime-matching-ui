// server/services/proximityAlert/proximityAlertReportDocx.ts

import {
  AlignmentType,
  BorderStyle,
  Document,
  HeightRule,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx'
import { imageSize } from 'image-size'
import type { ProximityAlertReportData, ProximityAlertReportDeviceWearer } from './proximityAlertReportData'
import type { ProximityAlertReportImages } from './mapImageRenderer'

export type BuildProximityAlertReportDocxArgs = {
  report: ProximityAlertReportData
  images: ProximityAlertReportImages
}

type AlignmentTypeValue = (typeof AlignmentType)[keyof typeof AlignmentType]
type HeightRuleValue = (typeof HeightRule)[keyof typeof HeightRule]

// Page geometry (A4 portrait) in Word units
const A4_WIDTH_WORD_UNITS = 11906
const A4_HEIGHT_WORD_UNITS = 16838
const PAGE_MARGIN_WORD_UNITS = 720
const USABLE_PAGE_HEIGHT_WORD_UNITS = A4_HEIGHT_WORD_UNITS - PAGE_MARGIN_WORD_UNITS - PAGE_MARGIN_WORD_UNITS

// docx ImageRun sizing is effectively based on 96dpi: px * 15.
const pxToWordUnits = (px: number) => Math.round(px * 15)

function fmtDateGb(iso: string): string {
  const date = new Date(iso)
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/London',
  }).format(date)
}

function fmtDateTimeGb(iso: string): string {
  const dateObj = new Date(iso)

  const date = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/London',
  }).format(dateObj)

  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/London',
  }).format(dateObj)

  return `${date} ${time}`
}

function cellParagraph(
  text: string,
  opts?: {
    bold?: boolean
    underline?: boolean
    alignment?: AlignmentTypeValue
    spacingAfter?: number
    spacingBefore?: number
  },
): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: opts?.bold,
        underline: opts?.underline ? {} : undefined,
      }),
    ],
    alignment: opts?.alignment,
    spacing: {
      before: opts?.spacingBefore ?? 0,
      after: opts?.spacingAfter ?? 0,
    },
  })
}

function paragraph(text: string, opts?: { bold?: boolean; alignment?: AlignmentTypeValue; spacingAfter?: number }) {
  return new Paragraph({
    children: [new TextRun({ text, bold: opts?.bold })],
    alignment: opts?.alignment,
    spacing: { before: 0, after: opts?.spacingAfter ?? 120 },
  })
}

function bulletPara(text: string, opts?: { spacingBefore?: number; spacingAfter?: number }): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text })],
    bullet: { level: 0 },
    spacing: {
      before: opts?.spacingBefore ?? 0,
      after: opts?.spacingAfter ?? 0,
    },
  })
}

function spacer(lines = 1): Paragraph[] {
  return Array.from({ length: Math.max(0, lines) }, () => new Paragraph(''))
}

// Target borders: prominent black.
function strongBlackBorders() {
  return {
    top: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    insideVertical: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
  } as const
}

function noBorder() {
  return { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } as const
}

function sectionHeaderShading() {
  return { type: ShadingType.CLEAR, color: 'auto', fill: 'E6E6E6' } as const
}

// Cell padding (margins) in Word units
const CELL_PADDING_WORD_UNITS = {
  top: 40,
  bottom: 40,
  left: 120,
  right: 120,
} as const

function cellArgsBase() {
  return {
    margins: CELL_PADDING_WORD_UNITS,
    verticalAlign: VerticalAlign.TOP,
  } as const
}

// Rows that shouldn't split across pages.
function rowNoSplit(children: TableCell[], opts?: { heightWordUnits?: number; heightRule?: HeightRuleValue }) {
  return new TableRow({
    cantSplit: true,
    height: opts?.heightWordUnits
      ? {
          value: opts.heightWordUnits,
          rule: opts.heightRule ?? HeightRule.ATLEAST,
        }
      : undefined,
    children,
  })
}

function scaleToMaxWidth(jpg: Buffer, maxWidthPx: number): { widthPx: number; heightPx: number } {
  const size = imageSize(jpg)
  const originalWidthPx = size.width
  const originalHeightPx = size.height
  if (!originalWidthPx || !originalHeightPx) throw new Error('Could not read image dimensions')

  const scale = maxWidthPx / originalWidthPx
  return {
    widthPx: Math.round(originalWidthPx * scale),
    heightPx: Math.round(originalHeightPx * scale),
  }
}

// Top boxed table: Date + Title + Summary.
function topSummaryTable(report: ProximityAlertReportData): Table {
  const borders = strongBlackBorders()
  const { crimeVersion } = report

  const titlePara = new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: 'Acquisitive Crime Proximity Alert', bold: true }),
      new TextRun({ text: '\n', break: 1 }),
      new TextRun({ text: `Crime Reference Number – ${crimeVersion.crimeReference}`, bold: true }),
    ],
    spacing: { before: 120, after: 120 },
  })

  const summaryParagraph1 =
    'The report below documents the results of a proximity search for the above crime reference number utilising the MoJ Acquisitive Crime Mapping Tool.'
  const summaryParagraph2 =
    'This process is designed to identify persons who are tagged as part of the MoJ’s Acquisitive Crime Project being in proximity of an acquisitive crime during the window of opportunity. The MoJ EM Acquisitive Crime Hub have reviewed each match and based on accuracy of the data and the relevance to the enquiry, have qualified the following as proximity match(es).'

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      rowNoSplit([
        new TableCell({
          ...cellArgsBase(),
          borders,
          shading: sectionHeaderShading(),
          children: [cellParagraph(`Date: ${fmtDateGb(report.generatedAtIso)}`, { bold: true })],
        }),
      ]),
      rowNoSplit([
        new TableCell({
          ...cellArgsBase(),
          borders,
          children: [titlePara],
        }),
      ]),
      rowNoSplit([
        new TableCell({
          ...cellArgsBase(),
          borders,
          shading: sectionHeaderShading(),
          children: [cellParagraph('Summary', { bold: true })],
        }),
      ]),
      rowNoSplit([
        new TableCell({
          ...cellArgsBase(),
          borders,
          children: [cellParagraph(summaryParagraph1, { spacingAfter: 160 }), cellParagraph(summaryParagraph2)],
        }),
      ]),
    ],
  })
}

// Common section header row spanning the whole table.
function sectionHeaderRow(text: string, opts?: { columnSpan?: number; center?: boolean }): TableRow {
  const borders = strongBlackBorders()
  return rowNoSplit([
    new TableCell({
      ...cellArgsBase(),
      borders,
      shading: sectionHeaderShading(),
      columnSpan: opts?.columnSpan ?? 2,
      children: [cellParagraph(text, { bold: true, alignment: opts?.center ? AlignmentType.CENTER : undefined })],
    }),
  ])
}

// Key/value row: used in person details tables and result/request summary tables, with various formatting options.
function keyValueRow(
  key: string,
  value: string,
  opts?: {
    keyWidthPct?: number
    valueWidthPct?: number
    valueAlign?: AlignmentTypeValue
    keyBold?: boolean
    valueBold?: boolean
  },
): TableRow {
  const borders = strongBlackBorders()

  const keyWidthPct = opts?.keyWidthPct ?? 33
  const valueWidthPct = opts?.valueWidthPct ?? 67

  const valueText = value ?? ''
  const valueLines = String(valueText).split('\n')
  const valueParas =
    valueLines.length === 1 && valueLines[0] === ''
      ? [cellParagraph('', { alignment: opts?.valueAlign, bold: opts?.valueBold })]
      : valueLines.map(line => cellParagraph(line, { alignment: opts?.valueAlign, bold: opts?.valueBold }))

  return rowNoSplit([
    new TableCell({
      ...cellArgsBase(),
      borders,
      width: { size: keyWidthPct, type: WidthType.PERCENTAGE },
      children: [cellParagraph(key, { bold: opts?.keyBold ?? false })],
    }),
    new TableCell({
      ...cellArgsBase(),
      borders,
      width: { size: valueWidthPct, type: WidthType.PERCENTAGE },
      children: valueParas,
    }),
  ])
}

// Person-only table: no result/request summary, just the person key/value rows.
function personOnlyTable(args: { personTitle: string; personRows: Array<[string, string]> }): Table {
  const borders = strongBlackBorders()
  const { personTitle, personRows } = args

  const personKeyWidthPct = 33
  const personValueWidthPct = 67

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      sectionHeaderRow(personTitle),
      ...personRows.map(([key, value], rowIndex) =>
        keyValueRow(key, value, {
          keyWidthPct: personKeyWidthPct,
          valueWidthPct: personValueWidthPct,
          valueBold: rowIndex === 0,
        }),
      ),
    ],
  })
}

// Result Summary (single instance).
function resultSummaryTable(matchedCount: number): Table {
  const borders = strongBlackBorders()

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      sectionHeaderRow('Result Summary'),
      keyValueRow('Number of qualified matches:', String(matchedCount), {
        keyWidthPct: 50,
        valueWidthPct: 50,
        valueAlign: AlignmentType.CENTER,
        valueBold: true,
      }),
    ],
  })
}

// Request Summary (single instance).
function requestSummaryTable(report: ProximityAlertReportData): Table {
  const borders = strongBlackBorders()
  const { crimeVersion } = report

  const rows: Array<[string, string]> = [
    ['Crime mapping Batch ID:', ''],
    ['Crime Reference number:', crimeVersion.crimeReference],
    ['Crime Type:', crimeVersion.crimeType],
    ['Crime Date/Time from:', fmtDateTimeGb(crimeVersion.fromDateTime)],
    ['Crime Date/Time to:', fmtDateTimeGb(crimeVersion.toDateTime)],
    ['Latitude:', String(crimeVersion.latitude)],
    ['Longitude:', String(crimeVersion.longitude)],
    ['Crime Text:', crimeVersion.crimeText || ''],
  ]

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      sectionHeaderRow('Request Summary'),
      ...rows.map(([key, value]) =>
        keyValueRow(key, value, { keyWidthPct: 50, valueWidthPct: 50, valueAlign: AlignmentType.CENTER }),
      ),
    ],
  })
}

// Details of Allegation (nested table for map pages).
function detailsOfAllegationTable(report: ProximityAlertReportData): Table {
  const borders = strongBlackBorders()
  const { crimeVersion } = report

  const detailRows: Array<[string, string]> = [
    ['Crime Type', crimeVersion.crimeType],
    ['Crime Reference', crimeVersion.crimeReference],
    ['Crime Batch', ''],
    ['From Date/Time', fmtDateTimeGb(crimeVersion.fromDateTime)],
    ['To Date/Time', fmtDateTimeGb(crimeVersion.toDateTime)],
    ['Crime Location\n(Lat/Long)', `${crimeVersion.latitude}\n${crimeVersion.longitude}`],
  ]

  const additionalInfoRowSpan = detailRows.length

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      rowNoSplit([
        new TableCell({
          ...cellArgsBase(),
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

      rowNoSplit([
        new TableCell({
          ...cellArgsBase(),
          borders,
          width: { size: 22, type: WidthType.PERCENTAGE },
          children: [cellParagraph(detailRows[0][0])],
        }),
        new TableCell({
          ...cellArgsBase(),
          borders,
          width: { size: 33, type: WidthType.PERCENTAGE },
          children: [cellParagraph(detailRows[0][1], { alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          ...cellArgsBase(),
          borders: { ...borders, bottom: borders.bottom },
          width: { size: 45, type: WidthType.PERCENTAGE },
          rowSpan: additionalInfoRowSpan,
          children: [cellParagraph('Additional Information', { alignment: AlignmentType.CENTER })],
        }),
      ]),

      ...detailRows.slice(1).map(([label, value]) =>
        rowNoSplit([
          new TableCell({
            ...cellArgsBase(),
            borders,
            width: { size: 22, type: WidthType.PERCENTAGE },
            children: [cellParagraph(label)],
          }),
          new TableCell({
            ...cellArgsBase(),
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
function mapImagePageTable(args: {
  title?: string
  showTitleRow?: boolean
  jpg: Buffer
  imageWidthPx: number
  imageHeightPx: number
  report: ProximityAlertReportData
  fillerHeightWordUnits: number
}): Table {
  const { title, showTitleRow = true, jpg, imageWidthPx, imageHeightPx, report, fillerHeightWordUnits } = args

  const borders = strongBlackBorders()
  const imageCellPadding = { top: 0, bottom: 0, left: 0, right: 0 } as const

  const imagePara = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 0, before: 0 },
    children: [
      new ImageRun({
        data: jpg,
        type: 'jpg',
        transformation: { width: imageWidthPx, height: imageHeightPx },
      }),
    ],
  })

  const gapBeforeDetailsWordUnits = 360
  const rows: TableRow[] = []

  if (showTitleRow) {
    rows.push(
      rowNoSplit([
        new TableCell({
          ...cellArgsBase(),
          borders,
          shading: sectionHeaderShading(),
          children: [cellParagraph(title ?? '', { bold: true, alignment: AlignmentType.CENTER })],
        }),
      ]),
    )
  }

  rows.push(
    rowNoSplit([
      new TableCell({
        verticalAlign: VerticalAlign.TOP,
        margins: imageCellPadding,
        borders: { ...borders, bottom: noBorder() },
        children: [imagePara],
      }),
    ]),
  )

  rows.push(
    rowNoSplit([
      new TableCell({
        ...cellArgsBase(),
        borders: { ...borders, top: noBorder(), bottom: noBorder() },
        children: [
          new Paragraph({ children: [], spacing: { before: gapBeforeDetailsWordUnits, after: 0 } }),
          detailsOfAllegationTable(report),
        ],
      }),
    ]),
  )

  rows.push(
    rowNoSplit(
      [
        new TableCell({
          ...cellArgsBase(),
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

function positionsTable(wearer: ProximityAlertReportDeviceWearer): Table {
  const borders = strongBlackBorders()

  const headerRow = rowNoSplit([
    new TableCell({
      ...cellArgsBase(),
      borders,
      shading: sectionHeaderShading(),
      children: [cellParagraph('Seq', { bold: true })],
    }),
    new TableCell({
      ...cellArgsBase(),
      borders,
      shading: sectionHeaderShading(),
      children: [cellParagraph('Captured date/time', { bold: true })],
    }),
    new TableCell({
      ...cellArgsBase(),
      borders,
      shading: sectionHeaderShading(),
      children: [cellParagraph('Latitude', { bold: true })],
    }),
    new TableCell({
      ...cellArgsBase(),
      borders,
      shading: sectionHeaderShading(),
      children: [cellParagraph('Longitude', { bold: true })],
    }),
    new TableCell({
      ...cellArgsBase(),
      borders,
      shading: sectionHeaderShading(),
      children: [cellParagraph('Confidence (m)', { bold: true })],
    }),
  ])

  const dataRows = wearer.positions.map(position =>
    rowNoSplit([
      new TableCell({ ...cellArgsBase(), borders, children: [cellParagraph(position.sequenceLabel)] }),
      new TableCell({
        ...cellArgsBase(),
        borders,
        children: [cellParagraph(fmtDateTimeGb(position.capturedDateTime))],
      }),
      new TableCell({ ...cellArgsBase(), borders, children: [cellParagraph(String(position.latitude))] }),
      new TableCell({ ...cellArgsBase(), borders, children: [cellParagraph(String(position.longitude))] }),
      new TableCell({ ...cellArgsBase(), borders, children: [cellParagraph(String(position.confidenceCircle))] }),
    ]),
  )

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [headerRow, ...dataRows],
  })
}

function disclaimerTable(): Table {
  const borders = strongBlackBorders()

  const disclaimerParagraph1 =
    'The data disclosed in this report does not confirm that the tag wearer perpetrated or witnessed a crime. In addition, it does not rule out other EM tag wearers being in the vicinity of the crime during the window of opportunity. The results of this process are also limited to persons tagged as part of the MoJ’s Acquisitive Crime Project and only where there has been an ability to monitor the equipment during the window of opportunity of the crime.'
  const disclaimerParagraph2 = 'Examples of an inability to monitor a person include:'
  const bullet1 = 'Where the person has failed to charge the EM tag,'
  const bullet2 = 'Where the tag has been removed from the person but is still able to transmit its location,'
  const bullet3 = 'Where the equipment has failed due to a technical fault.'
  const disclaimerParagraph3 =
    'The technology used (radio frequency transmissions; GPS location monitoring and Location Based Services) has been proven to be reliable over many years. The monitoring equipment is extremely robust and reliable and meets the stringent specifications laid down by the Ministry of Justice. The monitoring equipment is also rigorously tested and audited by EMS, an independent body, and the Home Office Scientific Branch.'

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      rowNoSplit([
        new TableCell({
          ...cellArgsBase(),
          borders,
          shading: sectionHeaderShading(),
          children: [cellParagraph('Disclaimer', { bold: true })],
        }),
      ]),
      rowNoSplit([
        new TableCell({
          ...cellArgsBase(),
          borders,
          children: [
            new Paragraph({ children: [new TextRun(disclaimerParagraph1)], spacing: { before: 0, after: 200 } }),
            new Paragraph({ children: [new TextRun(disclaimerParagraph2)], spacing: { before: 0, after: 120 } }),
            bulletPara(bullet1, { spacingAfter: 60 }),
            bulletPara(bullet2, { spacingAfter: 60 }),
            bulletPara(bullet3, { spacingAfter: 200 }),
            new Paragraph({ children: [new TextRun(disclaimerParagraph3)], spacing: { before: 0, after: 0 } }),
          ],
        }),
      ]),
    ],
  })
}

function witnessStatementTable(args: {
  report: ProximityAlertReportData
  wearer: ProximityAlertReportDeviceWearer
}): Table {
  const { report, wearer } = args
  const borders = strongBlackBorders()
  const { crimeVersion } = report

  const statementOf = ''
  const occupation = ''
  const preferredEmail = ''
  const address = ''

  const firstPosition = wearer.positions[0]
  const lastPosition = wearer.positions[wearer.positions.length - 1]
  const firstDateTime = firstPosition ? fmtDateTimeGb(firstPosition.capturedDateTime) : ''
  const lastDateTime = lastPosition ? fmtDateTimeGb(lastPosition.capturedDateTime) : ''

  const witnessHeaderParas: Paragraph[] = [
    paragraph('WITNESS STATEMENT', { bold: true, alignment: AlignmentType.CENTER, spacingAfter: 60 }),
    paragraph('(CJ Act 1967, s.9; MC Act 1980, ss.5A(3) (a) and 5B; Criminal Procedure Rules 2005, Rule 27.1)', {
      alignment: AlignmentType.CENTER,
      spacingAfter: 0,
    }),
  ]

  const statementRow = rowNoSplit([
    new TableCell({
      ...cellArgsBase(),
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
      ...cellArgsBase(),
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

  const ageRow = rowNoSplit([
    new TableCell({
      ...cellArgsBase(),
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

  const declarationRow = rowNoSplit([
    new TableCell({
      ...cellArgsBase(),
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
          children: [new TextRun({ text: `Date: ${fmtDateGb(report.generatedAtIso)}`, bold: true })],
          spacing: { before: 0, after: 0 },
        }),
      ],
    }),
  ])

  const narrativeRow = rowNoSplit([
    new TableCell({
      ...cellArgsBase(),
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
              `On ${fmtDateGb(report.generatedAtIso)} I reviewed a qualified match in relation to crime data supplied by `,
            ),
            new TextRun({ text: '', bold: true }),
            new TextRun(
              '. As a result of this process, I can confirm the attached match in relation to an allegation of ',
            ),
            new TextRun({ text: crimeVersion.crimeType, bold: true }),
            new TextRun(' – Crime Reference No. '),
            new TextRun({ text: crimeVersion.crimeReference, bold: true }),
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
      rowNoSplit([
        new TableCell({
          ...cellArgsBase(),
          borders,
          shading: sectionHeaderShading(),
          width: { size: 33, type: WidthType.PERCENTAGE },
          children: [cellParagraph('Person name', { bold: true, alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          ...cellArgsBase(),
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
          ...cellArgsBase(),
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
      rowNoSplit([
        new TableCell({
          ...cellArgsBase(),
          borders,
          children: [cellParagraph(wearer.name, { alignment: AlignmentType.CENTER, bold: true })],
        }),
        new TableCell({
          ...cellArgsBase(),
          borders,
          children: [cellParagraph(firstDateTime, { alignment: AlignmentType.CENTER, bold: true })],
        }),
        new TableCell({
          ...cellArgsBase(),
          borders,
          children: [cellParagraph(lastDateTime, { alignment: AlignmentType.CENTER, bold: true })],
        }),
      ]),
    ],
  })

  const exhibitsRow = rowNoSplit([
    new TableCell({
      ...cellArgsBase(),
      borders,
      columnSpan: 2,
      children: [
        new Paragraph({
          children: [
            new TextRun(
              'I further produce the attached screen shot which documents the subject’s movements within proximity of this allegation of crime:',
            ),
          ],
          spacing: { before: 200, after: 200 },
        }),
        witnessMiniTable,
        new Paragraph({ children: [], spacing: { before: 200, after: 0 } }),
        bulletPara(`Exhibit EMAC/01 – Image of the tracks for ${wearer.name} on the data.`, { spacingAfter: 60 }),
        bulletPara('Exhibit EMAC/02 – Key for interpreting symbols on crime map', { spacingAfter: 60 }),
        bulletPara(`Exhibit EMAC/03 – Table of ${wearer.name}’s locations within the vicinity.`, { spacingAfter: 200 }),
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
          children: [new TextRun({ text: `Date: ${fmtDateGb(report.generatedAtIso)}`, bold: true })],
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
      rowNoSplit([
        new TableCell({
          ...cellArgsBase(),
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

export async function buildProximityAlertReportDocx(args: BuildProximityAlertReportDocxArgs): Promise<Buffer> {
  const { report, images } = args

  // Target: map image edges aligned to the frame edges. Usable width ≈ 698px at 96dpi.
  const MAX_MAP_IMAGE_WIDTH_PX = 690

  // Use two filler heights because overview image 1 has a title row, overview image 2 does not.
  const mapTitleRowHeightWordUnits = 520
  const detailsBlockHeightWordUnits = 3400
  const safetyBufferHeightWordUnits = 500

  const fillerHeightForMapPage = (imageHeightPx: number, hasTitleRow: boolean) => {
    const imageHeightWordUnits = pxToWordUnits(imageHeightPx)
    const titleRowWordUnits = hasTitleRow ? mapTitleRowHeightWordUnits : 0

    return Math.max(
      0,
      USABLE_PAGE_HEIGHT_WORD_UNITS -
        (titleRowWordUnits + imageHeightWordUnits + detailsBlockHeightWordUnits + safetyBufferHeightWordUnits),
    )
  }

  const children: Array<Paragraph | Table> = []

  children.push(topSummaryTable(report))
  children.push(...spacer(1))

  report.matchedDeviceWearers.forEach((wearer, index) => {
    children.push(
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
    )
    children.push(...spacer(1))
  })

  children.push(resultSummaryTable(report.matchedDeviceWearers.length))
  children.push(requestSummaryTable(report))

  const overviewImage1Size = scaleToMaxWidth(images.image1Jpg, MAX_MAP_IMAGE_WIDTH_PX)
  children.push(new Paragraph({ children: [new PageBreak()] }))
  children.push(
    mapImagePageTable({
      title: 'Images of the crime map with all person’s proximity tracks',
      showTitleRow: true,
      jpg: images.image1Jpg,
      imageWidthPx: overviewImage1Size.widthPx,
      imageHeightPx: overviewImage1Size.heightPx,
      report,
      fillerHeightWordUnits: fillerHeightForMapPage(overviewImage1Size.heightPx, true),
    }),
  )

  const overviewImage2Size = scaleToMaxWidth(images.image2Jpg, MAX_MAP_IMAGE_WIDTH_PX)
  children.push(new Paragraph({ children: [new PageBreak()] }))
  children.push(
    mapImagePageTable({
      showTitleRow: false,
      jpg: images.image2Jpg,
      imageWidthPx: overviewImage2Size.widthPx,
      imageHeightPx: overviewImage2Size.heightPx,
      report,
      fillerHeightWordUnits: fillerHeightForMapPage(overviewImage2Size.heightPx, false),
    }),
  )

  children.push(...spacer(1))
  children.push(disclaimerTable())

  report.matchedDeviceWearers.forEach(wearer => {
    children.push(new Paragraph({ children: [new PageBreak()] }))
    children.push(witnessStatementTable({ report, wearer }))

    const wearerImage1Jpg = images.wearerImage1JpgById[wearer.deviceWearerId]
    const wearerImage1Size = scaleToMaxWidth(wearerImage1Jpg, MAX_MAP_IMAGE_WIDTH_PX)
    children.push(new Paragraph({ children: [new PageBreak()] }))
    children.push(
      mapImagePageTable({
        title: `Exhibit EMAC/01 - Image of maps and tracks for ${wearer.name}`,
        showTitleRow: true,
        jpg: wearerImage1Jpg,
        imageWidthPx: wearerImage1Size.widthPx,
        imageHeightPx: wearerImage1Size.heightPx,
        report,
        fillerHeightWordUnits: fillerHeightForMapPage(wearerImage1Size.heightPx, true),
      }),
    )

    const wearerImage2Jpg = images.wearerImage2JpgById[wearer.deviceWearerId]
    const wearerImage2Size = scaleToMaxWidth(wearerImage2Jpg, MAX_MAP_IMAGE_WIDTH_PX)
    children.push(new Paragraph({ children: [new PageBreak()] }))
    children.push(
      mapImagePageTable({
        title: `Exhibit EMAC/01 - Image of maps and tracks for ${wearer.name}`,
        showTitleRow: true,
        jpg: wearerImage2Jpg,
        imageWidthPx: wearerImage2Size.widthPx,
        imageHeightPx: wearerImage2Size.heightPx,
        report,
        fillerHeightWordUnits: fillerHeightForMapPage(wearerImage2Size.heightPx, true),
      }),
    )

    children.push(new Paragraph({ children: [new PageBreak()] }))
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Exhibit EMAC/03 – Table of ${wearer.name} locations within the vicinity`,
            bold: true,
          }),
        ],
      }),
    )
    children.push(
      new Paragraph({
        children: [
          new TextRun(
            'The below table displays the location points within the crime vicinity. Please note the sequence number is ordered chronologically based on locations within the vicinity.',
          ),
        ],
      }),
    )
    children.push(...spacer(1))
    children.push(positionsTable(wearer))
  })

  const doc = new Document({
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

  return Packer.toBuffer(doc)
}
