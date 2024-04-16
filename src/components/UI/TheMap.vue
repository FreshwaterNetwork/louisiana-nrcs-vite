<template>
  <div id="map">
    <!-- <div id="supportingLayers" v-if="$store.state.config.supportingLayersOnMap">
      <SupportingLayers displayClass="supportingLayersMap" />
    </div> -->
  </div>
</template>

<script>
//import SupportingLayers from '../AppTools/SupportingLayers.vue'
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import MapImageLayer from '@arcgis/core/layers/MapImageLayer'
import Legend from '@arcgis/core/widgets/Legend'
import Measurement from '@arcgis/core/widgets/Measurement'
import Expand from '@arcgis/core/widgets/Expand'
import PortalSource from '@arcgis/core/widgets/BasemapGallery/support/PortalBasemapsSource'
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import ScaleBar from '@arcgis/core/widgets/ScaleBar'
import Point from '@arcgis/core/geometry/Point.js'
// import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
// import Graphic from '@arcgis/core/Graphic.js';
// import Symbol from '@arcgis/core/symbols/Symbol.js';
// import func from 'vue-editor-bridge';

//global in order to have access to the maplayer
let esri = {
  mapView: '',
  modelLayer: '',
  supportingMapLayer: '',
  legend: '',
  map: '',
  measurement: '',
  lgExpand: '',
  laySelect: 'NRCS Resource Units',
  table1: {},
  table2: {},
  table3: {},
  table4: {}
}

export default {
  name: 'TheMap',
  components: {
    //SupportingLayers
  },
  data() {
    return {
      count: 0,
      active: true,
      units: [],
      unitClick: null,
      catchID: 0,
      hucID: 0,
      laruID: 0,
      fID: 0,
      groupedObjects: []
    }
  },
  computed: {
    supportingMapVisibleLayers() {
      //returns list of all ticked objects [{mapService: index in config, id: layerid, type: type}, ...]
      return this.$store.state.tree.tickedObj
    },
    supportingVisibleLayerOpacity() {
      //returns object {value: OpacVal, id: Layerid}
      return this.$store.state.supportingVisibleLayerOpacity
    },
    layerSelection() {
      return this.$store.state.layerSelection
    },
    referenceSelection() {
      return this.$store.state.referenceSelection
    },
    unitSelection: {
      get() {
        return this.$store.state.unitSelection
      },
      set(value) {
        this.$store.commit('updateUnitSelection', value)
      }
    },
    unitLength: {
      get() {
        return this.$store.state.unitLength
      },
      set(value) {
        this.$store.commit('updateUnitLength', value)
      }
    },
    loadingVis: {
      get() {
        return this.$store.state.loadingVis
      },
      set(value) {
        this.$store.commit('updateLoadingVis', value)
      }
    },
    mngmtVis: {
      get() {
        return this.$store.state.mngmtVis
      },
      set(value) {
        this.$store.commit('updateMngmtVis', value)
      }
    },
    endLoading: {
      get() {
        return this.$store.state.endLoading
      },
      set(value) {
        this.$store.commit('updateEndLoading', value)
      }
    },
    resourceUnits: {
      get() {
        return this.$store.state.resourceUnits
      },
      set(value) {
        this.$store.commit('updateResourceUnits', value)
      }
    },
    hucUnits: {
      get() {
        return this.$store.state.hucUnits
      },
      set(value) {
        this.$store.commit('updateHucUnits', value)
      }
    },
    catchUnits: {
      get() {
        return this.$store.state.catchUnits
      },
      set(value) {
        this.$store.commit('updateCatchUnits', value)
      }
    },
    fieldUnits: {
      get() {
        return this.$store.state.fieldUnits
      },
      set(value) {
        this.$store.commit('updateFieldUnits', value)
      }
    },
    totalNitr: {
      get() {
        return this.$store.state.totalNitr
      },
      set(value) {
        this.$store.commit('updateTotalNitr', value)
      }
    },
    totalPhos: {
      get() {
        return this.$store.state.totalPhos
      },
      set(value) {
        this.$store.commit('updateTotalPhos', value)
      }
    },
    totalSed: {
      get() {
        return this.$store.state.totalSed
      },
      set(value) {
        this.$store.commit('updateTotalSed', value)
      }
    },
    totalCropArea: {
      get() {
        return this.$store.state.totalCropArea
      },
      set(value) {
        this.$store.commit('updateTotalCropArea', value)
      }
    },
    backBtn() {
      return this.$store.state.backBtn
    },
    unitIndex: {
      get() {
        return this.$store.state.unitIndex
      },
      set(value) {
        this.$store.commit('updateUnitIndex', value)
      }
    },
    printMap() {
      return this.$store.state.printMap
    },
    initLoadData: {
      get() {
        return this.$store.state.initLoadData
      },
      set(value) {
        this.$store.commit('updateInitLoadData', value)
      }
    },
    highlighted: {
      get() {
        return this.$store.state.highlighted
      },
      set(value) {
        this.$store.commit('updateHighlighted', value)
      }
    },
    cropRows: {
      get() {
        return this.$store.state.cropRows
      },
      set(value) {
        this.$store.commit('updateCropRows', value)
      }
    },
    widgetVis() {
      return this.$store.state.widgetVis
    },
    reportCropTables: {
      get() {
        return this.$store.state.reportCropTables
      },
      set(value) {
        this.$store.commit('updateReportCropTables', value)
      }
    },
    totalSelectBmps() {
      return this.$store.state.totalSelectBmps
    },
    consolidated: {
      get() {
        return this.$store.state.consolidated
      },
      set(value) {
        this.$store.commit('updateConsolidated', value)
      }
    }
  },
  watch: {
    supportingMapVisibleLayers() {
      this.updateSupportingVisibility()
    },
    supportingVisibleLayerOpacity() {
      this.updateSupportingOpacity()
    },
    printMap() {
      if (this.printMap) {
        this.getMapPrint()
      }

      this.initLoadData.forEach((obj) => {
        this.totalSelectBmps.forEach((bmp) => {
          if (bmp.style === obj.label) {
            if (obj.bmps.includes(bmp) == false) {
              obj.bmps.push(bmp)
            }
          }
        })
      })

      this.reportCropTables = this.initLoadData
    },
    widgetVis() {
      if (!this.widgetVis) {
        this.hideWidgets()
      } else {
        this.showWidgets()
      }
    },
    highlighted: {
      deep: true,
      handler() {
        esri.highlightUnit?.remove()

        if (this.layerSelection === 'NRCS Resource Units') {
          esri.highlightUnit = esri.nrcsLayerView.highlight(this.highlighted)
        } else if (this.layerSelection === '12-Digit Hydrologic Units') {
          esri.highlightUnit = esri.hucLayerView.highlight(this.highlighted)
        } else if (this.layerSelection === 'Catchments') {
          esri.highlightUnit = esri.catchLayerView.highlight(this.highlighted)
        } else if (this.layerSelection === 'Field Boundaries') {
          esri.highlightUnit = esri.fieldLayerView.highlight(this.highlighted)
        }
      }
    },
    loadingVis(newValue) {
      if (newValue) {
        if (esri.laySelect === 'NRCS Resource Units') {
          this.callUnitQueries('LARU')
        } else if (esri.laySelect === '12-Digit Hydrologic Units') {
          this.callUnitQueries('HUC_12')
        } else if (esri.laySelect === 'Catchments') {
          this.callUnitQueries('Catchment_ID')
        } else if (esri.laySelect === 'Field Boundaries') {
          this.callUnitQueries('fid')
        }
      } else {
        this.resourceUnits = []
        this.hucUnits = []
        this.catchUnits = []
        this.fieldUnits = []
      }
    },
    endLoading(newValue) {
      if (newValue === true) {
        this.consolidateInitLoads()
      }
    },
    unitLength(newValue) {
      if (newValue > 4) {
        this.unitClick.remove()
      }
    }
  },

  mounted() {
    //select a basemap
    esri.map = new Map({
      basemap: 'topo-vector'
    })

    //create the map view
    esri.mapView = new MapView({
      map: esri.map,
      center: [-92.024476, 31.031655],
      zoom: 8,
      container: this.$el
    })

    //add supporting map layers listed in config
    this.$store.state.config.supportingMapLayers.forEach((service) => {
      let l = new MapImageLayer({
        url: service.mapService
      })
      esri.map.add(l)
      l.when(function () {
        //create sublayer list
        let sublayerList = []
        // let layer = esri.map.layers.items.find((layer) => {
        //   return layer.type == 'map-image' && layer.url == service.mapService;
        // });

        l.allSublayers.items.forEach((sublayer) => {
          //see if popup template recrod exists...
          let popups = service.popupTemplate
          let layerConfig = popups.find(({ id }) => id == sublayer.id)
          //if the template is configured
          if (layerConfig) {
            //create template
            let fieldInfos = layerConfig.fields
            let template = {
              actions: [],
              content: [
                {
                  type: 'fields',
                  fieldInfos: fieldInfos
                }
              ]
            }
            sublayerList.push({
              id: sublayer.id,
              visible: false,
              opacity: 1,
              popupTemplate: template
            })
          }
          //if there is no popup push without a template
          else {
            sublayerList.push({
              id: sublayer.id,
              visible: false,
              opacity: 1
            })
          }
        })
        l.sublayers = sublayerList
      })
    })

    esri.mapImage = new MapImageLayer({
      url: 'https://cirrus.tnc.org/arcgis/rest/services/FN_Louisiana/CDA_feature_service_all/MapServer',
      title: '',
      sublayers: [
        {
          id: 0,
          title: 'Catchments',
          visible: false,
          opacity: 0.8
        },
        {
          id: 1,
          title: '12-Digit Hydrologic Units',
          visible: false,
          opacity: 0.8
        },
        {
          id: 2,
          title: 'NRCS Resource Units',
          visible: false,
          opacity: 0.8
        },
        {
          id: 3,
          title: 'Field Boundaries',
          visible: false,
          opacity: 0.8
        },
        {
          id: 4,
          title: 'Agricultural Fields',
          visible: true,
          opacity: 0.8
        },
        {
          id: 5,
          title: 'Poultry Production',
          visible: false,
          opacity: 0.8
        },
        {
          id: 6,
          title: 'Dairy Production',
          visible: false,
          opacity: 0.8
        }
      ]
    })

    esri.map.add(esri.mapImage)

    // Layers and layerviews
    const nrcs = new FeatureLayer({
      url: 'https://cirrus.tnc.org/arcgis/rest/services/FN_Louisiana/CDA_feature_service_all/MapServer/2',
      visible: true,
      title: 'Scale - Resource Units',
      opacity: 0.8,
      outFields: ['LARU']
    })

    esri.map.add(nrcs)

    esri.nrcsLayerView = ''
    esri.mapView.whenLayerView(nrcs).then(function (layerView) {
      esri.nrcsLayerView = layerView
    })

    //

    const huc = new FeatureLayer({
      url: 'https://cirrus.tnc.org/arcgis/rest/services/FN_Louisiana/CDA_feature_service_all/MapServer/1',
      visible: false,
      title: 'Scale - HUC 12',
      opacity: 0.8,

      outFields: ['HUC_12']
    })

    esri.map.add(huc)

    esri.hucLayerView = ''
    esri.mapView.whenLayerView(huc).then(function (layerView) {
      esri.hucLayerView = layerView
    })

    const catchments = new FeatureLayer({
      url: 'https://cirrus.tnc.org/arcgis/rest/services/FN_Louisiana/CDA_feature_service_all/MapServer/0',
      visible: false,
      title: 'Scale - Catchments',
      opacity: 0.8,

      outFields: ['Catchment_ID']
    })

    esri.map.add(catchments)

    esri.catchLayerView = ''
    esri.mapView.whenLayerView(catchments).then(function (layerView) {
      esri.catchLayerView = layerView
    })

    const field = new FeatureLayer({
      url: 'https://cirrus.tnc.org/arcgis/rest/services/FN_Louisiana/CDA_feature_service_all/MapServer/3',
      visible: false,
      title: 'Scale - Agricultural Fields',
      opacity: 0.8,

      outFields: ['fid']
    })

    esri.map.add(field)

    esri.fieldLayerView = ''
    esri.mapView.whenLayerView(field).then(function (layerView) {
      esri.fieldLayerView = layerView
    })

    // Tables
    esri.table1 = new FeatureLayer({
      url: 'https://cirrus.tnc.org/arcgis/rest/services/FN_Louisiana/CDA_feature_service_all/MapServer/7',
      outFields: ['*']
    })

    esri.table2 = new FeatureLayer({
      url: 'https://cirrus.tnc.org/arcgis/rest/services/FN_Louisiana/CDA_feature_service_all/MapServer/8',
      outFields: ['*']
    })

    esri.table3 = new FeatureLayer({
      url: 'https://cirrus.tnc.org/arcgis/rest/services/FN_Louisiana/CDA_feature_service_all/MapServer/9',
      outFields: ['*']
    })

    esri.table4 = new FeatureLayer({
      url: 'https://cirrus.tnc.org/arcgis/rest/services/FN_Louisiana/CDA_feature_service_all/MapServer/10',
      outFields: ['*']
    })

    // Reference layer selection logic
    this.$watch('referenceSelection', () => {
      esri.mapImage.sublayers.forEach((sub) => {
        if (sub.id === 4 || sub.id === 5 || sub.id === 6) {
          let layerTitle = sub.title

          if (this.referenceSelection === layerTitle) {
            sub.visible = true
          } else if (this.referenceSelection !== layerTitle) {
            sub.visible = false
          }
        }
      })
    })

    // Scale layer selection logic
    this.$watch('layerSelection', () => {
      if (esri.highlightUnit) {
        esri.highlightUnit.remove()
      }

      this.units.forEach((unit) => {
        this.units.splice(unit)
      })

      this.unitSelection = []

      if (this.layerSelection === 'NRCS Resource Units') {
        nrcs.visible = true
        huc.visible = false
        catchments.visible = false
        field.visible = false
      } else if (this.layerSelection === '12-Digit Hydrologic Units') {
        huc.visible = true
        nrcs.visible = false
        catchments.visible = false
        field.visible = false
      } else if (this.layerSelection === 'Catchments') {
        catchments.visible = true
        huc.visible = false
        field.visible = false
        nrcs.visible = false
      } else if (this.layerSelection === 'Field Boundaries') {
        field.visible = true
        nrcs.visible = false
        huc.visible = false
        catchments.visible = false
      }

      esri.laySelect = this.layerSelection
    })

    let _this = this
    esri.highlightUnit

    // Click event listener to build selected units list and crop lists

    // this.unitClick =
    esri.mapView.on('click', function (response) {
      if (_this.mngmtVis == false) {
        let point = new Point({
          x: response.mapPoint.longitude,
          y: response.mapPoint.latitude
        })

        if (esri.laySelect === 'NRCS Resource Units') {
          const queryNRCS = nrcs.createQuery(point)
          queryNRCS.geometry = point
          queryNRCS.outFields = ['*']
          // let highlightGraphics = new GraphicsLayer({});
          // let hlgraphic;
          // let hlSymbol = {
          //   type: 'simple-fill',
          //   color: [0, 225, 225, 0.1],
          //   outline: {
          //     color: [0, 225, 225],
          //     width: 2,
          //   },
          // };

          nrcs.queryFeatures(queryNRCS).then(function (result) {
            if (result) {
              let feature = result.features[0]
              _this.laruID = feature.attributes.LARU

              let selected = [_this.laruID, feature.attributes['OBJECTID']]

              // Check if new unit has already been selected
              let exists = _this.units.some(
                (arr) => arr[0] === selected[0] && arr[1] === selected[1]
              )

              if (!exists) {
                _this.units.push(selected)
              }

              _this.unitLength = _this.units.length

              let tempHL = []
              _this.highlighted.forEach((i) => {
                tempHL.push(i)
              })
              tempHL.push(feature.attributes['OBJECTID'])
              _this.highlighted = tempHL

              // hlgraphic = new Graphic({
              //   geometry: feature.geometry,
              //   symbol: hlSymbol,
              // });

              // highlightGraphics.graphics.push(hlgraphic);
              // esri.map.add(highlightGraphics);
            }
          })
        } else if (esri.laySelect === '12-Digit Hydrologic Units') {
          const queryHuc = huc.createQuery(point)
          queryHuc.geometry = point
          queryHuc.outFields = ['*']

          huc.queryFeatures(queryHuc).then(function (result) {
            if (result) {
              let feature = result.features[0]
              _this.hucID = feature.attributes.HUC_12

              let selected = [_this.hucID, feature.attributes['OBJECTID']]

              // Check if new unit has already been selected
              let exists = _this.units.some(
                (arr) => arr[0] === selected[0] && arr[1] === selected[1]
              )

              if (!exists) {
                _this.units.push(selected)
              }

              _this.unitLength = _this.units.length

              let tempHL = []
              _this.highlighted.forEach((i) => {
                tempHL.push(i)
              })
              tempHL.push(feature.attributes['OBJECTID'])
              _this.highlighted = tempHL
            }
          })
        } else if (esri.laySelect === 'Catchments') {
          const queryCatch = catchments.createQuery(point)
          queryCatch.geometry = point
          queryCatch.outFields = ['*']

          catchments.queryFeatures(queryCatch).then(function (result) {
            if (result) {
              let feature = result.features[0]
              _this.catchID = feature.attributes.Catchment_ID

              let selected = [_this.catchID, feature.attributes['OBJECTID_1']]

              // Check if new unit has already been selected
              let exists = _this.units.some(
                (arr) => arr[0] === selected[0] && arr[1] === selected[1]
              )

              if (!exists) {
                _this.units.push(selected)
              }

              _this.unitLength = _this.units.length

              let tempHL = []
              _this.highlighted.forEach((i) => {
                tempHL.push(i)
              })
              tempHL.push(feature.attributes['OBJECTID_1'])
              _this.highlighted = tempHL
            }
          })
        } else if (esri.laySelect === 'Field Boundaries') {
          const queryField = field.createQuery(point)
          queryField.geometry = point
          queryField.outFields = ['*']

          field.queryFeatures(queryField).then(function (result) {
            if (result) {
              let feature = result.features[0]
              _this.fID = feature.attributes.fid

              let selected = [_this.fID, feature.attributes['OBJECTID']]

              // Check if new unit has already been selected
              let exists = _this.units.some(
                (arr) => arr[0] === selected[0] && arr[1] === selected[1]
              )

              if (!exists) {
                _this.units.push(selected)
              }

              _this.unitLength = _this.units.length

              let tempHL = []
              _this.highlighted.forEach((i) => {
                tempHL.push(i)
              })
              tempHL.push(feature.attributes['OBJECTID'])
              _this.highlighted = tempHL
            }
          })
        }

        _this.unitSelection = _this.units
      }
    })

    //code to add highlight feature for map image layer
    // esri.mapView.popup.watch('selectedFeature', function (gra) {
    //   if (gra) {
    //     esri.mapView.graphics.removeAll()
    //     var h = esri.mapView.highlightOptions
    //     gra.symbol = {
    //       type: 'simple-fill', // autocasts as new SimpleFillSymbol()
    //       color: [h.color.r, h.color.g, h.color.b, 0],
    //       outline: {
    //         // autocasts as new SimpleLineSymbol()
    //         color: [h.color.r, h.color.g, h.color.b, h.color.a],
    //         width: 0
    //       }
    //     }
    //     esri.mapView.graphics.add(gra)
    //   } else {
    //     esri.mapView.graphics.removeAll()
    //   }
    // })

    // esri.mapView.popup.watch('visible', function (vis) {
    //   if (!vis) {
    //     esri.mapView.graphics.removeAll()
    //   }
    // })

    //add supporting layers widget to map if true
    if (this.$store.state.config.supportingLayersOnMap) {
      let supportingLayersExpand = new Expand({
        expandIconClass: 'esri-icon-layer-list',
        expandTooltip: 'Expand LayerList',
        view: esri.mapView,
        content: document.getElementById('supportingLayers')
      })
      esri.mapView.ui.add(supportingLayersExpand, 'top-right')
    }

    //add scalebar widget
    esri.scaleBar = new ScaleBar({
      view: esri.mapView,
      unit: 'dual'
    })
    esri.mapView.ui.add(esri.scaleBar, {
      position: 'bottom-right'
    })

    //add measure tools
    esri.measurement = new Measurement({
      view: esri.mapView
    })
    esri.mapView.ui.add(esri.measurement, 'top-left')

    // create legend widget
    esri.legend = new Legend({
      view: esri.mapView
    })

    // create expand widget to hide and show legend
    esri.lgExpand = new Expand({
      view: esri.mapView,
      content: esri.legend
    })

    // add expand to map
    esri.mapView.ui.add(esri.lgExpand, 'bottom-left')
    // show expanded legend on desktop, collapse on mobile
    this.$q.screen.lt.sm || this.$q.screen.lt.md ? true : esri.lgExpand.expand()

    //watch size of map view and adjust legend to close if map gets too small
    esri.mapView.on('resize', function (event) {
      if (event.width < 546) {
        esri.lgExpand.collapse()
      }
      if (event.width > 546) {
        esri.lgExpand.expand()
      }
    })

    // basemaps
    const allowedBasemapTitles = [
      'Topographic',
      'Imagery',
      'Imagery Hybrid',
      'Streets',
      'Dark Gray Canvas'
    ]
    // filtering portal basemaps
    const source = new PortalSource({
      filterFunction: (basemap) => allowedBasemapTitles.indexOf(basemap.portalItem.title) > -1
    })
    // basemap gallery widget
    var basemapGallery = new BasemapGallery({
      view: esri.mapView,
      source: source,
      container: document.createElement('div')
    })
    // expand to hold basemap gallery
    var bgExpand = new Expand({
      view: esri.mapView,
      content: basemapGallery
    })
    // place expand in view
    esri.mapView.ui.add(bgExpand, {
      position: 'top-right'
    })
    // close expand when basemap is changed
    esri.map.watch('basemap.title', function () {
      bgExpand.collapse()
    })

    // move zoom controls to top right
    esri.mapView.ui.move(['zoom'], 'top-right')
  },

  methods: {
    async callUnitQueries(field) {
      this.endLoading = false
      this.resourceUnits = []
      this.hucUnits = []
      this.catchUnits = []
      this.fieldUnits = []
      for (let unit of this.units) {
        await this.unitQueries(unit, field)
      }
      this.endLoading = true
    },
    unitQueries(unit, field) {
      return new Promise((resolve, reject) => {
        let count = 0
        const tables = [esri.table1, esri.table2, esri.table3, esri.table4]
        const queryPromises = tables.map((table) => {
          let query = table.createQuery()
          query.where = field + ' = ' + unit[0]
          return table.queryFeatures(query).then((result) => {
            if (result) {
              result.features.forEach((feat) => {
                let i = {
                  label: feat.attributes.CropName,
                  cAcres: feat.attributes.CropArea_acres,
                  nitr: feat.attributes.orig_nit_load,
                  phos: feat.attributes.orig_phos_load,
                  sed: feat.attributes.orig_sed_load,
                  rFactor: feat.attributes.R_Factor_100ft_ton_in_acre_hr,
                  k_factor: feat.attributes.KffactF,
                  cls_factor: feat.attributes.Cls_factor,
                  runoff_in_yr: feat.attributes.Runoff_in_yr,
                  nit_emc_value: feat.attributes.Nitr_EMC,
                  phos_emc_value: feat.attributes.Phos_EMC,
                  c: feat.attributes.C,
                  p: feat.attributes.P,
                  newNitr: 0,
                  newPhos: 0,
                  newSed: 0,
                  nitrReducPercent: 0,
                  phosReducPercent: 0,
                  sedReducPercent: 0,
                  bmps: []
                }
                if (field === 'LARU') {
                  this.resourceUnits.push(i)
                }
                if (field === 'HUC_12') {
                  this.hucUnits.push(i)
                }
                if (field === 'Catchment_ID') {
                  this.catchUnits.push(i)
                }
                if (field === 'fid') {
                  this.fieldUnits.push(i)
                }
              })
              count++
              if (count === 4) {
                resolve(true)
              }
            } else {
              reject(new Error('Query failed'))
            }
          })
        })
        Promise.all(queryPromises)
          .then(() => resolve(true))
          .catch(reject)
      })
    },
    updateSupportingVisibility() {
      // turn off all raster layer visibility
      esri.map.layers.items.forEach((fl) => {
        if (fl.type === 'feature') {
          fl.visible = false
        }
        if (fl.type == 'map-image') {
          fl.allSublayers.items.forEach((sl) => {
            if (sl.layer.type == 'map-image') {
              sl.visible = false
            }
          })
        }
      })
      // turn on all sublayers that are checked in the TOC
      this.supportingMapVisibleLayers.forEach((l) => {
        //if type is raster layer - find the sublayer and make visible
        if (l.type === 'Raster Layer') {
          let layer = esri.map.layers.items.find((layer) => {
            return (
              layer.type == 'map-image' &&
              layer.url ==
                this.$store.state.config.supportingMapLayers[l.mapServiceIndex].mapService
            )
          })
          let sublayer = layer.allSublayers.items.find((sublayer) => {
            return sublayer.id == l.id
          })
          sublayer.visible = true
        }
        if (l.type === 'Feature Layer') {
          //check to see if feature layer exists.  if it does make it visible, if not create it.
          let i = esri.map.layers.items.findIndex(
            (layer) =>
              layer.layerId == l.id &&
              layer.url ==
                this.$store.state.config.supportingMapLayers[l.mapServiceIndex].mapService
          )

          if (i >= 0) {
            esri.map.layers.items[i].visible = true
          } else {
            //check to see if fl has a popup template defined
            let layerList =
              this.$store.state.config.supportingMapLayers[l.mapServiceIndex].popupTemplate
            let i = layerList.findIndex((layer) => layer.id == l.id)
            if (i >= 0) {
              let template = {
                title: layerList[i].title,
                content: [
                  {
                    type: 'text',
                    text: layerList[i].label + ':  <b>{ ' + layerList[i].field + '}</b>'
                  }
                ]
              }
              //get index of map server
              esri.map.add(
                new FeatureLayer({
                  url:
                    this.$store.state.config.supportingMapLayers[l.mapServiceIndex].mapService +
                    '/' +
                    l.id,
                  popupTemplate: template
                })
              )
            }
            //if no popup defined create the feature layer without popup
            else {
              esri.map.add(
                new FeatureLayer({
                  url:
                    this.$store.state.config.supportingMapLayers[l.mapServiceIndex].mapService +
                    '/' +
                    l.id
                })
              )
            }
          }
        }
      })
    },
    consolidateInitLoads() {
      let loopArray = []
      if (this.layerSelection === 'NRCS Resource Units') {
        loopArray = Array.from(this.resourceUnits)
      } else if (this.layerSelection === '12-Digit Hydrologic Units') {
        loopArray = Array.from(this.hucUnits)
      } else if (this.layerSelection === 'Catchments') {
        loopArray = Array.from(this.catchUnits)
      } else if (this.layerSelection === 'Field Boundaries') {
        loopArray = Array.from(this.fieldUnits)
      }
      let groupedObjects = []
      loopArray.forEach((obj) => {
        const label = obj.label
        if (!groupedObjects[label]) {
          groupedObjects[label] = {
            label,
            nitr: 0,
            phos: 0,
            sed: 0,
            acres: 0,
            newNitr: 0,
            newPhos: 0,
            newSed: 0,
            nitrReducPercent: 0,
            phosReducPercent: 0,
            sedReducPercent: 0,
            cropRows: [],
            bmps: [],
            bmpLength: 0
          }
        }
        if (groupedObjects[label]) {
          groupedObjects[label]['cropRows'].push(obj)
          groupedObjects[label].nitr += obj.nitr
          groupedObjects[label].phos += obj.phos
          groupedObjects[label].sed += obj.sed
          groupedObjects[label].acres += obj.cAcres
          groupedObjects[label].kFact = obj.k_factor
          groupedObjects[label].clsFactor = obj.cls_factor
          groupedObjects[label].runoff_year = obj.runoff_in_yr
        }
      })
      this.initLoadData = Object.values(groupedObjects)
      this.initLoadData = this.initLoadData.sort(({ acres: a }, { acres: b }) => b - a)
    },
    updateSupportingOpacity() {
      let l = this.supportingVisibleLayerOpacity
      // if it is a raster find the sublayer and set the opacity
      if (l.type === 'Raster Layer') {
        let layer = esri.map.layers.items.find((layer) => {
          return (
            layer.type == 'map-image' &&
            layer.url == this.$store.state.config.supportingMapLayers[l.mapServiceIndex].mapService
          )
        })
        let sublayer = layer.allSublayers.items.find((sublayer) => {
          return sublayer.id == l.id
        })
        sublayer.opacity = l.value
      }
      //if it is a feature layers, create it if it does not exist but make visibility false.  then set its opacity so that
      //when the user turns it on, it will find the layer and match the ui opacity dial.
      if (l.type == 'Feature Layer') {
        let i = esri.map.layers.items.findIndex(
          (layer) =>
            layer.layerId == l.id &&
            layer.url == this.$store.state.config.supportingMapLayers[l.mapServiceIndex].mapService
        )

        if (i >= 0) {
          esri.map.layers.items[i].opacity = l.value
        } else {
          //check to see if fl has a popup template defined
          let layerList =
            this.$store.state.config.supportingMapLayers[l.mapServiceIndex].popupTemplate
          let i = layerList.findIndex((layer) => layer.id == l.id)
          if (i >= 0) {
            let template = {
              title: layerList[i].title,
              content: [
                {
                  type: 'text',
                  text: layerList[i].label + ':  <b>{ ' + layerList[i].field + '}</b>'
                }
              ]
            }
            //get index of map server
            esri.map.add(
              new FeatureLayer({
                url:
                  this.$store.state.config.supportingMapLayers[l.mapServiceIndex].mapService +
                  '/' +
                  l.id,
                popupTemplate: template,
                visible: false,
                opacity: l.value
              })
            )
          }
          //if no popup defined create the feature layer without popup
          else {
            esri.map.add(
              new FeatureLayer({
                url:
                  this.$store.state.config.supportingMapLayers[l.mapServiceIndex].mapService +
                  '/' +
                  l.id,
                visible: false,
                opacity: l.value
              })
            )
          }
        }
      }
    },
    getMapPrint() {
      esri.mapView.takeScreenshot({ width: 500, height: 400 }).then((screenshot) => {
        let image = screenshot.dataUrl
        this.$store.commit('updateMapPrintURI', image)
      })
    },

    activateAreaMeasurement() {
      const distanceButton = document.getElementById('distance')
      const areaButton = document.getElementById('area')
      esri.measurement.activeTool = 'area'
      distanceButton.classList.remove('active')
      areaButton.classList.add('active')
    },

    activateLineMeasurement() {
      const distanceButton = document.getElementById('distance')
      const areaButton = document.getElementById('area')
      esri.measurement.activeTool = 'distance'
      distanceButton.classList.add('active')
      areaButton.classList.remove('active')
    },

    // Clears all measurements
    clearMeasurements() {
      const distanceButton = document.getElementById('distance')
      const areaButton = document.getElementById('area')
      distanceButton.classList.remove('active')
      areaButton.classList.remove('active')
      esri.measurement.clear()
    },
    hideWidgets() {
      esri.lgExpand.visible = false
      esri.scaleBar.visible = false
    },
    showWidgets() {
      esri.lgExpand.visible = true
      esri.scaleBar.visible = true
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import 'https://js.arcgis.com/4.20/@arcgis/core/assets/esri/themes/light/main.css';

#map {
  flex: 1;
  min-height: calc(100vh - 49px);
  height: 100%;
  width: 100%;
  position: relative;
  border-bottom: #999 solid 1pt;
}
#mapStory {
  flex: 1;
  height: calc(100vh - 200px);
  height: 100%;
  width: 100%;
  position: relative;
  border-bottom: #999 solid 1pt;
}
.report-map {
  margin-top: 50px;
  min-height: unset !important;
  height: 400px !important;
  width: 500px !important;
}

@media screen and (max-width: 700px) {
  #map {
    min-height: 20vh;
    height: 100%;
    width: 100%;
    position: relative;
    border-bottom: #999 solid 1pt;
  }
}
#printBtn {
  position: absolute;
  z-index: 100;
  right: 15px;
  top: 175px;
  border: none;
  box-shadow: 1.5px 1.5px 1px 0px rgb(0 0 0 / 40%);
}
#toolbarDiv {
  position: absolute;
  left: 10px;
  top: 10px;
  display: flex;
  box-shadow: 0 1px 2px rgb(0 0 0 / 60%);
}

esri-expand__content esri-expand__content--expanded div {
  background-color: white;
}
#toolbarDiv button {
  border: unset;
}
#area {
  border-right: solid 1px rgba(110, 110, 110, 0.3) !important;
  border-left: solid 1px rgba(110, 110, 110, 0.3) !important;
}

.esri-widget--button.active,
.esri-widget--button.active:hover,
.esri-widget--button.active:focus {
  cursor: default;
  background-color: lightgrey;
}
.esri-widget--button.active path,
.esri-widget--button.active:hover path,
.esri-widget--button.active:focus path {
  fill: #e4e4e4;
}

.esri-widget *:focus-visible,
.esri-widget *:focus {
  outline: none;
}
</style>
<style>
.esri-legend__service h3 {
  line-height: unset;
}
.esri-legend__layer-cell {
  padding-top: 0;
  padding-bottom: 0;
}
.esri-measurement {
  margin: 40px 0 0 -4px;
}
.esri-ui-corner .esri-component,
.esri-expand__content {
  box-shadow: 1px 1px 2px rgb(0 0 0 / 60%);
}

.esri-scale-bar__line {
  background-color: white !important;
}
</style>
