import { AlignmentType, ImageRun, Paragraph } from 'docx'
import { imageSize } from 'image-size'
import { MAX_MAP_IMAGE_WIDTH_PX, WORD_UNITS_PER_PX } from './constants'

export const pxToWordUnits = (px: number): number => Math.round(px * WORD_UNITS_PER_PX)

// Scales an image buffer proportionally to fit within the maximum page width, and optionally
// a maximum height, so a portrait image can't grow tall enough to overflow onto a new page.
export const scaledImageSize = (
  jpg: Buffer,
  maxWidthPx = MAX_MAP_IMAGE_WIDTH_PX,
  maxHeightPx?: number,
): { width: number; height: number } => {
  // image-size library can read dimensions from a JPEG buffer without fully decoding the image,
  // so is ideal for this purpose.
  const dimensions = imageSize(jpg)

  if (!dimensions.width || !dimensions.height) {
    throw new Error('Could not read image dimensions')
  }

  let scale = Math.min(1, maxWidthPx / dimensions.width)
  if (maxHeightPx !== undefined) {
    scale = Math.min(scale, maxHeightPx / dimensions.height)
  }

  return {
    width: Math.round(dimensions.width * scale),
    height: Math.round(dimensions.height * scale),
  }
}

// Creates a centred DOCX paragraph containing a scaled image. `indent` defaults to no indent
// (i.e. the image sits within whatever margins its containing cell already applies).
export const imageParagraph = (
  jpg: Buffer,
  indent: { left: number; right: number } = { left: 0, right: 0 },
  maxHeightPx?: number,
): Paragraph => {
  const size = scaledImageSize(jpg, MAX_MAP_IMAGE_WIDTH_PX, maxHeightPx)

  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    indent,
    children: [
      new ImageRun({
        data: jpg,
        type: 'jpg',
        transformation: size,
      }),
    ],
  })
}
