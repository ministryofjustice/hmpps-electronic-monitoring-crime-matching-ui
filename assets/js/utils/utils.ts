/**
 * Formats a value for display by appending a unit only if the value is not null, undefined, or empty.
 * If the value is missing, it returns the provided fallback (defaults to an empty string).
 *
 * @param value - The value to format (string or number)
 * @param unit - Optional string to append as a unit (e.g., "km/h", "m", "°")
 * @param fallback - Optional fallback string to return when value is missing (default: '')
 * @returns A formatted string like "42 km/h", or the fallback value
 */

export default function queryElement<T extends Element>(
  parent: Document | Element,
  selector: string,
  expectedConstructor?: { new (): T },
): T {
  const el = parent.querySelector(selector)

  if (!el) {
    throw new Error(`Selector "${selector}" did not match any elements.`)
  }

  if (expectedConstructor && !(el instanceof expectedConstructor)) {
    throw new Error(`Element matched by "${selector}" is not an instance of ${expectedConstructor.name}.`)
  }

  return el as T
}
