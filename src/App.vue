<template>
  <v-snackbar
    v-if="updateExists"
    class="q-pa-md"
    bottom
    right
    :value="updateExists"
    :timeout="0"
    color="primary"
  >
    <span class="text-caption">
      An update is available
      <q-btn flat @click="refreshApp" size="sm" color="primary"> Update </q-btn></span
    >
  </v-snackbar>
  <div id="print" class="print-only">
    <the-print></the-print>
  </div>
  <the-header></the-header>

  <div>
    <div id="mobile" v-if="smallScreen" class="print-hide">
      <q-splitter
        v-model="splitterModelMobile"
        unit="px"
        separator-class="bg-primary"
        horizontal
        @update:model-value="updateScrollContainerHeight($event)"
      >
        <template v-slot:after v-if="smallScreen">
          <!--PANEL COMPONENT-->
          <the-panel-tabs-vertcial
            v-if="$store.state.config.panelDisplayType == 'tabsVertical'"
          ></the-panel-tabs-vertcial>
        </template>
        <template v-slot:separator>
          <q-avatar
            draggable="false"
            color="primary"
            text-color="white"
            size="20px"
            icon="drag_indicator"
          />
        </template>
        <template v-slot:before>
          <!--MAP COMPONENT-->
          <the-map></the-map>
        </template>
      </q-splitter>
    </div>
    <div id="desktop" v-if="!smallScreen" class="print-hide">
      <q-splitter
        v-model="splitterModel"
        unit="px"
        separator-class="bg-primary"
        :limits="[70, Infinity]"
        @update:model-value="updateCondensedTabs($event)"
      >
        <template v-slot:before>
          <!--PANEL COMPONENT-->
          <the-panel-tabs-vertcial
            v-if="$store.state.config.panelDisplayType == 'tabsVertical'"
          ></the-panel-tabs-vertcial>
        </template>
        <template v-slot:separator>
          <q-avatar
            draggable="false"
            color="primary"
            text-color="white"
            size="20px"
            icon="drag_indicator"
          />
        </template>
        <template v-slot:after>
          <!--MAP COMPONENT-->
          <div v-if="!this.widgetVis">
            <h4 style="margin: 15px auto 15px auto; display: block; width: fit-content">
              Map Preview
            </h4>
            <p style="margin: 15px auto 15px auto; display: block; width: fit-content">
              Zoom, adjust, and pan around the map for the report screenshot. Then, click the "Save
              Report" button.
            </p>
            <q-btn
              style="margin: 15px auto 15px auto; display: block; width: fit-content"
              class="q-ma-sm"
              color="primary"
              @click="startPdf()"
              >Create Report</q-btn
            >
          </div>
          <the-map></the-map>
        </template>
      </q-splitter>
    </div>
  </div>
</template>

<script>
import TheMap from './components/UI/TheMap.vue'
import TheHeader from './components/UI/TheHeader.vue'
import ThePanelTabsVertcial from './components/UI/ThePanelTabsVertical.vue'
import ThePrint from './components/AppTools/ThePrint.vue'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import htmlToPdfmake from 'html-to-pdfmake'

export default {
  name: 'App',
  components: {
    TheMap,
    TheHeader,
    ThePanelTabsVertcial,
    ThePrint
    //TheMapToggle, TheSideNav
  },
  data() {
    return {
      splitterModel: this.$store.state.config.panelDisplayType == 'tabsVertical' ? 650 : 750,
      splitterModelMobile: this.$store.state.config.panelDisplayType == 'tabsVertical' ? 300 : 400,
      panelScreenSize: 'v-slot:before',
      //for the service worker (pwa update)
      registration: null,
      updateExists: false
    }
  },
  created() {
    document.addEventListener('swUpdated', this.updateAvailable, {
      once: true
    })
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // We'll also need to add 'refreshing' to our data originally set to false.
      if (this.refreshing) return
      this.refreshing = true
      // Here the actual reload of the page occurs
      window.location.reload()
    })
  },
  computed: {
    smallScreen() {
      return this.$q.screen.lt.sm
    },
    totalNitr() {
      return this.$store.state.totalNitr
    },
    totalPhos() {
      return this.$store.state.totalPhos
    },
    totalSed() {
      return this.$store.state.totalSed
    },
    totalCropArea() {
      return this.$store.state.totalCropArea
    },
    resourceUnits() {
      return this.$store.state.resourceUnits
    },
    hucUnits() {
      return this.$store.state.hucUnits
    },
    catchUnits() {
      return this.$store.state.catchUnits
    },
    fieldUnits() {
      return this.$store.state.fieldUnits
    },
    unitSelection() {
      return this.$store.state.unitSelection
    },
    layerSelection() {
      return this.$store.state.layerSelection
    },
    startReport() {
      return this.$store.state.startReport
    },
    totalNewLoadNit() {
      return this.$store.state.totalNewLoadNit
    },
    totalNewLoadPhos() {
      return this.$store.state.totalNewLoadPhos
    },
    totalNewLoadSed() {
      return this.$store.state.totalNewLoadSed
    },
    totalReducedPercentNit() {
      return this.$store.state.totalReducedPercentNit
    },
    totalReducedPercentPhos() {
      return this.$store.state.totalReducedPercentPhos
    },
    totalReducedPercentSed() {
      return this.$store.state.totalReducedPercentSed
    },
    mapPrintURI() {
      return this.$store.state.mapPrintURI
    },
    widgetVis: {
      get() {
        return this.$store.state.widgetVis
      },
      set(value) {
        this.$store.commit('updateWidgetVis', value)
      }
    },
    reportCropTables() {
      return this.$store.state.reportCropTables
    },
    printMap: {
      get() {
        return this.$store.state.printMap
      },
      set(value) {
        this.$store.commit('updatePrintMap', value)
      }
    }
  },
  watch: {
    mapPrintURI() {
      this.generatePDF()
    }
  },
  mounted() {
    // create data store for the app
    this.$store.dispatch('requestSupportingLayers')
    this.$q.screen.setSizes({ sm: 700 })
  },
  methods: {
    updateCondensedTabs(value) {
      //this function updates the tab state (condensed true/false) to show icon only
      if (value < 150 && !this.$store.state.condensedTabs) {
        this.$store.commit('updateCondensedTabs', true)
      } else if (value > 150 && this.$store.state.condensedTabs) {
        this.$store.commit('updateCondensedTabs', false)
      }
      this.$store.commit('updateContainerWidth', value)
    },
    updateScrollContainerHeight(value) {
      //this function updates the height of the scroll container (tab panels) in mobile view

      //todo: notate what does the 150 control
      let newVal = value
      //document.getElementById('panelM').style.height = 'calc(100vh - ' + newVal  + 'px)'
      document.getElementsByClassName('panelM').forEach((elem) => {
        elem.style.height = 'calc(100vh - ' + newVal + 'px)'
      })
    },
    startPdf() {
      this.printMap = true
    },
    async generatePDF() {
      pdfMake.vfs = pdfFonts.pdfMake.vfs

      // Create HTML blocks
      var today = new Date()
      var dateString = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      // Pull in data
      let unitType = ''
      let unitList = ''
      this.unitSelection.forEach((unit) => {
        if (unit) {
          unitList += ', ' + unit[0]
        }
      })

      unitList = unitList.substring(2)

      if (this.layerSelection === 'NRCS Resource Units') {
        unitType = 'Resource Units'
      } else if (this.layerSelection === '12-Digit Hydrologic Units') {
        unitType = 'HUC 12 Units'
      } else if (this.layerSelection === 'Catchments') {
        unitType = 'Catchment Units'
      } else if (this.layerSelection === 'Field Boundaries') {
        unitType = 'Agricultural Field Units'
      }

      let cropTable = ''

      this.reportCropTables.forEach((i) => {
        if (i.newNitr != '0') {
          let bmpTable = ''
          // console.log(i);
          i.bmps.forEach((bmp) => {
            // console.log(bmp);
            if (bmp.toggled == true) {
              console.log(bmp)
              if (!bmp.cm_factor) {
                bmp.cm_factor = 'N/A'
              }
              if (!bmp.sp_factor) {
                bmp.sp_factor = 'N/A'
              }
              if (!bmp.nit_em) {
                bmp.nit_em = 'N/A'
              }
              if (!bmp.phos_em) {
                bmp.phos_em = 'N/A'
              }
              if (
                (bmp.area_percent == 0 || !bmp.area_percent) &&
                bmp.type !== 'defined' &&
                bmp.type !== 'exclusive'
              ) {
                bmp.area_percent = 100
              }
              bmpTable +=
                '<table style="margin-bottom: 20px"><tr><td colspan="8" style="background-color: 	#FBCEB1">' +
                bmp.label +
                '</td></tr><tr><td>Percent Applied</td><td>Nitrogen Efficiency</td><td>Phosphorus Efficiency</td><td>Sediment Efficiency</td><td>Nitrogen EMC</td><td>Phosphorus EMC</td><td>C</td><td>P</td></tr><tr><td>' +
                bmp.area_percent +
                '% </td><td>' +
                bmp.nit +
                '</td><td>' +
                bmp.phos +
                '</td><td>' +
                bmp.sed +
                '</td><td>' +
                bmp.nit_em +
                '</td><td>' +
                bmp.phos_em +
                '</td><td>' +
                bmp.cm_factor +
                '</td><td>' +
                bmp.sp_factor +
                '</td></tr></table>'
            }
          })
          cropTable +=
            '<p style="color: #6082B6; font-size: 20px" class="pdf-pagebreak-before"><strong>' +
            i.label +
            ': </strong></p><table><tr><th colspan="2">' +
            i.acres.toFixed(0) +
            ' acres </th><th colspan="2">Nitrogen</th><th colspan="2">Phosphorus</th><th colspan="2">Sediment</th></tr><tr><td colspan="2">Initial Load (MT/yr)</td><td colspan="2">' +
            i.nitr.toFixed(2) +
            '</td><td colspan="2">' +
            i.phos.toFixed(2) +
            '</td><td colspan="2">' +
            i.sed.toFixed(2) +
            '</td></tr><tr><td colspan="2">Reduced Load (MT/yr)</td><td colspan="2">' +
            i.newNitr +
            '</td><td colspan="2">' +
            i.newPhos +
            '</td><td colspan="2">' +
            i.newSed +
            '</td></tr><tr><td colspan="2">Reduction</td><td colspan="2">' +
            i.nitrReducPercent +
            '%</td><td colspan="2">' +
            i.phosReducPercent +
            '%</td><td colspan="2">' +
            i.sedReducPercent +
            '%</td></tr></table>' +
            '<p style="color: #6082B6"><strong>' +
            i.label +
            ' BMPs: </strong></p>' +
            bmpTable
        }
      })

      var finalCropTable = htmlToPdfmake(cropTable)

      // Create PDF template
      var docDefinition = {
        header: {
          text: dateString,
          alignment: 'right',
          margin: [0, 20, 20, 0]
        },
        footer: function (currentPage, pageCount) {
          return {
            text: 'Page ' + currentPage.toString() + ' of ' + pageCount.toString(),
            alignment: 'center',
            margin: [0, 0, 0, 10]
          }
        },
        content: [
          {
            text: 'Louisiana - TNC Freshwater Network',
            bold: true,
            style: ['header1', 'centerItem'],
            margin: [0, 0, 0, 20],
            alignment: 'center'
          },
          {
            text: unitType + ' Selected: ',
            bold: true,
            color: '#6082B6',
            style: 'header2'
          },
          {
            text: unitList,
            margin: [0, 10, 0, 20]
          },
          {
            text: 'Total Nutrient Reduction:',
            bold: true,
            color: '#6082B6',
            style: 'header2'
          },
          {
            margin: [0, 10, 0, 20],
            table: {
              headerRows: 1,
              widths: ['auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  'All Load Sources - ' + this.totalCropArea.toFixed(0) + ' acres',
                  'Nitrogen',
                  'Phosphorus',
                  'Sediment'
                ],
                [
                  'Initial Load (MT/yr)',
                  this.totalNitr.toFixed(2),
                  this.totalPhos.toFixed(2),
                  this.totalSed.toFixed(2)
                ],
                [
                  'New Load (MT/yr)',
                  this.totalNewLoadNit.toFixed(2),
                  this.totalNewLoadPhos.toFixed(2),
                  this.totalNewLoadSed.toFixed(2)
                ],
                [
                  'Reduction',
                  this.totalReducedPercentNit + '%',
                  this.totalReducedPercentPhos + '%',
                  this.totalReducedPercentSed + '%'
                ]
              ]
            }
          },
          {
            text: 'Map Overview:',
            bold: true,
            color: '#6082B6',
            style: 'header2'
          },
          {
            image: this.mapPrintURI,
            alignment: 'center',
            margin: [0, 10, 0, 20]
          },
          finalCropTable
        ],
        styles: {
          header1: {
            fontSize: 20
          },
          header2: {
            fontSize: 15
          },
          header3: {
            fontSize: 10
          }
        },
        pageBreakBefore: function (currentNode) {
          return currentNode.style && currentNode.style.indexOf('pdf-pagebreak-before') > -1
        }
      }
      pdfMake.createPdf(docDefinition).download()
      this.widgetVis = true
      document.getElementById('map').classList.remove('report-map')
    }
  },
  updateAvailable(event) {
    this.registration = event.detail
    this.updateExists = true
  },
  refreshApp() {
    this.updateExists = false
    // Make sure we only send a 'skip waiting' message if the SW is waiting
    if (!this.registration || !this.registration.waiting) return
    // Send message to SW to skip the waiting and activate the new SW
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }
}
</script>

<style>
@media screen and (max-width: 700px) {
  .q-splitter__before,
  .q-splitter__after {
    overflow: hidden !important;
  }
  .esri-view-width-xsmall .esri-expand--auto .esri-expand__mask--expanded {
    display: none;
  }
  .esri-view-width-xsmall .esri-expand--auto .esri-expand__container--expanded {
    top: 100px;
  }
  .esri-view-width-xsmall .esri-expand--auto .esri-expand__container--expanded .esri-expand__panel {
    padding: 2px;
  }
}
</style>
