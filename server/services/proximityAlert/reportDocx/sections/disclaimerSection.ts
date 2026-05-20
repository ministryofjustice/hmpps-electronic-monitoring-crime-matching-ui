import { Paragraph, Table, TableCell, TableLayoutType, TextRun, WidthType } from 'docx'
import {
  bulletParagraph,
  defaultCellProps,
  cellParagraph,
  rowNoSplitAcrossPages,
  sectionHeaderShading,
  strongBlackBorders,
} from '../docxComponents'
import PROXIMITY_ALERT_REPORT_CONTENT from '../../../../constants/proximityAlert/reportContent'

const disclaimerTable = (): Table => {
  const borders = strongBlackBorders()
  const { disclaimer } = PROXIMITY_ALERT_REPORT_CONTENT

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
          children: [cellParagraph(disclaimer.heading, { bold: true })],
        }),
      ]),
      rowNoSplitAcrossPages([
        new TableCell({
          ...defaultCellProps(),
          borders,
          children: [
            new Paragraph({ children: [new TextRun(disclaimer.paragraph1)], spacing: { before: 0, after: 200 } }),
            new Paragraph({ children: [new TextRun(disclaimer.paragraph2)], spacing: { before: 0, after: 120 } }),
            bulletParagraph(disclaimer.bullets[0], { spacingAfter: 60 }),
            bulletParagraph(disclaimer.bullets[1], { spacingAfter: 60 }),
            bulletParagraph(disclaimer.bullets[2], { spacingAfter: 200 }),
            new Paragraph({ children: [new TextRun(disclaimer.paragraph3)], spacing: { before: 0, after: 0 } }),
            new Paragraph({ children: [new TextRun(disclaimer.osCopyrightText)], spacing: { before: 200, after: 0 } }),
          ],
        }),
      ]),
    ],
  })
}

export default disclaimerTable
