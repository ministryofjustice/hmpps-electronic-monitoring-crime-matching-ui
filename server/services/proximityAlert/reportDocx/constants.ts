// DOCX library uses twips (1/1440 inch). A4 size and margins are defined in these units.
// Values below are standard A4 dimensions converted to twips.
export const A4_WIDTH_WORD_UNITS = 11906
export const A4_HEIGHT_WORD_UNITS = 16838
export const PAGE_MARGIN_WORD_UNITS = 720 // 0.5 inch margin

// DOCX library ImageRun transformation sizes are in pixels,
// so we need to convert the maximum page width from word units to pixels to ensure images
// fit within the page when rendered.
export const WORD_UNITS_PER_PX = 15
export const USABLE_PAGE_WIDTH_WORD_UNITS = A4_WIDTH_WORD_UNITS - PAGE_MARGIN_WORD_UNITS - PAGE_MARGIN_WORD_UNITS
export const USABLE_PAGE_HEIGHT_WORD_UNITS = A4_HEIGHT_WORD_UNITS - PAGE_MARGIN_WORD_UNITS - PAGE_MARGIN_WORD_UNITS
export const MAP_IMAGE_WIDTH_SAFETY_MARGIN_PX = 8
export const MAX_MAP_IMAGE_WIDTH_PX =
  Math.floor(USABLE_PAGE_WIDTH_WORD_UNITS / WORD_UNITS_PER_PX) - MAP_IMAGE_WIDTH_SAFETY_MARGIN_PX

// Cell padding (margins) in Word units
export const CELL_PADDING_WORD_UNITS = {
  top: 40,
  bottom: 40,
  left: 120,
  right: 120,
} as const

export const HEADER_CELL_PADDING_WORD_UNITS = {
  top: 20,
  bottom: 20,
  left: 80,
  right: 80,
} as const
