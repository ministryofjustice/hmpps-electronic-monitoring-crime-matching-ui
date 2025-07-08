export const isTestEnv = typeof window !== 'undefined' && !!window.Cypress

// Expose the map instance for Cypress tests only
export default function exposeMapToTest($module, mapInstance) {
  if (!isTestEnv) return

  if ($module) {
    // eslint-disable-next-line no-param-reassign
    $module.olMapForCypress = mapInstance
    $module.dispatchEvent(new CustomEvent('olMap:ready', { detail: { mapInstance } }))
  }
}
