import { readFileSync } from 'fs'
import path from 'path'
import { Paragraph, Table, TableCell, TableLayoutType, TextRun } from 'docx'
import {
  defaultCellProps,
  cellParagraph,
  fullWidthDxa,
  noBottomBorder,
  rowNoSplitAcrossPages,
  sectionHeaderShading,
  strongBlackBorders,
} from '../docxComponents'
import { USABLE_PAGE_WIDTH_WORD_UNITS } from '../constants'
import PROXIMITY_ALERT_REPORT_CONTENT from '../../../../constants/proximityAlert/reportContent'
import { imageParagraph } from '../imageHelpers'

// The map key image is a static asset, so can be read and processed once at module load time.
const EXHIBIT_MAP_KEY_IMAGE_PATH = path.resolve(
  process.cwd(),
  'dist/assets/images/proximityAlert/exhibit-emac-02-map-key.jpg',
)

const exhibitMapKeySection = (): Table => {
  const borders = strongBlackBorders()
  const exhibitMapKeyImage = readFileSync(EXHIBIT_MAP_KEY_IMAGE_PATH)
  const { exhibitMapKey } = PROXIMITY_ALERT_REPORT_CONTENT

  return new Table({
    width: fullWidthDxa(),
    columnWidths: Array(7).fill(Math.round(USABLE_PAGE_WIDTH_WORD_UNITS / 7)),
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      rowNoSplitAcrossPages([
        new TableCell({
          ...defaultCellProps(),
          borders,
          shading: sectionHeaderShading(),
          columnSpan: 7,
          children: [
            cellParagraph(exhibitMapKey.heading, {
              bold: true,
              alignment: 'center',
            }),
          ],
        }),
      ]),
      rowNoSplitAcrossPages([
        new TableCell({
          ...defaultCellProps(),
          borders: noBottomBorder(),
          columnSpan: 7,
          children: [
            new Paragraph({
              children: [
                new TextRun(`${exhibitMapKey.intro} `),
                new TextRun({
                  text: exhibitMapKey.note,
                  italics: true,
                }),
              ],
              spacing: { before: 0, after: 200 },
            }),
            imageParagraph(exhibitMapKeyImage),
          ],
        }),
      ]),
    ],
  })
}

export default exhibitMapKeySection
