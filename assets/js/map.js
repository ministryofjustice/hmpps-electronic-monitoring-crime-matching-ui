import axios from 'axios'
import { Map, View } from 'ol'
import TileState from 'ol/TileState'
import { buffer, boundingExtent } from 'ol/extent'
import { GeoJSON } from 'ol/format'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import LayerGroup from 'ol/layer/Group'
import { fromLonLat, transformExtent } from 'ol/proj'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style'
import { Cluster } from 'ol/source'
import { generateArrowFeatures, generateConfidenceCircleFeatures } from './featureHelpers'
import createOverlay from './overlayHelpers'

function MapComponent($module) {
  this.cacheEls($module)

  this.defaults = {}

  this.settings = this.defaults
}

MapComponent.prototype = {
  init() {
    this.getToken()
      .then(token => {
        this.accessToken = token
        this.render()
      })
      .catch(error => this.renderError(error))
    this.createControls()
  },

  cacheEls($module) {
    this.$map = null
    this.$module = $module
    this.$viewport = $module.querySelector('.app-map__viewport')

    this.points = JSON.parse($module.getAttribute('data-points'))
    this.lines = JSON.parse($module.getAttribute('data-lines'))
    this.apiKey = $module.getAttribute('data-api-key')
    this.tileUrl = $module.getAttribute('data-tile-url')
    this.showOverlay = $module.getAttribute('data-show-overlay') === 'true'

    this.lineSource = new VectorSource()
    this.arrowSource = new VectorSource()
    this.pointSource = new VectorSource()
    this.confidenceSource = new VectorSource()
  },

  render() {
    this.renderMap()
    this.appendPoints()
    this.appendLines()
    this.appendConfidenceCircles()
  },

  createControls() {
    this.pointsToggle = document.querySelector('#locations')
    this.confidenceToggle = document.querySelector('#confidence')
    this.linesToggle = document.querySelector('#tracks')

    if (this.pointsToggle !== null) {
      this.pointsToggle.onchange = () => this.togglePoints()
    }

    if (this.confidenceToggle !== null) {
      this.confidenceToggle.onchange = () => this.toggleConfidence()
    }

    if (this.linesToggle !== null) {
      this.linesToggle.onchange = () => this.toggleLines()
    }
  },

  renderError() {
    this.$viewport.innerHTML = '<p class="app-map__error">The map could not be loaded.</p>'
  },

  togglePoints() {
    const visible = !this.$pointsLayer.getVisible()
    this.$pointsLayer.setVisible(visible)

    // Hide overlay if points are being hidden
    if (!visible && this.overlay) {
      this.overlay.setPosition(undefined)
    }
  },

  toggleConfidence() {
    this.$confidenceLayer.setVisible(!this.$confidenceLayer.getVisible())
  },

  toggleLines() {
    this.$linesLayer.setVisible(!this.$linesLayer.getVisible())
  },

  ordnanceTileLoader(tile, src) {
    const config = {
      headers: { Authorization: `Bearer ${this.accessToken}` },
      responseType: 'blob',
    }

    axios
      .get(src, config)
      .then(response => {
        if (response.data !== undefined) {
          // eslint-disable-next-line no-param-reassign
          tile.getImage().src = URL.createObjectURL(response.data)
        } else {
          tile.setState(TileState.ERROR)
        }
      })
      // eslint-disable-next-line no-console
      .catch(e => console.log(e))
  },

  getToken() {
    return axios.get('/map/token').then(response => response.data.access_token)
  },

  renderMap() {
    this.$pointsLayer = new LayerGroup({
      title: 'Cluster',
      layers: [
        new VectorLayer({
          source: new Cluster({
            distance: 30,
            source: this.pointSource,
          }),
          style: this.clusterStyle.bind(this),
        }),
      ],
    })

    this.$confidenceLayer = new LayerGroup({
      title: 'Confidence',
      visible: false,
      layers: [
        new VectorLayer({
          source: this.confidenceSource,
          style: this.confidenceCircleStyle.bind(),
        }),
      ],
    })

    this.$linesLayer = new LayerGroup({
      title: 'Lines',
      visible: false,
      layers: [
        new VectorLayer({
          source: this.lineSource,
          style: this.lineStyle.bind(this),
        }),
        new VectorLayer({
          source: this.arrowSource,
        }),
      ],
    })

    this.$map = new Map({
      target: 'app-map',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: this.tileUrl,
            tileLoadFunction: this.ordnanceTileLoader.bind(this),
          }),
        }),
        this.$linesLayer,
        this.$pointsLayer,
        this.$confidenceLayer,
      ],
      view: new View({
        projection: 'EPSG:3857',
        extent: transformExtent([-10.76418, 49.528423, 1.9134116, 61.331151], 'EPSG:4326', 'EPSG:3857'),
        minZoom: 7,
        maxZoom: 20,
        center: fromLonLat([-3.541809, 50.727589]),
        zoom: 13,
      }),
    })

    this.$map.on('pointermove', evt => {
      this.pointerMoveHandler(evt)
    })

    this.$map.getView().on('change:resolution', () => {
      this.updateArrows(this.$map.getView().getZoom())
    })

    if (this.showOverlay) {
      this.overlay = createOverlay(this.$module, this.$map)
    }

    this.focusCluster()
  },

  focusCluster() {
    this.$map.on('click', e => {
      const features = this.$map.getFeaturesAtPixel(e.pixel)
      const extent = boundingExtent(features.map(r => r.getGeometry().getCoordinates()))
      this.$map.getView().fit(extent, {
        duration: 500,
        padding: [50, 50, 50, 50],
        maxZoom: 16,
      })
    })
  },

  updateArrows(mapZoom) {
    this.arrowSource.clear()
    const arrowFeatures = generateArrowFeatures(mapZoom, this.lineSource)
    this.arrowSource.addFeatures(arrowFeatures)
  },

  appendConfidenceCircles() {
    const confidenceFeatures = generateConfidenceCircleFeatures(this.pointSource)
    this.confidenceSource.addFeatures(confidenceFeatures)
  },

  appendPoints() {
    const format = new GeoJSON()
    const features = format.readFeatures(
      {
        type: 'FeatureCollection',
        features: this.points,
      },
      {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      },
    )

    for (let i = 0; i < features.length; i += 1) {
      features[i].set('type', 'location-point')
      this.pointSource.addFeature(features[i])
    }

    const allExtent = buffer(boundingExtent(features.map(feature => feature.getGeometry().getCoordinates())), 100)

    // centre map on points
    this.$map.getView().fit(allExtent, {
      size: this.$map.getSize(),
      padding: [30, 30, 30, 30],
      maxZoom: 16,
    })
  },

  appendLines() {
    const format = new GeoJSON()
    const features = format.readFeatures(
      {
        type: 'FeatureCollection',
        features: this.lines,
      },
      {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      },
    )

    for (let i = 0; i < features.length; i += 1) {
      this.lineSource.addFeature(features[i])
    }

    this.updateArrows(this.$map.getView().getZoom())
  },

  lineStyle() {
    return new Style({
      stroke: new Stroke({
        width: 2,
        color: 'black',
      }),
    })
  },

  confidenceCircleStyle() {
    return new Style({
      stroke: new Stroke({
        color: 'orange',
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(255, 165, 0, 0.1)',
      }),
    })
  },

  // TODO Remove or update
  textStyle(feature) {
    return new Text({
      textAlign: 'left',
      textBaseline: 'middle',
      font: 'bold 12px "Inter", system-ui, sans-serif',
      text: feature.get('name'),
      fill: new Fill({ color: 'black' }),
      stroke: new Stroke({ color: 'white', width: 2 }),
      offsetX: 12,
      offsetY: 1,
    })
  },

  // TODO Pre merge increase the values
  // move to helper file?
  clusterStyle(feature) {
    let style
    const length = feature.get('features').length.toString()
    let text = new Text({
      text: length,
      fill: new Fill({
        color: '#fff',
      }),
    })

    if (length > 4) {
      style = clusterStyles.large
    } else if (length > 2) {
      style = clusterStyles.medium
    } else if (length > 1) {
      style = clusterStyles.small
    } else {
      style = clusterStyles.default
      text = null
    }

    return new Style({
      image: style,
      text,
    })
  },

  pointerMoveHandler(evt) {
    const { pixel } = evt
    let hovering = false

    this.$map.forEachFeatureAtPixel(pixel, feature => {
      const features = feature.get('features')
      if (features.length) {
        if (features.some(f => f.get('type') === 'location-point')) {
          hovering = true
          return true
        }
        return false
        // TODO Unsure if below if is possible in current setup, ie will features always be present due to cluster setup?
      }
      if (feature.get('type') === 'location-point') {
        hovering = true
        return true
      }
      return false
    })

    this.$map.getTargetElement().style.cursor = hovering ? 'pointer' : ''
  },
}

const clusterStyles = {
  large: new CircleStyle({
    radius: 10,
    fill: new Fill({ color: 'rgba(255, 0, 0, 0.71)' }),
    stroke: new Stroke({ color: 'rgba(255, 0, 0, 0.34)', width: 7 }),
  }),
  medium: new CircleStyle({
    radius: 10,
    fill: new Fill({ color: 'rgba(255, 166, 0, 0.77)' }),
    stroke: new Stroke({ color: 'rgba(255, 166, 0, 0.32)', width: 7 }),
  }),
  small: new CircleStyle({
    radius: 10,
    fill: new Fill({ color: 'rgba(16, 196, 3, 0.8)' }),
    stroke: new Stroke({ color: 'rgba(14, 183, 1, 0.32)', width: 7 }),
  }),
  default: new CircleStyle({
    radius: 6,
    fill: new Fill({ color: 'red' }),
    stroke: new Stroke({ color: '#505a5f', width: 1 }),
  }),
}

export default MapComponent
