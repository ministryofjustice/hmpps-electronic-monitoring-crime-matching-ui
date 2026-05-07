import { AlignmentType, ImageRun, Paragraph } from 'docx'
import { imageSize } from 'image-size'
import { MAX_MAP_IMAGE_WIDTH_PX, WORD_UNITS_PER_PX } from './constants'

export const pxToWordUnits = (px: number): number => Math.round(px * WORD_UNITS_PER_PX)

// Scales an image buffer proportionally to fit within the maximum page width.
export const scaledImageSize = (
  jpg: Buffer,
  maxWidthPx = MAX_MAP_IMAGE_WIDTH_PX,
): { width: number; height: number } => {
  // image-size library can read dimensions from a JPEG buffer without fully decoding the image,
  // so is ideal for this purpose.
  const dimensions = imageSize(jpg)

  if (!dimensions.width || !dimensions.height) {
    throw new Error('Could not read image dimensions')
  }

  const scale = Math.min(1, maxWidthPx / dimensions.width)

  return {
    width: Math.round(dimensions.width * scale),
    height: Math.round(dimensions.height * scale),
  }
}

// Creates a centred DOCX paragraph containing a scaled image.
export const imageParagraph = (jpg: Buffer): Paragraph => {
  const size = scaledImageSize(jpg)

  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    indent: { left: 0, right: 0 },
    children: [
      new ImageRun({
        data: jpg,
        type: 'jpg',
        transformation: size,
      }),
    ],
  })
}
