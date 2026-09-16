<template>
  <div>
    <a-checkbox :indeterminate="indeterminate" :checked="checkAll" @change="onCheckAllChange">全部</a-checkbox>

    <a-checkbox-group
      v-model="checkedList"
      name="checkboxgroup"
      :options="options"
      style="display: inline"
      @change="hanldeSelectCheckbox"
    />
  </div>
</template>

<script>
export default {
  name: '',
  props: {
    options: {
      type: Array,
      required: true
    },
    checkedArr: {
      type: Array,
      default() {
        return []
      }
    },
    // 数据类型，简单的key-value
    dataType: {
      type: String,
      default: ''
    }
  },
  watch: {
    checkedArr: {
      handler(newList) {
        this.checkedList = newList
      },
      immediate: true
    }
  },
  computed: {
    checkAll() {
      return this.checkedList.length === this.options.length
    },
    indeterminate() {
      if (this.checkedList.length === this.options.length) {
        return false
      }
      if (!this.checkedList.length) {
        return false
      } else {
        return true
      }
    }
  },
  data() {
    return {
      checkedList: []
    }
  },

  methods: {
    // 选择全部
    onCheckAllChange(e) {
      Object.assign(this, {
        checkedList: e.target.checked ? this.formatArr(this.options) : []
      })
    },
    // 选择单项
    hanldeSelectCheckbox() {
      this.$emit('changeSelectList', this.checkedList)
    },
    // 格式化数据
    formatArr(arr) {
      if (this.dataType === 'simple') {
        return arr.map(item => item.value)
      }
      return arr.map(item => item._id)
    },
    // 向父组件传递选中的数组
    postCheckedList() {
      this.$emit('checkedList', this.checkedList)
    }
  }
}
</script>

<style lang='less' scoped>
</style>
