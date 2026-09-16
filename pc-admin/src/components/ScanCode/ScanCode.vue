<!--
 * @Author: jianxl
 * @LastEditors: yzy
 * @symbol_custom_string_obkoro1: I love coding
-->
<template>
  <a-modal
    :visible="isShow"
    centered
    :destroyOnClose="true"
    :closable="false"
    :footer="null"
    @ok="() => (modal2Visible = false)"
  >
    <a-alert
      v-show="isWaiting"
      message="请扫描用户二维码"
      type="info"
      show-icon
      closable
      @close="closeAlert"
    />
    <a-alert
      v-show="!isWaiting"
      :message="message"
      type="warning"
      show-icon
      closable
      @close="closeAlert"
    />
    <a-input
      v-if="isWaiting"
      class="auth-code"
      ref="myInput"
      v-model="auth_code"
      @pressEnter.stop="pressEnter"
    />
  </a-modal>
</template>
<script>
export default {
  name: 'ScanCode',
  props: {
    // 是否显示扫码组件
    isShow: {
      type: Boolean,
      default: false
    },
    // 解码中提示语
    message: {
      type: String,
      default: '支付中...'
    }
  },
  data() {
    return {
      // 是否是等待扫码 true: 等待扫码，false: 已扫码，正在支付
      isWaiting: true,
      timer: null,
      auth_code: ''
     }
  },
  watch: {
    btnsArr: {
      handler(newArr) {
        if (newArr && newArr.length > 0) {
          this.value = newArr[0].value
          this.choosedPayment = newArr[0]
          this.$emit('onChange', this.choosedPayment, this.value)
        }
      },
      immediate: true
    },
    params: {
      handler() {

      },
      deep: true
    },
    isShow(newV) {
      if (newV) {
        this.isWaiting = true
        this.inputFocus()
      } else {
        clearTimeout(this.timer)
      }
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {

    closeAlert() {
      this.$emit('closeModal')
    },

    inputFocus() {
      this.timer = setTimeout(() => {
        const myInput = this.$refs.myInput
        if (myInput) {
          myInput.$refs.input.focus()
          this.inputFocus()
        } else {
          clearTimeout(this.timer)
        }
      }, 100)
    },

    // 扫码会车事件
    pressEnter() {
      // console.log(this.auth_code)
      // 返回读取的码
      this.$emit('pressEnter', this.auth_code)
      this.auth_code = ''
      this.isWaiting = false
    }
  }
}
</script>
<style lang="less" scoped>
  /deep/.ant-modal-content {
    width: 240px;
    background: transparent;
    .ant-modal-body {
      padding: 0;
      background: transparent;
    }
  }

  .auth-code {
    position: absolute;
    top: 0;
    z-index: -99999;
  }
</style>
