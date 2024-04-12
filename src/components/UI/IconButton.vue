<template>
  <q-btn
    :style="iconInfo.style"
    round
    class="shadow-2"
    :color="iconInfo.color"
    text-color="primary"
    :padding="iconInfo.padding"
    :icon="iconInfo.icon"
    @click="$emit(method)"
    :size="iconInfo.size"
  >
    <tool-tip
      v-if="iconInfo.tooltip"
      :text="iconInfo.tooltip"
      :delay="400"
    ></tool-tip>
  </q-btn>
</template>
<script>
import ToolTip from './Tooltip.vue';
export default {
  components: {
    ToolTip,
  },
  props: {
    method: { type: String },
    type: { type: String },
    otherTooltip: { type: String, required: false },
  },
  computed: {
    // This is where icons are chosen for the button, including their size, positioning, and tooltip.
    iconInfo() {
      let icon = '';
      let size = '';
      let padding = '';
      let tooltip = '';
      let style = 'height: 25px; width: 25px;';
      let color = '';
      // info icon
      if (this.type === 'info') {
        icon = 'fas fa-info';
        size = '9pt';
        padding = '1px';
        tooltip = 'Info';
      }
      if (this.type === 'infoSample') {
        icon = 'fas fa-info';
        size = '7pt';
        padding = '0px';
        style = 'height: 20px; width: 20px;';
      }
      // close icon
      if (this.type === 'close') {
        icon = 'fas fa-times';
        size = '11pt';
        padding = '0px';
        tooltip = 'Close';
      }
      // show columns
      if (this.type === 'columns') {
        icon = 'far fa-table-layout';
        size = '8pt';
        padding = 'none';
        tooltip = 'Columns';
      }
      // download file
      if (this.type === 'download') {
        icon = 'far fa-file-arrow-down';
        size = '8pt';
        padding = 'none';
        tooltip = 'Download';
      }
      // open report
      if (this.type === 'openReport') {
        icon = 'fas fa-arrow-up-right-from-square';
        size = '8pt';
        padding = 'none';
        tooltip = 'Open Report';
      }
      // filter
      if (this.type === 'filter') {
        icon = 'fas fa-magnifying-glass';
        size = '7pt';
        padding = 'none';
        tooltip = 'Filter Property';
      }
      // edit
      if (this.type == 'edit') {
        icon = 'far fa-pen-to-square';
        size = '8pt';
        padding = '5px';
        tooltip = 'Edit';
      }
      // add user
      if (this.type === 'addUser') {
        icon = 'fas fa-user-plus';
        size = '6pt';
        padding = '5px';
        tooltip = 'Add Users';
      }
      // add activity
      if (this.type === 'addActivity') {
        icon = 'far fa-message-plus';
        size = '7pt';
        padding = '5px';
        tooltip = 'Add Activity';
      }
      // collapse exansion items
      if (this.type === 'collapse') {
        icon = 'fas fa-chevron-up';
        size = '10pt';
        padding = '4px';
        tooltip = 'Collapse Report';
      }
      // handle other tooltip
      if (this.otherTooltip) {
        tooltip = this.otherTooltip;
        if (this.otherTooltip === 'none') {
          tooltip = false;
        }
      }
      // email
      if (this.type === 'email') {
        icon = 'far fa-envelope';
        size = '9pt';
        padding = '1px';
        tooltip = 'Get emails';
      }
      if (this.type === 'resilience') {
        icon = 'fal fa-circle-r';
        size = '8pt';
        padding = '0px';
        tooltip = 'May qualify for Resilience Credits';
        style = 'border:none; cursor:default; top:-2px; margin: 2px;';
        color = 'amber-4';
      }
      if (this.type === 'blue') {
        icon = 'fal fa-circle-b';
        size = '8pt';
        padding = '0px';
        tooltip = 'May qualify for Blue Carbon Credits';
        style = 'border:none; cursor:default; top:-2px;';
        color = 'blue-4';
      }
      return { icon, size, padding, tooltip, style, color };
    },
  },
};
</script>
