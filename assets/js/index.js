import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import MapComponent from './map'

govukFrontend.initAll()
mojFrontend.initAll()

const $map = document.querySelectorAll('[data-module="app-map"]')

function nodeListForEach(nodes, callback) {
  if (window.NodeList.prototype.forEach) {
    return nodes.forEach(callback)
  }

  for (let i = 0; i < nodes.length; i++) {
    callback.call(window, nodes[i], i, nodes)
  }
}

nodeListForEach($map, function ($map) {
  new MapComponent($map).init()
})
