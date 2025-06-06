import axios from 'axios'
import { Feature, Map, View } from 'ol'
import TileState from 'ol/TileState'
import { buffer, boundingExtent } from 'ol/extent'
import { GeoJSON } from 'ol/format'
import { Point, Circle as CircleGeom } from 'ol/geom'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import LayerGroup from 'ol/layer/Group'
import { fromLonLat, transformExtent } from 'ol/proj'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { Circle as CircleStyle, Fill, Stroke, Style, Text, RegularShape } from 'ol/style'
import { getLength } from'ol/sphere'

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

    this.points = JSON.parse($module.getAttribute('data-points'))
    this.lines = JSON.parse($module.getAttribute('data-lines'))
    this.apiKey = $module.getAttribute('data-api-key')
    this.tileUrl = $module.getAttribute('data-tile-url')

    this.lineSource = new VectorSource()
    this.arrowSource = new VectorSource()
    this.pointSource = new VectorSource()
    this.confidenceSource = new VectorSource()
  },

  render() {
    this.renderMap()
    this.appendPoints()
    this.appendLines()
    this.appendArrows()
    this.appendConfidenceCircles()
  },

  createControls() {
    this.pointsToggle = document.querySelector('#locations')
    this.confidenceToggle = document.querySelector('#confidence')
    this.linesToggle = document.querySelector('#tracks')

    this.pointsToggle.onchange = () => this.togglePoints()
    this.confidenceToggle.onchange = () => this.toggleConfidence()
    this.linesToggle.onchange = () => this.toggleLines()
  },

  renderError() {
    this.$module.innerHTML = '<p class="app-map__error">The map could not be loaded.</p>'
  },

  togglePoints() {
    this.$pointsLayer.setVisible(!this.$pointsLayer.getVisible())
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
      title: 'Points',
      layers: [
        new VectorLayer({
          source: this.pointSource,
          style: this.pointStyle.bind(this),
        }),
      ],
    })

    this.$confidenceLayer = new LayerGroup({
      title: 'Confidence',
      layers: [
        new VectorLayer({
          source: this.confidenceSource,
          style: this.confidenceCircleStyle.bind(),
        }),
      ],
    })

    this.$linesLayer = new LayerGroup({
      title: 'Lines',
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
  },

  generateArrowFeatures() {
    const arrowFeatures = []

    this.lineSource.getFeatures().forEach((lineFeature) => {
      const geometry = lineFeature.getGeometry()
      if (!geometry || geometry.getType() !== 'LineString') return
      const lineLength = getLength(geometry)
      const spacing = 50
      const arrowCount = Math.floor(lineLength / spacing)

      const coords = geometry.getCoordinates()

      for (let i = 0; i < coords.length - 1; i++) {
        //Get start and end coords of this line
        const start = coords[i]
        const end = coords[i + 1]

        //Get mid point of the start and end points of the line
        const midX = (start[0] + end[0]) / 2
        const midY = (start[1] + end[1]) / 2

        const arrowFeature = new Feature({
              geometry: new Point([midX, midY]),
          })

        //Duplicate this depending on length of line?
        // for(let j = 1; j <= arrowCount; j++) {
        //   const fraction = j / (arrowCount + 1)
        //   const coord = geometry.getCoordinates()

        //   const arrowFeature = new Feature({
        //     geometry: new Point(coord),
        //   })

          arrowFeature.setStyle(
            new Style({
              image: new RegularShape({
                points: 3,
                radius: 8,
                fill: new Fill({ color: 'black' }),
                rotation: lineFeature.get('direction'),
                rotateWithView: true,
              }),
            }) 
          )

          arrowFeatures.push(arrowFeature)
        }
      // }
    })
    return arrowFeatures
  },

  generateConfidenceCircleFeatures() {
    const confidenceFeatures = []
    
    this.pointSource.getFeatures().forEach((pointFeature) => {
      const geometry = pointFeature.getGeometry()
      const coords = geometry.getCoordinates()

      const radius = pointFeature.get('confidence')

      const circle = new CircleGeom(coords, radius)

      const circleFeature = new Feature({
        geometry: circle
      })

      confidenceFeatures.push(circleFeature)
    })
    return confidenceFeatures
  },

  appendConfidenceCircles() {
    const confidenceFeatures = this.generateConfidenceCircleFeatures()
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
  },

  appendArrows() {
    const arrowFeatures = this.generateArrowFeatures()
    this.arrowSource.addFeatures(arrowFeatures)
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
        width: 2
      }),
      fill: new Fill({
        color: 'rgba(255, 165, 0, 0.1)'
      })
    })
  },

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

  pointStyle(feature) {
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
      text: this.textStyle(feature),
    })
  },
}

export default MapComponent