<template>
  <q-select
    v-model="model"
    :options="bmpOptions"
    dense
    multiple
    outlined
    label="Select Best Management Practice(s)"
    options-dense
    popup-content-style="margin-left: 30px"
    style="margin: 0 10px 0 10px"
    @update:model-value="startBuild(model, crop)"
  >
    <template v-slot:option="scope">
      <q-item
        v-bind="scope.itemProps"
        v-close-popup
        :clickable="scope.opt.type == 'title' ? false : true"
      >
        <q-item-section>
          <q-item-label :style="scope.opt.color">{{ scope.opt.label }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>

  <!-- <div :id="crop.label" style="margin: 10px"></div> -->

  <div v-for="bmp in model" :key="bmp">
    <bmp-full-component
      :bmp="bmp"
      remove="remove-bmp"
      v-if="bmp.style === crop.label"
      @remove-bmp="removeBmp([bmp, crop])"
      toggle="toggle-bmp"
      @toggle-bmp="toggleBmp([bmp, crop])"
    ></bmp-full-component>
  </div>
</template>
<script>
import bmpFullComponent from '../UI/bmpFullComponent.vue'

export default {
  data() {
    return {
      model: [],
      bmpOptions: [
        {
          label: 'Load Source Change BMPs (Full Coverage)',
          type: 'title',
          nit: 0,
          phos: 0,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          style: '',
          color: 'color: black; font-weight: bold;'
        },
        {
          label: 'Land Retirement',
          type: 'full',
          value: 'Land Retirement',
          nit: 0.89,
          phos: 0.8,
          sed: 0.95,
          phos_em: 0.27,
          nit_em: 0.1,
          cm_factor: 0.01,
          sp_factor: 1,
          area_percent: 0,
          lscFull: 'FullExtent',
          redFunc: 'LSC',
          appType: 'EX',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Pasture and Hayland Planting (Forage Planting)',
          type: 'full',
          value: 'Pasture and Hayland Planting (Forage Planting)',
          nit: 0.18,
          phos: 0.15,
          sed: 0,
          phos_em: 0.2,
          nit_em: 0.11,
          cm_factor: 0.007,
          sp_factor: 1,
          area_percent: 0,
          lscFull: 'FullExtent',
          redFunc: 'LSC',
          appType: 'EX',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Load Source Change BMPs (Defined Area)',
          type: 'title',
          nit: 0,
          phos: 0,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          color: 'color: black; font-weight: bold;'
        },
        {
          label: 'Buffer - Forest (100 ft wide)',
          type: 'defined',
          value: 'Buffer - Forest (100 ft wide)',
          nit: 0.47,
          phos: 0.46,
          sed: 0.58,
          phos_em: 0.4,
          nit_em: 0.1,
          cm_factor: 0.003,
          sp_factor: 1,
          area_percent: 0,
          redFunc: 'LSC',
          appType: 'EX',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Buffer - Grass (35 ft wide)',
          type: 'defined',
          value: 'Buffer - Grass (35 ft wide)',
          nit: 0.33,
          phos: 0.43,
          sed: 0.53,
          phos_em: 0.2,
          nit_em: 0.11,
          cm_factor: 0.007,
          sp_factor: 1,
          area_percent: 0,
          redFunc: 'LSC',
          appType: 'EX',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: '30m Buffer with Optional Grazing',
          type: 'defined',
          value: '30m Buffer with Optional Grazing',
          nit: 0.36,
          phos: 0.65,
          sed: 0,
          phos_em: 0.2,
          nit_em: 0.11,
          cm_factor: 0.007,
          sp_factor: 1,
          area_percent: 0,
          redFunc: 'LSC',
          appType: 'EX',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Critical Area Planting',
          type: 'defined',
          value: 'Critical Area Planting',
          nit: 0.17,
          phos: 0.2,
          sed: 0.42,
          phos_em: 0.27,
          nit_em: 0.1,
          cm_factor: 0.01,
          sp_factor: 1,
          area_percent: 0,
          redFunc: 'LSC',
          appType: 'EX',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Forest Buffer (min. 35 ft wide)',
          type: 'defined',
          value: 'Forest Buffer (min. 35 ft wide)',
          nit: 0.45,
          phos: 0.4,
          sed: 0.53,
          phos_em: 0.4,
          nit_em: 0.1,
          cm_factor: 0.003,
          sp_factor: 1,
          area_percent: 0,
          redFunc: 'LSC',
          appType: 'EX',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Grass Buffer (min. 35 ft wide)',
          type: 'defined',
          value: 'Grass Buffer (min. 35 ft wide)',
          nit: 0.86,
          phos: 0.76,
          sed: 0.64,
          phos_em: 0.2,
          nit_em: 0.11,
          cm_factor: 0.007,
          sp_factor: 1,
          area_percent: 0,
          redFunc: 'LSC',
          appType: 'EX',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Wetland Restoration',
          type: 'defined',
          value: 'Wetland Restoration',
          nit: 0.42,
          phos: 0.41,
          sed: 0.31,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'LSC',
          appType: 'EX',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Exclusive BMPs',
          type: 'title',
          nit: 0,
          phos: 0,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          style: '',
          toggled: true,
          color: 'color: black; font-weight: bold;'
        },
        {
          label: 'Conservation Tillage 1 (30%-59% Residue)',
          type: 'exclusive',
          value: 'Conservation Tillage 1 (30%-59% Residue)',
          nit: 0.15,
          phos: 0.35,
          sed: 0.4,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'E',
          appType: 'EX',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Conservation TIllage 2 (>= 60% Residue)',
          type: 'exclusive',
          value: 'Conservation TIllage 2 (>= 60% Residue)',
          nit: 0.25,
          phos: 0.68,
          sed: 0.77,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          redFunc: 'E',
          appType: 'EX',
          area_percent: 0,
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Contour Farming',
          type: 'exclusive',
          value: 'Contour Farming',
          nit: 0.27,
          phos: 0.39,
          sed: 0.34,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'E',
          appType: 'EX',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Terrace',
          type: 'exclusive',
          value: 'Terrace',
          nit: 0.25,
          phos: 0.3,
          sed: 0.4,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'E',
          appType: 'EX',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Overlapping BMPs',
          type: 'title',
          nit: 0,
          phos: 0,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          style: '',
          color: 'color: black; font-weight: bold;'
        },
        {
          label: 'Bioreactor',
          type: 'overlapping',
          value: 'Bioreactor',
          nit: 0.45,
          phos: 0,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Controlled Drainage',
          type: 'overlapping',
          value: 'Controlled Drainage',
          nit: 0.38,
          phos: 0.35,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Cover Crop 1 (Group A Commodity) (High Till only for Sediment)',
          type: 'overlapping',
          value: 'Cover Crop 1 (Group A Commodity) (High Till only for Sediment)',
          nit: 0.008,
          phos: 0,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label:
            'Cover Crop 2 (Group A Traditional Normal Planting Time) (High Till only for TP and Sediment)',
          type: 'overlapping',
          value:
            'Cover Crop 2 (Group A Traditional Normal Planting Time) (High Till only for TP and Sediment)',
          nit: 0.19,
          phos: 0.07,
          sed: 0.1,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label:
            'Cover Crop 3 (Group A Traditional Early Planting Time) (High Till only for TP and Sediment)',
          type: 'overlapping',
          value:
            'Cover Crop 3 (Group A Traditional Early Planting Time) (High Till only for TP and Sediment)',
          nit: 0.2,
          phos: 0.15,
          sed: 0.2,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Nutrient Management 1 (Determined Rate)',
          type: 'overlapping',
          value: 'Nutrient Management 1 (Determined Rate)',
          nit: 0.15,
          phos: 0.45,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Nutrient Management 2 (Determined Rate Plus Additional Considerations)',
          type: 'overlapping',
          value: 'Nutrient Management 2 (Determined Rate Plus Additional Considerations)',
          nit: 0.24,
          phos: 0.56,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Two-Stage Ditch',
          type: 'overlapping',
          value: 'Two-Stage Ditch',
          nit: 0.12,
          phos: 0.28,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Grazing Land Management (Rotational Grazing with Fenced Areas)',
          type: 'overlapping',
          value: 'Grazing Land Management (Rotational Grazing with Fenced Areas)',
          nit: 0.43,
          phos: 0.26,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Heavy Use Area Protection',
          type: 'overlapping',
          value: 'Heavy Use Area Protection',
          nit: 0.18,
          phos: 0.19,
          sed: 0.33,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Litter Storage and Management',
          type: 'overlapping',
          value: 'Litter Storage and Management',
          nit: 0.14,
          phos: 0.14,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Livestock Exclusion Fencing',
          type: 'overlapping',
          value: 'Livestock Exclusion Fencing',
          nit: 0.2,
          phos: 0.3,
          sed: 0.62,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Prescribed Grazing',
          type: 'overlapping',
          value: 'Prescribed Grazing',
          nit: 0.4,
          phos: 0.22,
          sed: 0.33,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Steambank Protection w/o Fencing',
          type: 'overlapping',
          value: 'Steambank Protection w/o Fencing',
          nit: 0.15,
          phos: 0.22,
          sed: 0.57,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Steambank Stabilization and Fencing',
          type: 'overlapping',
          value: 'Steambank Stabilization and Fencing',
          nit: 0.75,
          phos: 0.75,
          sed: 0.75,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        },
        {
          label: 'Use Exclusion',
          type: 'overlapping',
          value: 'Use Exclusion',
          nit: 0.39,
          phos: 0.04,
          sed: 0.58,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          color: 'color: blue; margin-left: 20px'
        }
      ]
    }
  },
  computed: {
    bmpSelect: {
      get() {
        return this.$store.state.bmpSelect
      },
      set(value) {
        this.$store.commit('updateBmpSelect', value)
      }
    },
    lastBmp: {
      get() {
        return this.$store.state.lastBmp
      },
      set(value) {
        this.$store.commit('updateLastBmp', value)
      }
    },
    totalNewLoadNit: {
      get() {
        return this.$store.state.totalNewLoadNit
      },
      set(value) {
        this.$store.commit('updateTotalNewLoadNit', value)
      }
    },
    totalNewLoadPhos: {
      get() {
        return this.$store.state.totalNewLoadPhos
      },
      set(value) {
        this.$store.commit('updateTotalNewLoadPhos', value)
      }
    },
    totalNewLoadSed: {
      get() {
        return this.$store.state.totalNewLoadSed
      },
      set(value) {
        this.$store.commit('updateTotalNewLoadSed', value)
      }
    },
    totalReducedPercentNit: {
      get() {
        return this.$store.state.totalReducedPercentNit
      },
      set(value) {
        this.$store.commit('updateTotalReducedPercentNit', value)
      }
    },
    totalReducedPercentPhos: {
      get() {
        return this.$store.state.totalReducedPercentPhos
      },
      set(value) {
        this.$store.commit('updateTotalReducedPercentPhos', value)
      }
    },
    totalReducedPercentSed: {
      get() {
        return this.$store.state.totalReducedPercentSed
      },
      set(value) {
        this.$store.commit('updateTotalReducedPercentSed', value)
      }
    },
    printMap() {
      return this.$store.state.printMap
    },
    initLoadData() {
      return this.$store.state.initLoadData
    },
    reportCropTables: {
      get() {
        return this.$store.state.reportCropTables
      },
      set(value) {
        this.$store.commit('updateReportCropTables', value)
      }
    }
  },
  props: {
    id: { type: Number },
    crop: { type: Object }
  },
  components: { bmpFullComponent },
  methods: {
    removeBmp(array) {
      console.log(array)

      let num = -1
      const val = array[0]
      const crop = array[1]

      console.log(val)
      console.log(crop)
      console.log(this.bmpOptions)

      this.bmpOptions.forEach((a) => {
        // if (val.type == 'full') {
        //   if (a.type !== 'title') {
        //     a.disable = false;
        //   }
        // } else if (val.type == 'defined') {
        //   if (a.type == 'full' || a.type == 'defined') {
        //     if (a.type !== 'title') {
        //       a.disable = false;
        //     }
        //   }
        // } else if (
        //   this.lastBMP.type == 'exclusive' ||
        //   this.lastBMP.type == 'overlapping'
        // ) {
        //   if (a.disable == true) {
        //     a.disable = true;
        //   } else if (a.disable == false) {
        //     a.disable == false;
        //   }
        // }
        if (val == a) {
          a.disable = false
        }
      })

      this.bmpSelect.forEach((bmp, index) => {
        if (bmp.value == val.value) {
          num = index
          bmp.toggled = false
        }
        bmp.disable = false
      })
      this.bmpSelect.splice(num, 1)

      crop.bmpLength = this.bmpSelect.length

      this.$store.dispatch('buildNrcsStore', [this.bmpSelect, crop])

      this.toggledOff = !this.toggledOff
    },
    toggleBmp(array) {
      const val = array[0]
      const crop = array[1]
      let toggledBmps = []

      this.toggledOff = !this.toggledOff

      if (val.toggled == false) {
        val.toggled = true
      } else if (val.toggled == true) {
        val.toggled = false
      }

      this.bmpSelect.forEach((bmp) => {
        if (bmp.toggled == true) {
          toggledBmps.push(bmp)
        }
      })

      this.$store.dispatch('buildNrcsStore', [toggledBmps, crop])
    },
    startBuild(val, crop) {
      this.bmpSelect = val
      crop.bmpLength = this.bmpSelect.length

      console.log(this.initLoadData)

      if (crop.bmps.includes(this.bmpSelect) == false) {
        crop.bmps.push(this.bmpSelect)
      }

      console.log(this.bmpSelect)
      console.log(this.initLoadData)

      this.$store.dispatch('buildNrcsStore', [this.bmpSelect, crop])
    }
  },
  watch: {
    bmpSelect() {
      this.bmpOptions.forEach((a) => {
        if (this.lastBmp.label == a.label) {
          a.disable = true
        }
        if (this.lastBmp.type == 'full') {
          a.disable = true
        } else if (this.lastBmp.type == 'defined') {
          if (a.type == 'full' || a.type == 'defined') {
            a.disable = true
          }
        } else if (this.lastBmp.type == 'exclusive' || this.lastBmp.type == 'overlapping') {
          if (a.disable == true) {
            a.disable = true
          } else if (a.disable == false) {
            a.disable == false
          }
        }
      })

      this.lastBmp = {}
    }
  }
}
</script>
