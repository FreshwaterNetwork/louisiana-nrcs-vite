const state = () => ({
  cropLabel: '',
  lastCrop: {},
  bmpSelect: [],
  lsc_length: 0,
  ex_length: 0,
  ov_length: 0,
});

const getters = {};

const mutations = {
  updateCropLabel: (state, val) => {
    state.cropLabel = val;
  },
  updateLastCrop: (state, val) => {
    state.lastCrop = val;
  },
  updateBmpSelect: (state, val) => {
    state.bmpSelect = val;
  },
  updateLsc_length(state, val) {
    state.lsc_length = val;
  },
  updateEx_length(state, val) {
    state.ex_length = val;
  },
  updateOv_length(state, val) {
    state.ov_length = val;
  },
};

const actions = {
  buildNrcsStore(context, array) {
    const val = array[0];
    const crop = array[1];

    let final = val[val.length - 1];

    // if (
    //   !context.rootState.bmpSelect.includes(final) &&
    //   !context.rootState.bmpAltered
    // ) {
    //   context.rootState.bmpSelect.push(final);
    // }

    if (final) {
      if (final.style == '') {
        final.style = crop.label;
      } else {
        final.style = crop.label;
      }

      if (
        context.rootState.totalSelectBmps.includes(final) == false &&
        final.toggled == true
      ) {
        context.rootState.totalSelectBmps.push(final);
      }
    }

    if (this.lastBMPLabel) {
      if (this.lastBMPLabel !== final.label) {
        this.lastBMPLabel = final.label;
      }
    }

    context.rootState.lastBmp = final;
    context.commit('updateCropLabel', crop.label);
    if (context.state.lastCrop !== crop) {
      context.commit('updateLastCrop', crop);
    }

    context.dispatch('calculateReducedLoads', [val, crop]);
  },
  calculateTotals(context) {
    let selectedCrops = context.rootState.initLoadData;

    context.rootState.totalNewLoadNit = 0;
    context.rootState.totalNewLoadPhos = 0;
    context.rootState.totalNewLoadSed = 0;

    context.rootState.totalReducedPercentNit = 0;
    context.rootState.totalReducedPercentPhos = 0;
    context.rootState.totalReducedPercentSed = 0;

    selectedCrops.forEach((crop) => {
      // this.totalCropArea += parseInt(crop.cAcres);
      if (crop.nitr) {
        if (crop.newNitr > 0) {
          context.rootState.totalNewLoadNit += parseFloat(crop.newNitr);
        } else {
          context.rootState.totalNewLoadNit += parseFloat(crop.nitr);
        }
      }
      if (crop.phos) {
        if (crop.newPhos > 0) {
          context.rootState.totalNewLoadPhos += parseFloat(crop.newPhos);
        } else {
          context.rootState.totalNewLoadPhos += parseFloat(crop.phos);
        }
      }
      if (crop.sed) {
        if (crop.newSed > 0) {
          context.rootState.totalNewLoadSed += parseFloat(crop.newSed);
        } else {
          context.rootState.totalNewLoadSed += parseFloat(crop.sed);
        }
      }
    });

    context.rootState.totalReducedPercentNit = (
      ((context.rootState.totalNitr - context.rootState.totalNewLoadNit) /
        context.rootState.totalNitr) *
      100
    ).toFixed(0);

    context.rootState.totalReducedPercentPhos = (
      ((context.rootState.totalPhos - context.rootState.totalNewLoadPhos) /
        context.rootState.totalPhos) *
      100
    ).toFixed(0);

    context.rootState.totalReducedPercentSed = (
      ((context.rootState.totalSed - context.rootState.totalNewLoadSed) /
        context.rootState.totalSed) *
      100
    ).toFixed(0);

    context.rootState.totalsCalculated = true;
  },
  calculateReducedLoads(context, array) {
    const val = array[0];
    const crop = array[1];

    crop.newNitr = 0;
    crop.newPhos = 0;
    crop.newSed = 0;

    let lscBMP = [];
    let exBMP = [];
    let ovBMP = [];
    let bmp;

    if (context.rootState.bmpAltered) {
      bmp = context.rootState.bmpAltered;

      val.forEach((a, i) => {
        if (a.label === bmp.label) {
          val[i] = bmp;
        }
      });
    }

    val.forEach((bmpSel) => {
      if (bmpSel.toggled == true) {
        if (bmpSel.redFunc === 'LSC') {
          if (bmpSel.area_percent > 0 || bmpSel.lscFull) {
            lscBMP.push(bmpSel);
          }
        }
        if (
          bmpSel.appType === 'EX' &&
          bmpSel.redFunc !== 'LSC' &&
          bmpSel.area_percent > 0
        ) {
          exBMP.push(bmpSel);
        }
        if (bmpSel.appType === 'OV') {
          ovBMP.push(bmpSel);
        }
      }
    });

    context.state.lsc_length = lscBMP.length;
    context.state.ex_length = exBMP.length;
    context.state.ov_length = ovBMP.length;

    function calculateEXbmp(type, array) {
      let PTF = 0;
      let eff_value = 0;
      const areaApplied = context.rootState.areaApplied / 100;

      array.forEach((bmp, index) => {
        if (type === 'nit') {
          eff_value = bmp.nit;
        } else if (type === 'phos') {
          eff_value = bmp.phos;
        } else if (type === 'sed') {
          eff_value = bmp.sed;
        }
        const overallCropArea = context.state.lastCrop.acres;
        const crop_area_applied = areaApplied * context.state.lastCrop.acres;

        if (index === 0) {
          PTF = (crop_area_applied / overallCropArea) * eff_value;
        } else {
          PTF += (crop_area_applied / overallCropArea) * eff_value;
        }
      });

      PTF = 1 - PTF;
      return PTF;
    }
    function calculateOVbmp(type, array) {
      let PTF;
      let eff_value = 0;

      array.forEach((bmp, i) => {
        if (type === 'nit') {
          eff_value = bmp.nit;
        } else if (type === 'phos') {
          eff_value = bmp.phos;
        } else if (type === 'sed') {
          eff_value = bmp.sed;
        }

        if (i === 0) {
          PTF = parseFloat(1 - eff_value);
        } else {
          PTF *= parseFloat(1 - eff_value);
        }
      });

      return PTF;
    }
    function calculateLSCbmp1(type, array) {
      let bmp = array[0];
      let percentApplied = bmp.area_percent;
      // if (!percentApplied) {
      //   percentApplied = 0;
      // }
      let cropRows;
      let rpl_lsc = 0;

      context.rootState.initLoadData.forEach((row) => {
        if (row.label == context.state.cropLabel) {
          cropRows = row.cropRows;
        }
      });

      // console.log(context.rootState.initLoadData);

      // if (context.rootState.resourceUnits) {
      //   cropRows = context.rootState.initLoadData;
      // } else if (context.rootState.hucUnits) {
      //   cropRows = context.rootState.hucUnits;
      // } else if (context.rootState.catchUnits) {
      //   cropRows = context.rootState.catchUnits;
      // } else if (context.rootState.fieldUnits) {
      //   cropRows = context.rootState.fieldUnits;
      // }

      cropRows.forEach((cropRow) => {
        if (context.state.cropLabel === cropRow.label) {
          let emc_bmp_value = 0;
          let eff_value = 0;
          console.log(eff_value);
          let R = parseFloat(cropRow.runoff_in_yr);
          let r_factor_100_ton_acre = cropRow.rFactor;
          let k_factor = cropRow.k_factor;
          let cls_factor = cropRow.cls_factor;
          let c_bmp = bmp.cm_factor;
          let p_bmp = bmp.sp_factor;
          let applied_acres = percentApplied * parseFloat(cropRow.cAcres);

          if (type === 'nit') {
            emc_bmp_value = cropRow.nit_emc_value;
            eff_value = bmp.nit;

            rpl_lsc += emc_bmp_value * R * applied_acres * 0.000113;
          } else if (type === 'phos') {
            emc_bmp_value = cropRow.phos_emc_value;
            eff_value = bmp.phos;

            rpl_lsc += emc_bmp_value * R * applied_acres * 0.000113;
          } else if (type === 'sed') {
            rpl_lsc +=
              applied_acres *
              r_factor_100_ton_acre *
              k_factor *
              cls_factor *
              c_bmp *
              p_bmp;
          }
        }
      });

      return rpl_lsc;
    }
    function calculateLSCbmp2(type, array, PTF) {
      let bmp = array[0];
      let percentApplied = bmp.area_percent;
      let cropRows;
      let rpl_non_lsc = 0;

      context.rootState.initLoadData.forEach((row) => {
        if (row.label == context.state.cropLabel) {
          cropRows = row.cropRows;
        }
      });

      // if (context.rootState.resourceUnits) {
      //   cropRows = context.rootState.initLoadData;
      // } else if (context.rootState.hucUnits) {
      //   cropRows = context.rootState.hucUnits;
      // } else if (context.rootState.catchUnits) {
      //   cropRows = context.rootState.catchUnits;
      // } else if (context.rootState.fieldUnits) {
      //   cropRows = context.rootState.fieldUnits;
      // }

      cropRows.forEach((cropRow) => {
        if (context.state.cropLabel === cropRow.label) {
          let r_factor_100_ton_acre = cropRow.rFactor;
          let k_factor = cropRow.k_factor;
          let cls_factor = cropRow.cls_factor;
          let C = cropRow.c;
          let P = cropRow.p;

          let emc_crop_value = 0;
          let eff_value = 0;

          let R = parseFloat(cropRow.runoff_in_yr);
          let crop_area = cropRow.cAcres;

          if (type === 'nit') {
            emc_crop_value = cropRow.nit_emc_value;
            eff_value = bmp.nit;
            rpl_non_lsc +=
              emc_crop_value *
              R *
              (crop_area - percentApplied * crop_area) *
              (1 - eff_value) *
              PTF *
              0.000113;
          } else if (type === 'phos') {
            emc_crop_value = cropRow.phos_emc_value;
            eff_value = bmp.phos;
            rpl_non_lsc +=
              emc_crop_value *
              R *
              (crop_area - percentApplied * crop_area) *
              (1 - eff_value) *
              PTF *
              0.000113;
          } else if (type === 'sed') {
            eff_value = bmp.sed;
            rpl_non_lsc +=
              (crop_area - percentApplied * crop_area) *
              r_factor_100_ton_acre *
              k_factor *
              cls_factor *
              C *
              P *
              (1 - eff_value) *
              PTF;
          }
        }
      });

      return rpl_non_lsc;
    }

    // EX, OV, and LSC
    if (
      context.state.lsc_length > 0 &&
      context.state.ex_length > 0 &&
      context.state.ov_length > 0
    ) {
      // nitrogen
      let nit1 = calculateLSCbmp1('nit', lscBMP);
      let nit_PFO = calculateEXbmp('nit', exBMP) * calculateOVbmp('nit', ovBMP);
      let nit2 = calculateLSCbmp2('nit', lscBMP, nit_PFO);

      // phos
      let phos1 = calculateLSCbmp1('phos', lscBMP);
      let phos_PFO =
        calculateEXbmp('phos', exBMP) * calculateOVbmp('phos', ovBMP);
      let phos2 = calculateLSCbmp2('phos', lscBMP, phos_PFO);

      //sediment
      let sed1 = calculateLSCbmp1('sed', lscBMP);
      let sed_PFO = calculateEXbmp('sed', exBMP) * calculateOVbmp('sed', ovBMP);
      let sed2 = calculateLSCbmp2('sed', lscBMP, sed_PFO);

      crop.newNitr = nit1 + nit2;
      crop.newPhos = phos1 + phos2;
      crop.newSed = sed1 + sed2;
    }

    // OV and LSC
    if (
      context.state.lsc_length > 0 &&
      context.state.ov_length > 0 &&
      context.state.ex_length === 0
    ) {
      // calculate the OV bmp's first and use as the pass through factor for calculating the LSC bmp
      // nitrogen
      let nit1 = calculateLSCbmp1('nit', lscBMP);
      let nit_PFO = calculateOVbmp('nit', ovBMP);
      let nit2 = calculateLSCbmp2('nit', lscBMP, nit_PFO);
      // phos calcs
      let phos1 = calculateLSCbmp1('phos', lscBMP);
      let phos_PFO = calculateOVbmp('phos', ovBMP);
      let phos2 = calculateLSCbmp2('phos', lscBMP, phos_PFO);
      // sed calcs
      let sed1 = calculateLSCbmp1('sed', lscBMP);
      let sed_PFO = calculateOVbmp('sed', ovBMP);
      let sed2 = calculateLSCbmp2('sed', lscBMP, sed_PFO);

      crop.newNitr = nit1 + nit2;
      crop.newPhos = phos1 + phos2;
      crop.newSed = sed1 + sed2;
    }

    // EX and LSC
    if (
      context.state.ex_length > 0 &&
      context.state.lsc_length > 0 &&
      context.state.ov_length === 0
    ) {
      // calculate the OV bmp's first and use as the pass through factor for calculating the LSC bmp
      // nitrogen
      let nit1 = calculateLSCbmp1('nit', lscBMP);
      let nit_PFO = calculateEXbmp('nit', exBMP);
      let nit2 = calculateLSCbmp2('nit', lscBMP, nit_PFO);
      // phos calcs
      let phos1 = calculateLSCbmp1('phos', lscBMP);
      let phos_PFO = calculateEXbmp('phos', exBMP);
      let phos2 = calculateLSCbmp2('phos', lscBMP, phos_PFO);
      // sed calcs
      let sed1 = calculateLSCbmp1('sed', lscBMP);
      let sed_PFO = calculateEXbmp('sed', exBMP);
      let sed2 = calculateLSCbmp2('sed', lscBMP, sed_PFO);

      crop.newNitr = nit1 + nit2;
      crop.newPhos = phos1 + phos2;
      crop.newSed = sed1 + sed2;
    }

    // EX and OV - COMPLETE
    if (
      context.state.ex_length > 0 &&
      context.state.ov_length > 0 &&
      context.state.lsc_length === 0
    ) {
      crop.newNitr =
        crop.nitr * calculateEXbmp('nit', exBMP) * calculateOVbmp('nit', ovBMP);

      crop.newPhos =
        crop.phos *
        calculateEXbmp('phos', exBMP) *
        calculateOVbmp('phos', ovBMP);

      crop.newSed =
        crop.sed * calculateEXbmp('sed', exBMP) * calculateOVbmp('sed', ovBMP);
    }
    // LSC only - COMPLETE
    if (
      context.state.lsc_length > 0 &&
      context.state.ex_length === 0 &&
      context.state.ov_length === 0
    ) {
      // calc nit lsc reduced load
      let nit1 = calculateLSCbmp1('nit', lscBMP);
      let nit2 = calculateLSCbmp2('nit', lscBMP, 1);
      crop.newNitr = nit1 + nit2;

      // calc phos lsc reduced load
      let phos1 = calculateLSCbmp1('phos', lscBMP);
      let phos2 = calculateLSCbmp2('phos', lscBMP, 1);
      crop.newPhos = phos1 + phos2;

      // calc sed lsc reduced load
      let sed1 = calculateLSCbmp1('sed', lscBMP);
      let sed2 = calculateLSCbmp2('sed', lscBMP, 1);
      crop.newSed = sed1 + sed2;
    }

    // EX only - COMPLETE
    if (
      context.state.ex_length > 0 &&
      context.state.lsc_length === 0 &&
      context.state.ov_length === 0
    ) {
      crop.newNitr = crop.nitr * calculateEXbmp('nit', exBMP);
      crop.newPhos = crop.phos * calculateEXbmp('phos', exBMP);
      crop.newSed = crop.sed * calculateEXbmp('sed', exBMP);
    }
    // OV only - COMPLETE
    if (
      context.state.ov_length > 0 &&
      context.state.ex_length === 0 &&
      context.state.lsc_length === 0
    ) {
      crop.newNitr = crop.nitr * calculateOVbmp('nit', ovBMP);
      crop.newPhos = crop.phos * calculateOVbmp('phos', ovBMP);
      crop.newSed = crop.sed * calculateOVbmp('sed', ovBMP);
    }

    crop.newNitr = parseFloat(crop.newNitr).toFixed(2);
    if (crop.newNitr > 0) {
      crop.nitrReducPercent = (
        ((crop.nitr - crop.newNitr) / crop.nitr) *
        100
      ).toFixed(0);
    } else {
      crop.nitrReducPercent = 0;
    }

    crop.newPhos = parseFloat(crop.newPhos).toFixed(2);
    if (crop.newPhos > 0) {
      crop.phosReducPercent = (
        ((crop.phos - crop.newPhos) / crop.phos) *
        100
      ).toFixed(0);
    } else {
      crop.phosReducPercent = 0;
    }

    crop.newSed = parseFloat(crop.newSed).toFixed(2);
    if (crop.newSed > 0) {
      crop.sedReducPercent = (
        ((crop.sed - crop.newSed) / crop.sed) *
        100
      ).toFixed(0);
    } else {
      crop.sedReducPercent = 0;
    }

    context.rootState.bmpAltered = {};
    context.dispatch('calculateTotals');
    // context.dispatch('calculateTotals', [val, crop]);
  },
};

export default {
  state: state,
  getters: getters,
  mutations: mutations,
  actions: actions,
};
