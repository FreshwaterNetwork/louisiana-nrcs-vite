import { createStore } from 'vuex'
import esriRequest from '@arcgis/core/request'
import setBuildNrcsStore from './modules/setBuildNrcsStore'

export default createStore({
  state: {
    data: {
      // data retrieved from web services
      supportingLayers: '', //used to create the supportinglayer tree
      slReady: false
    },
    config: {
      // config info
      supportingMapLayers: [
        {
          mapService:
            'https://services2.coastalresilience.org/arcgis/rest/services/Maine/Coastal_Risk_Explorer/MapServer/',
          skipLayers: [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25,
            26
          ],
          title: 'Maine',
          popupTemplate: [
            {
              id: 9999,
              fields: [
                { fieldName: 'Subbasin', label: 'Sub Basin' },
                { fieldName: 'SubbasinR', label: 'Sub Basin R' },
                { fieldName: 'AreaC', label: 'Area(units)' }
              ]
            },
            // for now this placeholder is required.  I am not sure why but the last layer in this list will not display correctly.
            {
              id: 9999,
              fields: [{ fieldName: 'none', label: 'placeholder' }]
            }
          ]
        }
      ],

      supportingLayersTitle: 'Additional Layers',
      supportingLayersOnMap: true,
      supportingLayersInPanel: true,
      panelDisplayType: 'tabsVertical', //plain, tabsHorizontal, tabsVertical
      appDisplayType: 'webMap', //storyMap, webMap
      condensedTabs: false,
      containerWidth: ''
    },
    // app state info -- supporting layers
    tree: { ticked: [], expanded: [999], tickedObj: [] },
    selectedLayerList: [],
    supportingVisibleLayerOpacity: {},

    // app state info -- layout
    showControls: false,
    hideControls: true,
    mapPrintURI: '',
    layerSelection: 'NRCS Resource Units',
    unitSelection: [],
    referenceSelection: [],
    unitLength: 0,
    loadingVis: false,
    mngmtVis: false,
    endLoading: false,
    resourceUnits: [],
    hucUnits: [],
    catchUnits: [],
    fieldUnits: [],
    totalNitr: 0,
    totalPhos: 0,
    totalSed: 0,
    totalCropArea: 0,
    startReport: false,
    backBtn: false,
    unitIndex: '',
    toggledOff: false,
    reportTotalTable: '',
    reportCropTables: [],
    totalNewLoadNit: 0,
    totalNewLoadPhos: 0,
    totalNewLoadSed: 0,
    totalReducedPercentNit: 0,
    totalReducedPercentPhos: 0,
    totalReducedPercentSed: 0,
    printMap: false,
    initLoadData: [],
    areaChanged: false,
    bmpAltered: {},
    areaApplied: 0,
    bmpSelect: [],
    lastBmp: {},
    highlighted: [],
    cropRows: [],
    widgetVis: true,
    totalSelectBmps: [],
    scale: 'NRCS Resource Units',
    consolidated: []
  },
  mutations: {
    //data retrieved from web services
    updateSupportingLayers(state, obj) {
      state.data.supportingLayers = obj
    },
    updateSLReady(state, bool) {
      state.data.slReady = bool
    },
    updateSupportingSublayerList(state, obj) {
      state.data.supportingSublayerList = obj
    },

    //app state -- supporting layers
    updateTreeState(state, obj) {
      state.tree.ticked = obj.ticked
      state.tree.expanded = obj.expanded
      state.tree.tickedObj = obj.tickedObj
    },
    updateSupportingLayerVisibleOpacity(state, obj) {
      state.supportingVisibleLayerOpacity = obj
    },
    updateMapPrintURI(state, uri) {
      state.mapPrintURI = uri
      state.printMap = false
    },
    updateCondensedTabs(state, bool) {
      state.condensedTabs = bool
    },
    updateContainerWidth(state, val) {
      state.containerWidth = val
    },
    updateLayerSelection(state, val) {
      state.layerSelection = val
    },
    updateUnitSelection(state, val) {
      state.unitSelection = val
    },
    updateReferenceSelection(state, val) {
      state.referenceSelection = val
    },
    updateUnitLength(state, val) {
      state.unitLength = val
    },
    updateLoadingVis(state, val) {
      state.loadingVis = val
    },
    updateMngmtVis(state, val) {
      state.mngmtVis = val
    },
    updateEndLoading(state, val) {
      state.endLoading = val
    },
    updateResourceUnits(state, val) {
      state.resourceUnits = val
    },
    updateHucUnits(state, val) {
      state.hucUnits = val
    },
    updateCatchUnits(state, val) {
      state.catchUnits = val
    },
    updateFieldUnits(state, val) {
      state.fieldUnits = val
    },
    updateTotalNitr(state, val) {
      state.totalNitr = val
    },
    updateTotalPhos(state, val) {
      state.totalPhos = val
    },
    updateTotalSed(state, val) {
      state.totalSed = val
    },
    updateTotalCropArea(state, val) {
      state.totalCropArea = val
    },
    updateStartReport(state, val) {
      state.startReport = val
    },
    updateBackBtn(state, val) {
      state.backBtn = val
    },
    updateUnitIndex(state, val) {
      state.unitIndex = val
    },
    updateToggledOff(state, val) {
      state.toggledOff = val
    },
    updateReportTotalTable(state, val) {
      state.reportTotalTable = val
    },
    updateReportCropTables(state, val) {
      state.reportCropTables = val
    },
    updateTotalNewLoadNit(state, val) {
      state.totalNewLoadNit = val
    },
    updateTotalNewLoadPhos(state, val) {
      state.totalNewLoadPhos = val
    },
    updateTotalNewLoadSed(state, val) {
      state.totalNewLoadSed = val
    },
    updateTotalReducedPercentNit(state, val) {
      state.totalReducedPercentNit = val
    },
    updateTotalReducedPercentPhos(state, val) {
      state.totalReducedPercentPhos = val
    },
    updateTotalReducedPercentSed(state, val) {
      state.totalReducedPercentSed = val
    },
    updatePrintMap(state, val) {
      state.printMap = val
    },
    updateInitLoadData(state, val) {
      state.initLoadData = val
    },
    updateAreaChanged(state, val) {
      state.areaChanged = val
    },
    updateBmpAltered(state, val) {
      state.bmpAltered = val
    },
    updateAreaApplied(state, val) {
      state.areaApplied = val
    },
    updateBmpSelect(state, val) {
      state.bmpSelect = val
    },
    updateLastBmp(state, val) {
      state.lastBmp = val
    },
    updateHighlighted(state, val) {
      state.highlighted = val
    },
    updateCropRows(state, val) {
      state.cropRows = val
    },
    updateWidgetVis(state, val) {
      state.widgetVis = val
    },
    updateTotalSelectBmps(state, val) {
      state.totalSelectBmps = val
    },
    updateScale(state, val) {
      state.scale = val
    },
    updateConsolidated(state, val) {
      state.consolidated = val
    }
  },

  actions: {
    requestSupportingLayers(context) {
      //for each map service object in supporting map layers
      try {
        let obj = []
        let smnum = context.state.config.supportingMapLayers.length
        let smcount = 0
        context.state.config.supportingMapLayers.forEach((service, index) => {
          // console.log(service);
          esriRequest(service.mapService + '/layers?f=pjson', {
            responseType: 'json'
          }).then(function (response) {
            let layerJson = response.data.layers
            //push main header to the object
            obj.push({
              label: service.title,
              children: [],
              id: 999 + index,
              noTick: true,
              type: 'header'
            })
            let storeNodes = []
            let type = ''
            layerJson.forEach((l) => {
              service.popupTemplate.forEach((popup) => {
                if (l.id == popup.id) {
                  type = 'Featue Layer'
                } else type = 'Raster Layer'
              })
              // add layer to layer viewer if it's id is not present in the skip array
              if (service.skipLayers.indexOf(l.id) == -1) {
                // Group Layer with no parent
                if (l.type == 'Group Layer' && !l.parentLayer) {
                  //push the object to the list as child of main header
                  obj[index].children.push({
                    label: l.name,
                    children: [],
                    id: l.id + '_' + index,
                    noTick: true,
                    type: type
                  })
                  //find the index of the object we just pushed, saves the reference to the location
                  let parentIndex = obj[index].children.findIndex(
                    (obj) => obj.id == l.id + '_' + index
                  )
                  //save the parent node to the store with reference to its location in the object
                  storeNodes.push({
                    parentIndex: parentIndex,
                    parentLoc: obj[index].children[parentIndex],
                    parentId: l.id + '_' + index,
                    description: l.description
                  })
                }
                // featurel layer with parent
                if (l.type !== 'Group Layer' && l.parentLayer) {
                  //find the location of the parent in the node lookup
                  let nodesIndex = storeNodes.findIndex(
                    (obj) => obj.parentId == l.parentLayer.id + '_' + index
                  )
                  //set the location of the parent
                  let parentLoc = storeNodes[nodesIndex].parentLoc
                  //push the child to the parent
                  parentLoc.children.push({
                    label: l.name,
                    children: [],
                    body: 'toggle',
                    id: l.id + '_' + index,
                    description: l.description,
                    type: type
                  })
                }
                // group layer with parent
                if (l.type == 'Group Layer' && l.parentLayer) {
                  //find the location of the parent in the node lookup
                  let nodesIndex = storeNodes.findIndex(
                    (obj) => obj.parentId == l.parentLayer.id + '_' + index
                  )
                  //set the location of the parent
                  let parentLoc = storeNodes[nodesIndex].parentLoc
                  //push the new parent into the found parent as child
                  parentLoc.children.push({
                    label: l.name,
                    children: [],
                    id: l.id + '_' + index,
                    noTick: true,
                    type: type
                  })
                  //find the index of the child we just pushed
                  let parentIndex = parentLoc.children.findIndex(
                    (obj) => obj.id == l.id + '_' + index
                  )
                  //save the reference to the location
                  parentLoc = parentLoc.children[parentIndex]
                  //save the parent node to the store with reference to its location in the object
                  storeNodes.push({
                    parentIndex: parentIndex,
                    parentLoc: parentLoc,
                    parentId: l.id + '_' + index,
                    description: l.description
                  })
                }
                // feature layer with no parent length = number of nodes
                if (l.type !== 'Group Layer' && !l.parentLayer) {
                  obj[index].children.push({
                    label: l.name,
                    children: [],
                    body: 'toggle',
                    id: l.id + '_' + index,
                    description: l.description,
                    type: type
                  })
                }
              }
            })
            smcount = smcount + 1
            // console.log(smcount);
            // console.log(smnum);
            if (smcount == smnum) {
              context.commit('updateSupportingLayers', obj)
              context.commit('updateSLReady', true)
            }
          })
        })
      } catch (error) {
        context.commit('updateSupportingLayers', 'error')
      }
    }
  },

  modules: {
    setBuildNrcsStore
  }
})
