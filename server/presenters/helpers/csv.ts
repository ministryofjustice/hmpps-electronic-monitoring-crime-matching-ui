/**
 * Escapes a single value for safe CSV output.
 * - Wraps value in double quotes
 * - Escapes internal quotes by doubling them
 */
const escapeCsvValue = (value: string): string => {
  return `"${value.replace(/"/g, '""')}"`
}

const generateCsv = (data: Array<Array<string>>): string => {
  return data.map(row => row.map(escapeCsvValue).join(',')).join('\n')
}

export default generateCsv
