<template>
  <div>
    <h4 :style="{ marginBottom: '20px' }">{{ title }}</h4>
    <v-chart
      height="200"
      :data="data"
      :forceFit="true"
      :padding="['auto', 'auto', '40', '0']"
    >
      <v-tooltip />
      <v-axis />
      <v-bar :position="position" :color="colorGroup" :adjust="adjust" />
    </v-chart>
  </div>
</template>

<script>
export default {
  name: 'Bar',
  props: {
    title: {
      type: String,
      default: ''
    },
    data: {
      type: Array,
      default: () => {
        return []
      }
    },
    position: {
      type: String,
      default: ''
    },
    // 用哪个字段来分色
    colorGroup: {
      type: String,
      default: ''
    },
    adjust: {
      type: Array,
      default: () => {
        return []
      }
    },
    axis: {
      type: Object,
      default: () => {
        return {
          y: false
        }
      }
    },
    scale: {
      type: Array,
      default: () => {
        return []
      }
    },
    tooltip: {
      type: Array,
      default: () => {
        return [
          'x*y',
          (x, y) => ({
            name: x,
            value: y
          })
        ]
      }
    }
  },
  data() {
    return {
    }
  }
}
</script>
