import { readFileSync } from 'fs'
import path from 'path'
import { Paragraph, Table, TableCell, TableLayoutType, TextRun, WidthType } from 'docx'
import {
  defaultCellProps,
  cellParagraph,
  noBottomBorder,
  rowNoSplitAcrossPages,
  sectionHeaderShading,
  strongBlackBorders,
} from '../docxComponents'
import { imageParagraph } from '../imageHelpers'

// The map key image is a static asset, so can be read and processed once at module load time.
const EXHIBIT_MAP_KEY_IMAGE_PATH = path.join(__dirname, '../../assets/exhibit-emac-02-map-key.jpg')

const exhibitMapKeySection = (): Table => {
  const borders = strongBlackBorders()
  const exhibitMapKeyImage = readFileSync(EXHIBIT_MAP_KEY_IMAGE_PATH)

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
          columnSpan: 7,
          children: [
            cellParagraph('Exhibit EMAC/02 Key for interpreting symbols on the map', {
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
                new TextRun(
                  'The key below explains how to interpret the visual elements that appear in proximity alert images. ',
                ),
                new TextRun({
                  text: 'Note: Not all visual elements demonstrated will be displayed in the proximity alert images; this will be determined as necessary.',
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
