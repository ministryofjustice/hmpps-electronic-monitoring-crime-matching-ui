/**
 * Formats a value for display by appending a unit only if the value is not null, undefined, or empty.
 * If the value is missing, it returns the provided fallback (defaults to an empty string).
 *
 * @param value - The value to format (string or number)
 * @param unit - Optional string to append as a unit (e.g., "km/h", "m", "°")
 * @param fallback - Optional fallback string to return when value is missing (default: '')
 * @returns A formatted string like "42 km/h", or the fallback value
 */
function formatDisplayValue(value, unit = '', fallback = '') {
  if (value === null || value === undefined || value === '') {
    return fallback
  }
  return `${value}${unit}`
}

export default formatDisplayValue
