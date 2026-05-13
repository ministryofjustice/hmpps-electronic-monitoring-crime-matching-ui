import { Paragraph, Table, TableCell, TableLayoutType, TextRun, WidthType } from 'docx'
import {
  bulletParagraph,
  defaultCellProps,
  cellParagraph,
  rowNoSplitAcrossPages,
  sectionHeaderShading,
  strongBlackBorders,
} from '../docxComponents'

const disclaimerTable = (): Table => {
  const borders = strongBlackBorders()

  const disclaimerParagraph1 =
    "The data disclosed in this report does not confirm that the tag wearer perpetrated or witnessed a crime. In addition, it does not rule out other EM tag wearers being in the vicinity of the crime during the window of opportunity. The results of this process are also limited to persons tagged as part of the MoJ's Acquisitive Crime Project and only where there has been an ability to monitor the equipment during the window of opportunity of the crime."
  const disclaimerParagraph2 = 'Examples of an inability to monitor a person include:'
  const bullet1 = 'Where the person has failed to charge the EM tag,'
  const bullet2 = 'Where the tag has been removed from the person but is still able to transmit its location,'
  const bullet3 = 'Where the equipment has failed due to a technical fault.'
  const disclaimerParagraph3 =
    'The technology used (radio frequency transmissions; GPS location monitoring and Location Based Services) has been proven to be reliable over many years. The monitoring equipment is extremely robust and reliable and meets the stringent specifications laid down by the Ministry of Justice. The monitoring equipment is also rigorously tested and audited by EMS, an independent body, and the Home Office Scientific Branch.'
  const osCopyrightText = 'All maps included in this document are subject to the following OS copyright (AC0000850671)'

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
          children: [cellParagraph('Disclaimer', { bold: true })],
        }),
      ]),
      rowNoSplitAcrossPages([
        new TableCell({
          ...defaultCellProps(),
          borders,
          children: [
            new Paragraph({ children: [new TextRun(disclaimerParagraph1)], spacing: { before: 0, after: 200 } }),
            new Paragraph({ children: [new TextRun(disclaimerParagraph2)], spacing: { before: 0, after: 120 } }),
            bulletParagraph(bullet1, { spacingAfter: 60 }),
            bulletParagraph(bullet2, { spacingAfter: 60 }),
            bulletParagraph(bullet3, { spacingAfter: 200 }),
            new Paragraph({ children: [new TextRun(disclaimerParagraph3)], spacing: { before: 0, after: 0 } }),
            new Paragraph({ children: [new TextRun(osCopyrightText)], spacing: { before: 200, after: 0 } }),
          ],
        }),
      ]),
    ],
  })
}

export default disclaimerTable
