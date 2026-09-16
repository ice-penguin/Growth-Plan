<template>
  <empty :style="style" :image="simpleImage" />
</template>

<script>
import { Empty } from 'ant-design-vue'
export default {
  components: {
    Empty
  },
  props: {
    padding: {
      type: Number,
      default: 32
    }
  },
  data() {
    return {
      style: {}
    }
  },
  created() {
    this.style = {
      margin: '0',
      padding: this.padding + 'px 0px'
    }
  },
  beforeCreate() {
    this.simpleImage = Empty.PRESENTED_IMAGE_SIMPLE
  }
}
</script>

<style lang='less' scoped>
</style>
