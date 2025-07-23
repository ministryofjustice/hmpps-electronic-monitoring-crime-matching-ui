/**
 * Formats a value for display by appending a unit only if the value is not null, undefined, or empty.
 * If the value is missing, it returns the provided fallback (defaults to an empty string).
 *
 * @param value - The value to format (string or number)
 * @param unit - Optional string to append as a unit (e.g., "km/h", "m", "°")
 * @param fallback - Optional fallback string to return when value is missing (default: '')
 * @returns A formatted string like "42 km/h", or the fallback value
 */
function formatDisplayValue(value: string | number | null | undefined, unit: string = '', fallback: string = '') {
  if (value === null || value === undefined || value === '') {
    return fallback
  }
  return `${value}${unit}`
}

/**
 * Converts an angle in radians to whole degrees, ensuring the result is between 0 and 360.
 *
 * @param radians - The angle in radians (can be negative, null, or undefined)
 * @returns The angle in whole degrees between 0 and 360, or undefined if input is null/undefined
 */
function convertRadiansToDegrees(radians: number | null | undefined) {
  if (radians === null || radians === undefined) return undefined

  const degrees = (radians * 180) / Math.PI
  return Math.round((degrees + 360) % 360)
}

const queryElement = <K extends keyof HTMLElementTagNameMap>(
  parent: Document | Element,
  selector: K,
  expectedConstructor?: { new (): HTMLElementTagNameMap[K] },
): HTMLElementTagNameMap[K] => {
  const el = parent.querySelector(selector)

  if (!el) {
    throw new Error(`Selector ${selector} did not match any elements.`)
  }

  if (expectedConstructor && !(el instanceof expectedConstructor)) {
    throw new Error(`Element matched by "${selector}" is not an instance of ${expectedConstructor.name}.`)
  }

  return el as HTMLElementTagNameMap[K]
}

export { convertRadiansToDegrees, formatDisplayValue, queryElement }
