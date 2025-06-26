import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import MapComponent from './map'

govukFrontend.initAll()
mojFrontend.initAll()

const $maps = document.querySelectorAll('[data-module="app-map"]')

// eslint-disable-next-line consistent-return
function nodeListForEach(nodes, callback) {
  if (window.NodeList.prototype.forEach) {
    return nodes.forEach(callback)
  }

  for (let i = 0; i < nodes.length; i += 1) {
    callback.call(window, nodes[i], i, nodes)
  }
}

nodeListForEach($maps, $map => {
  new MapComponent($map).init()
})

function updateInputs(radio) {
  document.getElementById('subjectOrderStartDate').value = radio.dataset.start
  document.getElementById('subjectOrderEndDate').value = radio.dataset.end
  document.getElementById('continue').disabled = false
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[type="radio"][name="personId"]').forEach(radio => {
    radio.addEventListener('change', () => updateInputs(radio))
  })
})
