import {
  AlignmentType,
  BorderStyle,
  HeightRule,
  Paragraph,
  ShadingType,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx'
import { CELL_PADDING_WORD_UNITS, HEADER_CELL_PADDING_WORD_UNITS } from './constants'

export type AlignmentTypeValue = (typeof AlignmentType)[keyof typeof AlignmentType]
export type HeightRuleValue = (typeof HeightRule)[keyof typeof HeightRule]

export const cellParagraph = (
  text: string,
  opts?: {
    bold?: boolean
    underline?: boolean
    alignment?: AlignmentTypeValue
    spacingAfter?: number
    spacingBefore?: number
    color?: string
    size?: number
  },
): Paragraph =>
  new Paragraph({
    children: [
      new TextRun({
        text,
        bold: opts?.bold,
        underline: opts?.underline ? {} : undefined,
        color: opts?.color,
        size: opts?.size,
      }),
    ],
    alignment: opts?.alignment,
    spacing: {
      before: opts?.spacingBefore ?? 0,
      after: opts?.spacingAfter ?? 0,
    },
  })

export const paragraph = (
  text: string,
  opts?: { bold?: boolean; alignment?: AlignmentTypeValue; spacingAfter?: number },
): Paragraph =>
  new Paragraph({
    children: [new TextRun({ text, bold: opts?.bold })],
    alignment: opts?.alignment,
    spacing: { before: 0, after: opts?.spacingAfter ?? 120 },
  })

export const bulletParagraph = (text: string, opts?: { spacingBefore?: number; spacingAfter?: number }): Paragraph =>
  new Paragraph({
    children: [new TextRun({ text })],
    bullet: { level: 0 },
    spacing: {
      before: opts?.spacingBefore ?? 0,
      after: opts?.spacingAfter ?? 0,
    },
  })

export const spacer = (lines = 1): Paragraph[] => Array.from({ length: Math.max(0, lines) }, () => new Paragraph(''))

// Target borders: prominent black.
export const strongBlackBorders = () =>
  ({
    top: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    insideVertical: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
  }) as const

export const noBorder = () => ({ style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }) as const

export const noBottomBorder = () => ({
  ...strongBlackBorders(),
  bottom: noBorder(),
})

export const sectionHeaderShading = () => ({ type: ShadingType.CLEAR, color: 'auto', fill: 'E6E6E6' }) as const

export const sectionHeaderShadingGreen = () => {
  return { type: ShadingType.CLEAR, color: 'auto', fill: '9ae098' } as const
}

export const defaultCellProps = () =>
  ({
    margins: CELL_PADDING_WORD_UNITS,
    verticalAlign: VerticalAlign.TOP,
  }) as const

export const defaultHeaderCellProps = () =>
  ({
    margins: HEADER_CELL_PADDING_WORD_UNITS,
    verticalAlign: VerticalAlign.CENTER,
  }) as const

// Rows that shouldn't split across pages.
export const rowNoSplitAcrossPages = (
  children: TableCell[],
  opts?: { heightWordUnits?: number; heightRule?: HeightRuleValue },
): TableRow =>
  new TableRow({
    cantSplit: true,
    height: opts?.heightWordUnits
      ? {
          value: opts.heightWordUnits,
          rule: opts.heightRule ?? HeightRule.ATLEAST,
        }
      : undefined,
    children,
  })

export const sectionHeaderRow = (
  text: string,
  opts?: { columnSpan?: number; center?: boolean; useGreen?: boolean },
): TableRow => {
  const borders = strongBlackBorders()

  return rowNoSplitAcrossPages([
    new TableCell({
      ...defaultCellProps(),
      borders,
      shading: opts?.useGreen ? sectionHeaderShadingGreen() : sectionHeaderShading(),
      columnSpan: opts?.columnSpan ?? 2,
      children: [cellParagraph(text, { bold: true, alignment: opts?.center ? AlignmentType.CENTER : undefined })],
    }),
  ])
}

export const labelValueRow = (
  key: string,
  value: string,
  opts?: {
    keyWidthPct?: number
    valueWidthPct?: number
    valueAlign?: AlignmentTypeValue
    keyBold?: boolean
    valueBold?: boolean
  },
): TableRow => {
  const borders = strongBlackBorders()

  const keyWidthPct = opts?.keyWidthPct ?? 33
  const valueWidthPct = opts?.valueWidthPct ?? 67

  const valueLines = String(value ?? '').split('\n')
  const valueParas =
    valueLines.length === 1 && valueLines[0] === ''
      ? [cellParagraph('', { alignment: opts?.valueAlign, bold: opts?.valueBold })]
      : valueLines.map(line => cellParagraph(line, { alignment: opts?.valueAlign, bold: opts?.valueBold }))

  return rowNoSplitAcrossPages([
    new TableCell({
      ...defaultCellProps(),
      borders,
      width: { size: keyWidthPct, type: WidthType.PERCENTAGE },
      children: [cellParagraph(key, { bold: opts?.keyBold ?? false })],
    }),
    new TableCell({
      ...defaultCellProps(),
      borders,
      width: { size: valueWidthPct, type: WidthType.PERCENTAGE },
      children: valueParas,
    }),
  ])
}
