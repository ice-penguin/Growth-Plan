<template>
  <a-popconfirm
    :okText="confirmBtnText"
    :placement="placement"
    @confirm="() => callBack()"
  >
    <template slot="title">
      <div :style="{ 'width': boxWidth}">{{ innerText }}</div>
    </template>
    <template v-if="isButton">
      <a-button :type="btnType">{{ eventName }}</a-button>
    </template>
    <template v-else>
      <a>{{ eventName }}</a>
    </template>
  </a-popconfirm>
</template>

<script>
export default {
  name: '',
  props: {
    // 气泡内容
    innerText: {
      type: String,
      required: true
    },
    // 事件名称
    eventName: {
      type: String,
      required: true
    },
    // 确定按钮文字
    confirmBtnText: {
      type: String,
      default: '继续'
    },
    // 气泡位置
    placement: {
      type: String,
      default: 'topRight'
    },
    // 气泡宽度
    boxWidth: {
      type: String,
      default: 'auto'
    },
    // 是否为按钮
    isButton: {
      type: Boolean,
      default: false
    },
    // 按钮类型
    btnType: {
      type: String,
      default: 'primary'
    }
  },
  data() {
    return {
    }
  },

  methods: {
    // 气泡回调
    callBack() {
      this.$emit('confirm')
    }
  }
}
</script>

<style lang='less' scoped>
</style>
