<template>
  <div>
    <!-- first page -->
    <div>
      <div class="text-bold text-center">
        NRCS Conservation Delivery Application
        <icon-button
          v-if="!resourceVis"
          type="info"
          method="show-resource"
          @show-resource="resourceVis = true"
          style="margin: 10px"
        ></icon-button>
        <icon-button
          v-if="resourceVis"
          type="close"
          method="hide-resource"
          @hide-resource="resourceVis = false"
          style="margin: 10px"
        ></icon-button>
      </div>
      <div v-if="resourceVis === true">
        <a
          href="https://nascience.s3.us-west-1.amazonaws.com/apps/nrcs-la-cda-app/CDA+User+Manual.pdf"
          target="_blank"
          >CDA User Manual</a
        >
        <br />
        <a
          href="https://nascience.s3.us-west-1.amazonaws.com/apps/nrcs-la-cda-app/ConservationDeliveryApp_MethodsOverview.pdf"
          target="_blank"
          >Methods Document</a
        >
      </div>
      <hr />
      <div v-if="this.mngmtVis === false && this.loadingVis === false">
        <p>
          Welcome to the NRCS Conservation Delivery Application. Use this tool
          to Calculate nutrient and sediment loads and test Best Management
          Practice applications. Begin by selecting a scale for your analysis:
          Resource Unit (RU), 12-digit hydrologic unit (HUC 12), catchment or
          Agricultural field.
        </p>
        <div>
          <p class="text-bold">Reference Layers:</p>
          <div class="q-ma-md">
            <q-option-group
              v-model="reference"
              :options="scaleOptions"
              color="primary"
              dense
              style="margin-right: 5px; display: flex"
            />
          </div>
        </div>
        <p>
          Click the map to select up to <b>five</b> analysis units from your
          selected scale. Constituent loads can only be calculated within
          features that contain agricultural fields. Click “Select Best
          Management Practices to calculate original loads and begin applying
          BMPs.
        </p>
        <div>
          <p class="text-bold">Scale:</p>
          <div class="q-my-md q-ma-auto" style="left: 5px; position: relative">
            <q-option-group
              v-model="this.scale"
              :options="layerOptions"
              color="primary"
              dense
              style="display: flex"
            />
          </div>
        </div>
        <div
          class="selected-units text-bold q-pa-sm q-my-md"
          style="width: fit-content; margin: auto"
        >
          Selected Units:
          <div style="display: grid">
            <q-chip
              id="unit-chip"
              removable
              v-for="unit in unitSelection"
              :key="unit"
              :label="'ID: ' + unit[0]"
              @remove="unitRemoved(unit)"
            />
          </div>
        </div>
        <q-btn
          color="primary"
          style="margin: 10px auto 10px auto; display: block"
          @click="selectManagementPractices()"
          :disable="this.unitLength > 0 ? false : true"
        >
          Select Management Practices
        </q-btn>
      </div>
    </div>
    <!-- Loading Page -->
    <div
      v-if="this.loadingVis === true && this.mngmtVis === false"
      style="margin: auto; width: fit-content"
    >
      <q-circular-progress
        indeterminate
        rounded
        size="50px"
        color="primary"
        style="margin: auto; width: fit-content; display: block"
      />
      <br />
      <p><b>Retrieving data...</b></p>
    </div>
    <!-- second page -->
    <div v-if="this.mngmtVis === true && this.loadingVis === false">
      <div>
        <div style="display: flex; justify-content: space-between;">
          <q-btn class="q-ma-sm" color="primary" @click="backButton()"
            >Back</q-btn
          >
          <q-btn class="q-ma-sm" color="primary" @click="adjustMap()">
            Build Report
          </q-btn>
        </div>
        <div class="text-h5 text-center">
          All Load Sources -
          {{ this.totalCropArea }}
          acres
        </div>
        <div>
          <!-- table -->
          <table class="total-table" style="">
            <tr>
              <th class="total-cell"></th>
              <th class="total-cell">Nit</th>
              <th class="total-cell">Phos</th>
              <th class="total-cell">Sed</th>
            </tr>
            <tr>
              <th class="total-cell">Initial Load (MT/yr):</th>
              <td class="total-cell">
                {{
                  this.totalNitr.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })
                }}
              </td>
              <td class="total-cell">
                {{
                  this.totalPhos.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })
                }}
              </td>
              <td class="total-cell">
                {{
                  this.totalSed.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })
                }}
              </td>
            </tr>
            <tr>
              <th class="total-cell">New Load (MT/yr):</th>
              <td class="total-cell">
                {{
                  this.totalNewLoadNit.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })
                }}
              </td>
              <td class="total-cell">
                {{
                  this.totalNewLoadPhos.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })
                }}
              </td>
              <td class="total-cell">
                {{
                  this.totalNewLoadSed.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })
                }}
              </td>
            </tr>
            <tr>
              <th class="total-cell">Reduction:</th>
              <td class="total-cell">{{ this.totalReducedPercentNit }}%</td>
              <td class="total-cell">{{ this.totalReducedPercentPhos }}%</td>
              <td class="total-cell">{{ this.totalReducedPercentSed }}%</td>
            </tr>
          </table>
        </div>
      </div>

      <hr />
      <!-- <div v-if="this.finalLayer === 'NRCS Resource Units'"> -->
      <div v-for="crop in this.initLoadData" :key="crop">
        <q-expansion-item
          :label="
            crop.label + ' ' + '-' + ' ' + crop.acres.toFixed(2) + ' ' + 'acres'
          "
          v-if="this.nonCrop.includes(crop.label) == false"
          expand-separator
          switch-toggle-side
          class="q-my-sm shadow-1"
          style="border: 1px solid #ccc; border-radius: 3px"
        >
          <template v-slot:header>
            <q-item-section>
              {{ crop.label }} - {{ crop.acres.toFixed(2) }} acres
            </q-item-section>
            <q-item-section side>
              <q-chip
                v-if="crop.bmpLength !== 0"
                v-model="chipModel"
                @update="alterChips(crop)"
                :label="crop.bmpLength"
                color="green"
              ></q-chip>
              <q-chip
                v-if="crop.bmpLength == 0"
                v-model="chipModel"
                @update="alterChips(crop)"
                :label="crop.bmpLength"
                color="grey-3"
              ></q-chip>
            </q-item-section>
          </template>
          <table class="crop-table">
            <tr>
              <th class="crop-cell"></th>
              <th class="crop-cell">Nit</th>
              <th class="crop-cell">Phos</th>
              <th class="crop-cell">Sed</th>
            </tr>
            <tr>
              <th class="crop-cell">Initial Load (MT/yr):</th>
              <td class="crop-cell">{{ crop.nitr.toFixed(2) }}</td>
              <td class="crop-cell">{{ crop.phos.toFixed(2) }}</td>
              <td class="crop-cell">{{ crop.sed.toFixed(2) }}</td>
            </tr>
            <tr>
              <th class="crop-cell">New Load (MT/yr):</th>
              <td class="crop-cell">{{ crop.newNitr }}</td>
              <td class="crop-cell">{{ crop.newPhos }}</td>
              <td class="crop-cell">{{ crop.newSed }}</td>
            </tr>
            <tr>
              <th class="crop-cell">Reduction:</th>
              <td class="crop-cell">{{ crop.nitrReducPercent }} %</td>
              <td class="crop-cell">{{ crop.phosReducPercent }} %</td>
              <td class="crop-cell">{{ crop.sedReducPercent }} %</td>
            </tr>
          </table>

          <bmp-select-component
            :id="crop.bmp"
            :crop="crop"
          ></bmp-select-component>
        </q-expansion-item>
      </div>
      <!-- <div style="display: flex; width: fit-content; margin: auto"> -->
      <!-- <q-btn class="q-ma-sm" color="primary" @click="backButton()"
          >Back</q-btn
        > -->
      <!-- <q-btn class="q-ma-sm" color="primary" @click="adjustMap()"
          >Build Report</q-btn
        > -->
      <!-- </div> -->
    </div>
    <!-- Page where report creation is initiated -->
    <!-- <div></div> -->
  </div>
</template>

<script>
import IconButton from '../UI/IconButton.vue';
// import bmpFullComponent from '../UI/bmpFullComponent.vue';
import bmpSelectComponent from '../UI/bmpSelectComponent.vue';

export default {
  name: 'louisiana-cda',
  components: { IconButton, bmpSelectComponent },
  data() {
    return {
      resourceVis: false,
      scaleOptions: [
        { label: 'Agricultural Fields', value: 'Agricultural Fields' },
        { label: 'Poultry Production', value: 'Poultry Production' },
        { label: 'Dairy Production', value: 'Dairy Production' },
      ],
      layerOptions: [
        { label: 'Resource Units', value: 'NRCS Resource Units' },
        { label: 'HUC 12', value: '12-Digit Hydrologic Units' },
        { label: 'Catchments', value: 'Catchments' },
        { label: 'Agricultural Fields', value: 'Field Boundaries' },
      ],
      reference: 'Agricultural Fields',
      finalData: [],
      allSourcesTable: [],
      cropComponents: {},
      cropsFinalData: [],
      cropData: {},
      bmpSelect: [],
      bmpComponents: [],
      bmpOptions: [
        {
          label: 'Load Source Change BMPs (Full Coverage)',
          type: 'title',
          disable: true,
          nit: 0,
          phos: 0,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          style: '',
          color: 'color: black',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
        },
        {
          label: 'Load Source Change BMPs (Defined Area)',
          type: 'title',
          disable: true,
          nit: 0,
          phos: 0,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          color: 'color: black',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
        },
        {
          label: 'Exclusive BMPs',
          type: 'title',
          disable: true,
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
          color: 'color: black',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
        },
        {
          label: 'Overlapping BMPs',
          type: 'title',
          disable: true,
          nit: 0,
          phos: 0,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          style: '',
          color: 'color: black',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
        },
        {
          label:
            'Cover Crop 1 (Group A Commodity) (High Till only for Sediment)',
          type: 'overlapping',
          value:
            'Cover Crop 1 (Group A Commodity) (High Till only for Sediment)',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
        },
        {
          label:
            'Nutrient Management 2 (Determined Rate Plus Additional Considerations)',
          type: 'overlapping',
          value:
            'Nutrient Management 2 (Determined Rate Plus Additional Considerations)',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
        },
        {
          label:
            'Grazing Land Management (Rotational Grazing with Fenced Areas)',
          type: 'overlapping',
          value:
            'Grazing Land Management (Rotational Grazing with Fenced Areas)',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
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
          disable: false,
          color: 'color: blue',
        },
      ],
      cropNewLoadNit: 0,
      cropNewLoadPhos: 0,
      cropNewLoadSed: 0,
      finalLayer: '',
      lscBMP: [],
      exBMP: [],
      ovBMP: [],
      nonCrop: [
        'Background',
        'Barren',
        'Deciduous Forest',
        'Evergreen Forest',
        'Herbaceous Wetlands',
        'Mixed Forest',
        'Open Water',
        'Shrubland',
        'Woody Wetlands',
        'Developed/Open Space',
        'Developed/Med Intensity',
        'Developed/Low Intensity',
        'Developed/High Intensity',
        'Aquaculture',
      ],
      groupedObjects: [],
      htmlCode: null,
      cropLabel: '',
      lsc_length: 0,
      ex_length: 0,
      ov_length: 0,
      lastBMPLabel: '',
      lastCrop: '',
      aa: '',
      totalsCalculated: false,
      chipModel: true,
      chipActive: false,
    };
  },
  computed: {
    layerSelection: {
      get() {
        return this.$store.state.layerSelection;
      },
      set(value) {
        this.$store.commit('updateLayerSelection', value);
      },
    },
    referenceSelection: {
      get() {
        return this.$store.state.referenceSelection;
      },
      set(value) {
        this.$store.commit('updateReferenceSelection', value);
      },
    },
    unitSelection: {
      get() {
        return this.$store.state.unitSelection;
      },
      set(value) {
        this.$store.commit('updateUnitSelection', value);
      },
    },
    unitLength() {
      return this.$store.state.unitLength;
    },
    loadingVis: {
      get() {
        return this.$store.state.loadingVis;
      },
      set(value) {
        this.$store.commit('updateLoadingVis', value);
      },
    },
    mngmtVis: {
      get() {
        return this.$store.state.mngmtVis;
      },
      set(value) {
        this.$store.commit('updateMngmtVis', value);
      },
    },
    endLoading() {
      return this.$store.state.endLoading;
    },
    resourceUnits: {
      get() {
        return this.$store.state.resourceUnits;
      },
      set(value) {
        this.$store.commit('updateResourceUnits', value);
      },
    },
    hucUnits: {
      get() {
        return this.$store.state.hucUnits;
      },
      set(value) {
        this.$store.commit('updateHucUnits', value);
      },
    },
    catchUnits: {
      get() {
        return this.$store.state.catchUnits;
      },
      set(value) {
        this.$store.commit('updateCatchUnits', value);
      },
    },
    fieldUnits: {
      get() {
        return this.$store.state.fieldUnits;
      },
      set(value) {
        this.$store.commit('updateFieldUnits', value);
      },
    },
    dataComplete() {
      return this.$store.state.dataComplete;
    },
    cropNames() {
      return Object.keys(this.cropComponents);
    },
    totalNitr: {
      get() {
        return this.$store.state.totalNitr;
      },
      set(value) {
        this.$store.commit('updateTotalNitr', value);
      },
    },
    totalPhos: {
      get() {
        return this.$store.state.totalPhos;
      },
      set(value) {
        this.$store.commit('updateTotalPhos', value);
      },
    },
    totalSed: {
      get() {
        return this.$store.state.totalSed;
      },
      set(value) {
        this.$store.commit('updateTotalSed', value);
      },
    },
    totalCropArea: {
      get() {
        return this.$store.state.totalCropArea;
      },
      set(value) {
        this.$store.commit('updateTotalCropArea', value);
      },
    },
    startReport: {
      get() {
        return this.$store.state.startReport;
      },
      set(value) {
        this.$store.commit('updateStartReport', value);
      },
    },
    backBtn: {
      get() {
        return this.$store.state.backBtn;
      },
      set(value) {
        this.$store.commit('updateBackBtn', value);
      },
    },
    count: {
      get() {
        return this.$store.state.count;
      },
      set(value) {
        this.$store.commit('updateCount', value);
      },
    },
    unitIndex: {
      get() {
        return this.$store.state.unitIndex;
      },
      set(value) {
        this.$store.commit('updateUnitIndex', value);
      },
    },
    toggledOff: {
      get() {
        return this.$store.state.toggledOff;
      },
      set(value) {
        this.$store.commit('updateToggledOff', value);
      },
    },
    reportTotalTable: {
      get() {
        return this.$store.state.reportTotalTable;
      },
      set(value) {
        this.$store.commit('updateReportTotalTable', value);
      },
    },
    reportCropTables: {
      get() {
        return this.$store.state.reportCropTables;
      },
      set(value) {
        this.$store.commit('updateReportCropTables', value);
      },
    },
    totalNewLoadNit: {
      get() {
        return this.$store.state.totalNewLoadNit;
      },
      set(value) {
        this.$store.commit('updateTotalNewLoadNit', value);
      },
    },
    totalNewLoadPhos: {
      get() {
        return this.$store.state.totalNewLoadPhos;
      },
      set(value) {
        this.$store.commit('updateTotalNewLoadPhos', value);
      },
    },
    totalNewLoadSed: {
      get() {
        return this.$store.state.totalNewLoadSed;
      },
      set(value) {
        this.$store.commit('updateTotalNewLoadSed', value);
      },
    },
    totalReducedPercentNit: {
      get() {
        return this.$store.state.totalReducedPercentNit;
      },
      set(value) {
        this.$store.commit('updateTotalReducedPercentNit', value);
      },
    },
    totalReducedPercentPhos: {
      get() {
        return this.$store.state.totalReducedPercentPhos;
      },
      set(value) {
        this.$store.commit('updateTotalReducedPercentPhos', value);
      },
    },
    totalReducedPercentSed: {
      get() {
        return this.$store.state.totalReducedPercentSed;
      },
      set(value) {
        this.$store.commit('updateTotalReducedPercentSed', value);
      },
    },
    printMap: {
      get() {
        return this.$store.state.printMap;
      },
      set(value) {
        this.$store.commit('updatePrintMap', value);
      },
    },
    initLoadData: {
      get() {
        return this.$store.state.initLoadData;
      },
      set(value) {
        this.$store.commit('updateInitLoadData', value);
      },
    },
    areaChanged: {
      get() {
        return this.$store.state.areaChanged;
      },
      set(value) {
        this.$store.commit('updateAreaChanged', value);
      },
    },
    bmpAltered: {
      get() {
        return this.$store.state.bmpAltered;
      },
      set(value) {
        this.$store.commit('updateBmpAltered', value);
      },
    },
    areaApplied: {
      get() {
        return this.$store.state.areaApplied;
      },
      set(value) {
        this.$store.commit('updateAreaApplied', value);
      },
    },
    lastBMP: {
      get() {
        return this.$store.state.setBuildNrcsStore.lastBMP;
      },
      set(value) {
        this.$store.commit('updateLastBMP', value);
      },
    },
    highlighted: {
      get() {
        return this.$store.state.highlighted;
      },
      set(value) {
        this.$store.commit('updateHighlighted', value);
      },
    },
    widgetVis: {
      get() {
        return this.$store.state.widgetVis;
      },
      set(value) {
        this.$store.commit('updateWidgetVis', value);
      },
    },
    totalSelectBmps() {
      return this.$store.state.totalSelectBmps;
    },
    scale: {
      get() {
        return this.$store.state.scale;
      },
      set(value) {
        this.$store.commit('updateScale', value);
      },
    },
    consolidated: {
      get() {
        return this.$store.state.consolidated;
      },
      set(value) {
        this.$store.commit('updateConsolidated', value);
      },
    },
  },
  methods: {
    buildNrcs(array) {
      this.$store.dispatch('buildNrcsStore', [array[0], array[1]]);
    },
    backButton() {
      this.mngmtVis = false;
      this.loadingVis = false;
      this.count = 0;
      this.consolidated = [];
      this.totalCropArea = 0;
      // this.$store.commit('updateTotalCropArea', 0);
      this.totalNitr = 0;
      this.totalPhos = 0;
      this.totalSed = 0;
      this.initLoadData = [];
      this.resourceUnits = [];
      this.hucUnits = [];
      this.catchUnits = [];
      this.fieldUnits = [];
      this.totalNewLoadNit = 0;
      this.totalNewLoadPhos = 0;
      this.totalNewLoadSed = 0;
      this.totalReducedPercentNit = 0;
      this.totalReducedPercentPhos = 0;
      this.totalReducedPercentSed = 0;
    },
    unitRemoved(val) {
      this.unitIndex = this.unitSelection.indexOf(val);
      if (this.unitIndex !== -1) {
        this.unitSelection.splice(this.unitIndex, 1);
      }
      let tempHL = this.highlighted;
      tempHL.forEach((i, index) => {
        if (i === val[1]) {
          tempHL.splice(index, 1);
        }
      });
      this.highlighted = [];
      this.highlighted = tempHL;
    },
    consolidateData() {
      this.consolidated = [];
      this.$store.commit('updateTotalCropArea', 0);
      // console.log(this.totalCropArea);

      if (this.layerSelection === 'NRCS Resource Units') {
        this.resourceUnits.forEach((obj) => {
          const label = obj.label;
          if (!this.groupedObjects[label]) {
            this.groupedObjects[label] = {
              label,
              cAcres: 0,
              nitr: 0,
              phos: 0,
              sed: 0,
            };
          }
          this.groupedObjects[label].cAcres += obj.cAcres;
          this.groupedObjects[label].nitr += obj.nitr;
          this.groupedObjects[label].phos += obj.phos;
          this.groupedObjects[label].sed += obj.sed;
        });

        // console.log(this.groupedObjects);

        this.consolidated = Object.values(this.groupedObjects);
      } else if (this.layerSelection === '12-Digit Hydrologic Units') {
        this.consolidated = this.hucUnits;
        this.consolidated.forEach((obj) => {
          const label = obj.label;
          if (!this.groupedObjects[label]) {
            this.groupedObjects[label] = {
              label,
              cAcres: 0,
              nitr: 0,
              phos: 0,
              sed: 0,
            };
          }
          this.groupedObjects[label].cAcres += obj.cAcres;
          this.groupedObjects[label].nitr += obj.nitr;
          this.groupedObjects[label].phos += obj.phos;
          this.groupedObjects[label].sed += obj.sed;
        });

        console.log(this.groupedObjects);

        this.consolidated = Object.values(this.groupedObjects);
      } else if (this.layerSelection === 'Catchments') {
        this.consolidated = this.catchUnits;
        this.consolidated.forEach((obj) => {
          const label = obj.label;
          if (!this.groupedObjects[label]) {
            this.groupedObjects[label] = {
              label,
              cAcres: 0,
              nitr: 0,
              phos: 0,
              sed: 0,
            };
          }
          this.groupedObjects[label].cAcres += obj.cAcres;
          this.groupedObjects[label].nitr += obj.nitr;
          this.groupedObjects[label].phos += obj.phos;
          this.groupedObjects[label].sed += obj.sed;
        });

        console.log(this.groupedObjects);

        this.consolidated = Object.values(this.groupedObjects);
      } else if (this.layerSelection === 'Field Boundaries') {
        this.consolidated = this.fieldUnits;
        this.consolidated.forEach((obj) => {
          const label = obj.label;
          if (!this.groupedObjects[label]) {
            this.groupedObjects[label] = {
              label,
              cAcres: 0,
              nitr: 0,
              phos: 0,
              sed: 0,
            };
          }
          this.groupedObjects[label].cAcres += obj.cAcres;
          this.groupedObjects[label].nitr += obj.nitr;
          this.groupedObjects[label].phos += obj.phos;
          this.groupedObjects[label].sed += obj.sed;
        });

        console.log(this.groupedObjects);

        this.consolidated = Object.values(this.groupedObjects);
      }

      // let totalCAcres = this.consolidated.reduce((total, obj) => {
      //   return total + (obj.cAcres || 0);
      // }, 0);

      let tAcres = 0;

      this.consolidated.forEach((i) => {
        if (i.nitr) {
          this.totalNitr += parseFloat(i.nitr);
        }
        if (i.phos) {
          this.totalPhos += parseFloat(i.phos);
        }
        if (i.sed) {
          this.totalSed += parseFloat(i.sed);
        }
        if (i.cAcres) {
          tAcres += parseInt(i.cAcres);

          // this.totalCropArea = this.totalCropArea.toLocaleString('en-US', {
          //   maximumFractionDigits: 0,
          // });
        }
      });

      this.totalCropArea = tAcres;
    },
    adjustMap() {
      this.widgetVis = false;

      document.getElementById('map').classList.add('report-map');
      document.getElementById('map').style.margin = 'auto';
    },
    bmpActive(val) {
      let truth = false;

      val.bmps.forEach((bmp) => {
        if (bmp.toggled == true) {
          truth == true;
        }
      });

      return truth;
    },
    selectManagementPractices() {
      this.loadingVis = true;
      // this.consolidateData();
    },
    alterChips(crop) {
      console.log(crop);
    },
  },
  watch: {
    scale() {
      this.layerSelection = this.scale;
      this.finalLayer = this.scale;
    },
    reference() {
      this.referenceSelection = this.reference;
    },
    endLoading() {
      if (this.endLoading == true) {
        this.consolidateData();
        this.loadingVis = false;
        this.mngmtVis = true;
      }
    },
    initLoadData() {
      console.log(this.initLoadData);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#print-header {
  position: absolute;
  top: 0px;
  height: 30px;
}
#print-footer {
  position: absolute;
  bottom: 0px;
  height: 30px;
}
#print-map {
  position: absolute;
  top: 30px;
  height: 500px;
}
.selected-units {
  border: 1px solid black;
  border-radius: 4px;
}
.total-table,
.total-cell {
  border: 1px solid black;
  border-collapse: collapse;
  margin: 10px auto 10px auto;
  padding: 5px;
  width: auto;
}
.crop-table,
.crop-cell {
  border: 1px solid black;
  border-collapse: collapse;
  margin: 10px auto 10px auto;
  width: auto;
  padding: 2px 5px 2px 5px;
}
.q-item__label {
  margin-left: 30px;
}
</style>
