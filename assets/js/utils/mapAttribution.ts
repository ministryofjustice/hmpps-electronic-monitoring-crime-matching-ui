import { EmMap } from '@ministryofjustice/hmpps-electronic-monitoring-components/map'
import { Control } from 'ol/control'

// Removes OpenLayers' built-in Attribution control. The official OS API branding bar
// (logo + copyright statement + terms/error-reporting links) is rendered server-side
// as part of the map template instead - see server/views/components/map/template.njk
// and https://docs.os.uk/os-apis/core-concepts/os-api-branding. Keeping OL's own
// Attribution control around would duplicate/clash with that branding bar.
//
// Note: the components package ships its own bundled copy of OpenLayers, so its
// Attribution control is a different class instance to any imported from our own
// bundle - `instanceof` checks against it will always be false. Match on the
// control's DOM element class name (hardcoded by OpenLayers as 'ol-attribution')
// instead. `element` is a protected member of ol's Control class, so it's accessed
// via a cast here - this is safe as it's a plain runtime property, not a type hazard.
const getControlElement = (control: Control): HTMLElement | undefined =>
  (control as unknown as { element?: HTMLElement }).element

const setMapAttribution = (emMap: EmMap) => {
  const map = emMap.olMapInstance
  if (!map) return

  map
    .getControls()
    .getArray()
    .filter(control => getControlElement(control)?.classList.contains('ol-attribution'))
    .forEach(control => map.removeControl(control))
}

export default setMapAttribution
