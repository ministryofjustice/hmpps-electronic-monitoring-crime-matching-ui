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

function MapComponent($module) {
  this.cacheEls($module)

  this.defaults = {}

  this.settings = this.defaults
}

MapComponent.prototype = {
  init() {
    this._getToken()
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

    this.points = JSON.parse($module.getAttribute('data-points'))
    this.lines = JSON.parse($module.getAttribute('data-lines'))
    this.apiKey = $module.getAttribute('data-api-key')
    this.tileUrl = $module.getAttribute('data-tile-url')

    this.lineSource = new VectorSource()
    this.pointSource = new VectorSource()
  },

  render() {
    this._renderMap()
    this._appendPoints()
    this._appendLines()
  },

  createControls() {
    this.pointsToggle = document.querySelector('#locations')
    this.linesToggle = document.querySelector('#tracks')

    this.pointsToggle.onchange = () => this.togglePoints()
    this.linesToggle.onchange = () => this.toggleLines()
  },

  renderError(e) {
    this.$module.innerHTML = '<p class="app-map__error">The map could not be loaded.</p>'
  },

  togglePoints(e) {
    this.$pointsLayer.setVisible(!this.$pointsLayer.getVisible())
  },

  toggleLines(e) {
    this.$linesLayer.setVisible(!this.$linesLayer.getVisible())
  },

  _ordnanceTileLoader(tile, src) {
    const config = {
      headers: { Authorization: `Bearer ${this.accessToken}` },
      responseType: 'blob',
    }

    axios
      .get(src, config)
      .then(response => {
        if (response.data !== undefined) {
          tile.getImage().src = URL.createObjectURL(response.data)
        } else {
          tile.setState(TileState.ERROR)
        }
      })
      .catch(e => console.log(e))
  },

  _getToken() {
    return axios.get('/map/token').then(response => response.data.access_token)
  },

  _renderMap() {
    this.$pointsLayer = new LayerGroup({
      title: 'Points',
      layers: [
        new VectorLayer({
          source: this.pointSource,
          style: this._pointStyle.bind(this),
        }),
      ],
    })

    this.$linesLayer = new LayerGroup({
      title: 'Lines',
      layers: [
        new VectorLayer({
          source: this.lineSource,
          style: this._lineStyle.bind(this),
        }),
      ],
    })

    this.$map = new Map({
      target: 'app-map',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: this.tileUrl,
            tileLoadFunction: this._ordnanceTileLoader.bind(this),
          }),
        }),
        this.$linesLayer,
        this.$pointsLayer,
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
  },

  _appendPoints() {
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

    for (let i = 0; i < features.length; i++) {
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

  _appendLines() {
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

    for (let i = 0; i < features.length; i++) {
      this.lineSource.addFeature(features[i])
    }
  },

  _lineStyle() {
    return new Style({
      stroke: new Stroke({
        width: 2,
        color: 'black',
      }),
    })
  },

  _textStyle(feature) {
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

  _pointStyle(feature) {
    let fill
    let stroke

    if (feature.get('isOrigin')) {
      fill = new Fill({ color: 'red' })
      stroke = new Stroke({ color: '#00703c', width: 2 })
    } else if (feature.get('isFinalDestination')) {
      fill = new Fill({ color: 'red' })
      stroke = new Stroke({ color: '#f47738', width: 2 })
    } else {
      fill = new Fill({ color: 'red' })
      stroke = new Stroke({ color: '#505a5f', width: 2 })
    }

    return new Style({
      image: new CircleStyle({
        radius: 6,
        fill,
        stroke,
      }),
      text: this._textStyle(feature),
    })
  },
}

export default MapComponent
