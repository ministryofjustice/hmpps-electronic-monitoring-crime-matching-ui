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

/**
 * Page geometry (A4 portrait) in twips (Word units)
 */
const A4_WIDTH_TWIPS = 11906
const A4_HEIGHT_TWIPS = 16838
const MARGIN_TWIPS = 720 // 0.5"
const USABLE_HEIGHT_TWIPS = A4_HEIGHT_TWIPS - MARGIN_TWIPS - MARGIN_TWIPS

/**
 * docx ImageRun sizing is effectively based on 96dpi
 * twips = (px / 96) * 1440  => px * 15
 */
const pxToTwips = (px: number) => Math.round(px * 15)

function fmtDateGb(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/London',
  }).format(d)
}

function fmtDateTimeGb(iso: string): string {
  const d = new Date(iso)

  const date = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/London',
  }).format(d)

  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/London',
  }).format(d)

  return `${date} ${time}`
}

function cellPara(
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

/**
 * Target borders: prominent black.
 * (Word renders border size in eighths of a point; 8 ≈ 1pt)
 */
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

/**
 * Cell padding (margins) in twips
 */
const CELL_PADDING = {
  top: 40,
  bottom: 40,
  left: 120,
  right: 120,
} as const

function cellArgsBase() {
  return {
    margins: CELL_PADDING,
    verticalAlign: VerticalAlign.TOP,
  } as const
}

/**
 * Convenience: rows that shouldn't split across pages
 */
function rowNoSplit(children: TableCell[], opts?: { heightTwips?: number; heightRule?: HeightRuleValue }) {
  return new TableRow({
    cantSplit: true,
    height: opts?.heightTwips
      ? {
          value: opts.heightTwips,
          rule: opts.heightRule ?? HeightRule.ATLEAST,
        }
      : undefined,
    children,
  })
}

function scaleToMaxWidth(jpg: Buffer, maxWidthPx: number): { widthPx: number; heightPx: number } {
  const size = imageSize(jpg)
  const w = size.width
  const h = size.height
  if (!w || !h) throw new Error('Could not read image dimensions')

  const scale = maxWidthPx / w
  return {
    widthPx: Math.round(w * scale),
    heightPx: Math.round(h * scale),
  }
}

/**
 * -------- Top boxed table (Date + Title + Summary) --------
 */
function topSummaryTable(report: ProximityAlertReportData): Table {
  const borders = strongBlackBorders()
  const cv = report.crimeVersion

  const titlePara = new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: 'Acquisitive Crime Proximity Alert', bold: true }),
      new TextRun({ text: '\n', break: 1 }),
      new TextRun({ text: `Crime Reference Number – ${cv.crimeReference}`, bold: true }),
    ],
    spacing: { before: 120, after: 120 },
  })

  const summaryP1 =
    'The report below documents the results of a proximity search for the above crime reference number utilising the MoJ Acquisitive Crime Mapping Tool.'
  const summaryP2 =
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
          children: [cellPara(`Date: ${fmtDateGb(report.generatedAtIso)}`, { bold: true })],
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
          children: [cellPara('Summary', { bold: true })],
        }),
      ]),

      rowNoSplit([
        new TableCell({
          ...cellArgsBase(),
          borders,
          children: [cellPara(summaryP1, { spacingAfter: 160 }), cellPara(summaryP2)],
        }),
      ]),
    ],
  })
}

/**
 * -------- Common header + key/value rows --------
 */
function sectionHeaderRow(text: string, opts?: { columnSpan?: number; center?: boolean }): TableRow {
  const borders = strongBlackBorders()
  return rowNoSplit([
    new TableCell({
      ...cellArgsBase(),
      borders,
      shading: sectionHeaderShading(),
      columnSpan: opts?.columnSpan ?? 2,
      children: [cellPara(text, { bold: true, alignment: opts?.center ? AlignmentType.CENTER : undefined })],
    }),
  ])
}

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
      ? [cellPara('', { alignment: opts?.valueAlign, bold: opts?.valueBold })]
      : valueLines.map(line => cellPara(line, { alignment: opts?.valueAlign, bold: opts?.valueBold }))

  return rowNoSplit([
    new TableCell({
      ...cellArgsBase(),
      borders,
      width: { size: keyWidthPct, type: WidthType.PERCENTAGE },
      children: [cellPara(key, { bold: opts?.keyBold ?? false })],
    }),
    new TableCell({
      ...cellArgsBase(),
      borders,
      width: { size: valueWidthPct, type: WidthType.PERCENTAGE },
      children: valueParas,
    }),
  ])
}

/**
 * -------- Person-only table (NO result/request summary) --------
 */
function personOnlyTable(args: { personTitle: string; personRows: Array<[string, string]> }): Table {
  const borders = strongBlackBorders()
  const { personTitle, personRows } = args

  const personKeyWidth = 33
  const personValueWidth = 67

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      sectionHeaderRow(personTitle),
      ...personRows.map(([k, v], i) =>
        keyValueRow(k, v, {
          keyWidthPct: personKeyWidth,
          valueWidthPct: personValueWidth,
          valueBold: i === 0, // full name bold
        }),
      ),
    ],
  })
}

/**
 * -------- Result Summary (single instance) --------
 */
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

/**
 * -------- Request Summary (single instance) --------
 */
function requestSummaryTable(report: ProximityAlertReportData): Table {
  const borders = strongBlackBorders()
  const cv = report.crimeVersion

  const rows: Array<[string, string]> = [
    ['Crime mapping Batch ID:', ''],
    ['Crime Reference number:', cv.crimeReference],
    ['Crime Type:', cv.crimeType],
    ['Crime Date/Time from:', fmtDateTimeGb(cv.fromDateTime)],
    ['Crime Date/Time to:', fmtDateTimeGb(cv.toDateTime)],
    ['Latitude:', String(cv.latitude)],
    ['Longitude:', String(cv.longitude)],
    ['Crime Text:', cv.crimeText || ''],
  ]

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      sectionHeaderRow('Request Summary'),
      ...rows.map(([k, v]) =>
        keyValueRow(k, v, { keyWidthPct: 50, valueWidthPct: 50, valueAlign: AlignmentType.CENTER }),
      ),
    ],
  })
}

/**
 * -------- Details of Allegation (nested table) --------
 */
function detailsOfAllegationTable(report: ProximityAlertReportData): Table {
  const borders = strongBlackBorders()
  const cv = report.crimeVersion

  const rows: Array<[string, string]> = [
    ['Crime Type', cv.crimeType],
    ['Crime Reference', cv.crimeReference],
    ['Crime Batch', ''],
    ['From Date/Time', fmtDateTimeGb(cv.fromDateTime)],
    ['To Date/Time', fmtDateTimeGb(cv.toDateTime)],
    ['Crime Location\n(Lat/Long)', `${cv.latitude}\n${cv.longitude}`],
  ]

  const additionalInfoRowSpan = rows.length

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
            cellPara('Details of Allegation', {
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
          children: [cellPara(rows[0][0])],
        }),
        new TableCell({
          ...cellArgsBase(),
          borders,
          width: { size: 33, type: WidthType.PERCENTAGE },
          children: [cellPara(rows[0][1], { alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          ...cellArgsBase(),
          // Force a bottom border on the rowSpan cell so Word renders it consistently
          borders: {
            ...borders,
            bottom: borders.bottom,
          },
          width: { size: 45, type: WidthType.PERCENTAGE },
          rowSpan: additionalInfoRowSpan,
          children: [
            cellPara('Additional Information', {
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      ]),

      ...rows.slice(1).map(([label, value]) =>
        rowNoSplit([
          new TableCell({
            ...cellArgsBase(),
            borders,
            width: { size: 22, type: WidthType.PERCENTAGE },
            children: [cellPara(label)],
          }),
          new TableCell({
            ...cellArgsBase(),
            borders,
            width: { size: 33, type: WidthType.PERCENTAGE },
            children: String(value)
              .split('\n')
              .map(line => cellPara(line, { alignment: AlignmentType.CENTER })),
          }),
        ]),
      ),
    ],
  })
}

/**
 * -------- Map page “frame” table (outer big bordered table) --------
 *
 * Supports optional title row (second overview image in the target doc has no heading).
 */
function mapImagePageTable(args: {
  title?: string
  showTitleRow?: boolean
  jpg: Buffer
  imageWidthPx: number
  imageHeightPx: number
  report: ProximityAlertReportData
  fillerHeightTwips: number
}): Table {
  const { title, showTitleRow = true, jpg, imageWidthPx, imageHeightPx, report, fillerHeightTwips } = args

  const borders = strongBlackBorders()
  const IMAGE_CELL_PADDING = { top: 0, bottom: 0, left: 0, right: 0 } as const

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

  const GAP_BEFORE_DETAILS_TWIPS = 360

  const rows: TableRow[] = []

  if (showTitleRow) {
    rows.push(
      rowNoSplit([
        new TableCell({
          ...cellArgsBase(),
          borders,
          shading: sectionHeaderShading(),
          children: [cellPara(title ?? '', { bold: true, alignment: AlignmentType.CENTER })],
        }),
      ]),
    )
  }

  // Image row (no line below it)
  rows.push(
    rowNoSplit([
      new TableCell({
        verticalAlign: VerticalAlign.TOP,
        margins: IMAGE_CELL_PADDING,
        borders: { ...borders, bottom: noBorder() },
        children: [imagePara],
      }),
    ]),
  )

  // Details row (no line above or below)
  rows.push(
    rowNoSplit([
      new TableCell({
        ...cellArgsBase(),
        borders: { ...borders, top: noBorder(), bottom: noBorder() },
        children: [
          new Paragraph({ children: [], spacing: { before: GAP_BEFORE_DETAILS_TWIPS, after: 0 } }),
          detailsOfAllegationTable(report),
        ],
      }),
    ]),
  )

  // Filler (no line above)
  rows.push(
    rowNoSplit(
      [
        new TableCell({
          ...cellArgsBase(),
          borders: { ...borders, top: noBorder() },
          children: [new Paragraph({ children: [], spacing: { before: 0, after: 0 } })],
        }),
      ],
      { heightTwips: fillerHeightTwips, heightRule: HeightRule.EXACT },
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

  const header = rowNoSplit([
    new TableCell({
      ...cellArgsBase(),
      borders,
      shading: sectionHeaderShading(),
      children: [cellPara('Seq', { bold: true })],
    }),
    new TableCell({
      ...cellArgsBase(),
      borders,
      shading: sectionHeaderShading(),
      children: [cellPara('Captured date/time', { bold: true })],
    }),
    new TableCell({
      ...cellArgsBase(),
      borders,
      shading: sectionHeaderShading(),
      children: [cellPara('Latitude', { bold: true })],
    }),
    new TableCell({
      ...cellArgsBase(),
      borders,
      shading: sectionHeaderShading(),
      children: [cellPara('Longitude', { bold: true })],
    }),
    new TableCell({
      ...cellArgsBase(),
      borders,
      shading: sectionHeaderShading(),
      children: [cellPara('Confidence (m)', { bold: true })],
    }),
  ])

  const rows = wearer.positions.map(p =>
    rowNoSplit([
      new TableCell({ ...cellArgsBase(), borders, children: [cellPara(p.sequenceLabel)] }),
      new TableCell({ ...cellArgsBase(), borders, children: [cellPara(fmtDateTimeGb(p.capturedDateTime))] }),
      new TableCell({ ...cellArgsBase(), borders, children: [cellPara(String(p.latitude))] }),
      new TableCell({ ...cellArgsBase(), borders, children: [cellPara(String(p.longitude))] }),
      new TableCell({ ...cellArgsBase(), borders, children: [cellPara(String(p.confidenceCircle))] }),
    ]),
  )

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [header, ...rows],
  })
}

function disclaimerTable(): Table {
  const borders = strongBlackBorders()

  const p1 =
    'The data disclosed in this report does not confirm that the tag wearer perpetrated or witnessed a crime. In addition, it does not rule out other EM tag wearers being in the vicinity of the crime during the window of opportunity. The results of this process are also limited to persons tagged as part of the MoJ’s Acquisitive Crime Project and only where there has been an ability to monitor the equipment during the window of opportunity of the crime.'
  const p2 = 'Examples of an inability to monitor a person include:'
  const b1 = 'Where the person has failed to charge the EM tag,'
  const b2 = 'Where the tag has been removed from the person but is still able to transmit its location,'
  const b3 = 'Where the equipment has failed due to a technical fault.'
  const p3 =
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
          children: [cellPara('Disclaimer', { bold: true })],
        }),
      ]),
      rowNoSplit([
        new TableCell({
          ...cellArgsBase(),
          borders,
          children: [
            new Paragraph({ children: [new TextRun(p1)], spacing: { before: 0, after: 200 } }),
            new Paragraph({ children: [new TextRun(p2)], spacing: { before: 0, after: 120 } }),
            bulletPara(b1, { spacingAfter: 60 }),
            bulletPara(b2, { spacingAfter: 60 }),
            bulletPara(b3, { spacingAfter: 200 }),
            new Paragraph({ children: [new TextRun(p3)], spacing: { before: 0, after: 0 } }),
          ],
        }),
      ]),
    ],
  })
}

function witnessHeadingParas(): Paragraph[] {
  return [
    new Paragraph({ children: [new TextRun({ text: 'WITNESS STATEMENT', bold: true })] }),
    new Paragraph({
      children: [
        new TextRun({
          text: '(CJ Act 1967, s.9; MC Act 1980, ss.5A(3) (a) and 5B; Criminal Procedure Rules 2005, Rule 27.1)',
        }),
      ],
    }),
  ]
}

export async function buildProximityAlertReportDocx(args: BuildProximityAlertReportDocxArgs): Promise<Buffer> {
  const { report, images } = args

  /**
   * Target: map image edges aligned to the frame edges.
   * Usable width: (A4_WIDTH_TWIPS - 2*MARGIN_TWIPS) = 10466 twips => ~698px at 96dpi.
   */
  const MAP_W_MAX = 690

  // We use two filler heights:
  // - first overview image includes a title row
  // - second overview image has NO title row (per target doc)
  const headerRowTwips = 520

  const detailsBlockTwips = 3400
  const safetyBufferTwips = 500

  const fillerHeightsForImage = (imageHeightPx: number, hasTitleRow: boolean) => {
    const imageHeightTwips = pxToTwips(imageHeightPx)
    const titleTwips = hasTitleRow ? headerRowTwips : 0

    return Math.max(0, USABLE_HEIGHT_TWIPS - (titleTwips + imageHeightTwips + detailsBlockTwips + safetyBufferTwips))
  }

  const children: Array<Paragraph | Table> = []

  // --- Proximity Report (top summary + people grouped) ---
  children.push(topSummaryTable(report))
  children.push(...spacer(1))

  report.matchedDeviceWearers.forEach((wearer, idx) => {
    children.push(
      personOnlyTable({
        personTitle: `Person ${idx + 1}`,
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

  // Single Result Summary + Request Summary (NOT repeated per person)
  children.push(resultSummaryTable(report.matchedDeviceWearers.length))
  children.push(requestSummaryTable(report))

  // --- Overview images (2 total, once per report) ---
  const overview1Size = scaleToMaxWidth(images.image1Jpg, MAP_W_MAX)
  children.push(new Paragraph({ children: [new PageBreak()] }))
  children.push(
    mapImagePageTable({
      title: 'Images of the crime map with all person’s proximity tracks',
      showTitleRow: true,
      jpg: images.image1Jpg,
      imageWidthPx: overview1Size.widthPx,
      imageHeightPx: overview1Size.heightPx,
      report,
      fillerHeightTwips: fillerHeightsForImage(overview1Size.heightPx, true),
    }),
  )

  const overview2Size = scaleToMaxWidth(images.image2Jpg, MAP_W_MAX)
  children.push(new Paragraph({ children: [new PageBreak()] }))
  children.push(
    mapImagePageTable({
      // Target doc: second overview image page has NO heading row
      showTitleRow: false,
      jpg: images.image2Jpg,
      imageWidthPx: overview2Size.widthPx,
      imageHeightPx: overview2Size.heightPx,
      report,
      fillerHeightTwips: fillerHeightsForImage(overview2Size.heightPx, false),
    }),
  )

  // --- Disclaimer (mirror target doc: grey header row + bordered box + bullets) ---
  children.push(...spacer(1))
  children.push(disclaimerTable())

  // --- Witness Statement section (per wearer, 2 images each) ---
  report.matchedDeviceWearers.forEach(wearer => {
    children.push(new Paragraph({ children: [new PageBreak()] }))

    children.push(...witnessHeadingParas())
    children.push(...spacer(1))

    children.push(
      new Paragraph({ children: [new TextRun({ text: 'Statement of ', bold: true }), new TextRun({ text: '' })] }),
    )
    children.push(
      new Paragraph({ children: [new TextRun({ text: 'Occupation ', bold: true }), new TextRun({ text: '' })] }),
    )
    children.push(
      new Paragraph({ children: [new TextRun({ text: 'Age: ', bold: true }), new TextRun({ text: 'Over 18' })] }),
    )
    children.push(...spacer(1))

    children.push(
      new Paragraph({
        children: [
          new TextRun(
            'This statement consisting of ______ pages, signed by me, is true to the best of my knowledge and belief.',
          ),
        ],
      }),
    )

    children.push(...spacer(1))
    children.push(new Paragraph({ children: [new TextRun({ text: 'Signature:', bold: true })] }))
    children.push(...spacer(3))
    children.push(
      new Paragraph({ children: [new TextRun({ text: `Date: ${fmtDateGb(report.generatedAtIso)}`, bold: true })] }),
    )

    children.push(...spacer(1))
    children.push(
      new Paragraph({
        children: [
          new TextRun(
            'I am currently employed by the Ministry of Justice (MoJ) as MoJ EM Hub Manager within the Electronic Monitoring Acquisitive Crime Hub (EMAC Hub).',
          ),
        ],
      }),
    )

    children.push(...spacer(1))
    children.push(
      new Paragraph({
        children: [
          new TextRun(
            `On ${fmtDateGb(report.generatedAtIso)} I reviewed a qualified match in relation to crime data supplied by `,
          ),
          new TextRun({ text: '', bold: true }),
          new TextRun(
            '. As a result of this process, I can confirm the attached match in relation to an allegation of ',
          ),
          new TextRun({ text: report.crimeVersion.crimeType, bold: true }),
          new TextRun(' – Crime Reference No. '),
          new TextRun({ text: report.crimeVersion.crimeReference, bold: true }),
          new TextRun('.'),
        ],
      }),
    )

    children.push(...spacer(1))
    children.push(
      new Paragraph({
        children: [
          new TextRun(
            'I further produce the attached screen shot which documents the subject’s movements within proximity of this allegation of crime:',
          ),
        ],
      }),
    )

    children.push(...spacer(1))
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Exhibit EMAC/01 – Image of the tracks for ${wearer.name} on the data.`, bold: true }),
        ],
      }),
    )

    // Exhibit EMAC/01 - Image 1 (wearer-specific)
    const wearer1Jpg = images.wearerImage1JpgById[wearer.deviceWearerId]
    const wearer1Size = scaleToMaxWidth(wearer1Jpg, MAP_W_MAX)
    children.push(new Paragraph({ children: [new PageBreak()] }))
    children.push(
      mapImagePageTable({
        title: `Exhibit EMAC/01 - Image of maps and tracks for ${wearer.name}`,
        showTitleRow: true,
        jpg: wearer1Jpg,
        imageWidthPx: wearer1Size.widthPx,
        imageHeightPx: wearer1Size.heightPx,
        report,
        fillerHeightTwips: fillerHeightsForImage(wearer1Size.heightPx, true),
      }),
    )

    // Exhibit EMAC/01 - Image 2 (wearer-specific)
    const wearer2Jpg = images.wearerImage2JpgById[wearer.deviceWearerId]
    const wearer2Size = scaleToMaxWidth(wearer2Jpg, MAP_W_MAX)
    children.push(new Paragraph({ children: [new PageBreak()] }))
    children.push(
      mapImagePageTable({
        title: `Exhibit EMAC/01 - Image of maps and tracks for ${wearer.name}`,
        showTitleRow: true,
        jpg: wearer2Jpg,
        imageWidthPx: wearer2Size.widthPx,
        imageHeightPx: wearer2Size.heightPx,
        report,
        fillerHeightTwips: fillerHeightsForImage(wearer2Size.heightPx, true),
      }),
    )

    // Exhibit EMAC/03 table
    children.push(new Paragraph({ children: [new PageBreak()] }))
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Exhibit EMAC/03 – Table of ${wearer.name} locations within the vicinity`, bold: true }),
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
          run: { font: 'Arial', size: 22 }, // 11pt
          paragraph: { spacing: { after: 120 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: A4_WIDTH_TWIPS, height: A4_HEIGHT_TWIPS },
            margin: { top: MARGIN_TWIPS, bottom: MARGIN_TWIPS, left: MARGIN_TWIPS, right: MARGIN_TWIPS },
          },
        },
        children,
      },
    ],
  })

  return Packer.toBuffer(doc)
}
