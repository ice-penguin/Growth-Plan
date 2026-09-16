<template>
  <div>
    <a-form-item 
      :label="select.label"
      :wrapperCol="wrapperCol"
      v-for="select in selectArr" 
      :key="select.key"
    >
      <a-select 
        :options="select.options" 
        :placeholder="select.placeholder"
        v-decorator="select.decorator || []"
        @change="handleSelectClick"></a-select>
    </a-form-item>
  </div>
</template>
<script>
import { findWhere } from '@/utils/util'
export default {
  name: 'RowCascader',
  props: {
    labels: {
      type: Array,
      default: () => {
        return []
      }
    },
    wrapperCol: {
      type: Object,
      default: () => {
        return {}
      }
    },
    decorators: {
      type: Array,
      default: (obj) => {
        return []
      }
    },
    placeholders: {
      type: Array,
      default: (obj) => {
        return []
      }
    },
    options: {
      type: Array,
      default: (obj) => {
        return []
      }
    },
    form: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      isRouterAlive: true,
      index: 0, // 层级
      selectArr: []// 选择器层级
      // selectArr: [{
      //   key: 1,
      //   options: [],
      //   decorator: [
      //     'product22',
      //     { rules: [{ required: true, message: '选择产品类型' }], initialValue: 'xxs' }
      //   ]
      // }, {
      //   key: 2,
      //   options: [],
      //   decorator: [
      //     'product22',
      //     { rules: [{ required: true, message: '选择产品类型' }], initialValue: 'xxs' }
      //   ]
      // }]
    }
  },
  created() {
    // 遍历递归options初始化selectArr长度
    this.initSelectCount(this.options)

    const arr = []
    const labelsLength = this.labels.length
    const decoratorsLength = this.decorators.length
    const placeholdersLength = this.placeholders.length
    for (let index = 0; index < this.index; index++) {
      const obj = {
        key: index,
        options: index === 0 ? this.options : [],
        label: index >= labelsLength ? '' : this.labels[index],
        placeholder: index >= placeholdersLength ? [] : this.placeholders[index],
        decorator: index >= decoratorsLength ? [] : this.decorators[index],
        fieldName: index >= decoratorsLength ? null : this.decorators[index][0]
      }
      obj.initialValue = (obj.decorator.length > 1 && obj.decorator[1].initialValue) ? obj.decorator[1].initialValue : null
      arr.push(obj)
    }
    
    this.selectArr = arr
    this.initSelected()
  },
  mounted() {
    // console.log('mounted')
  },
  updated() {
    // console.log('updated')
    this.updateInitialValue()
  },
  methods: {
    updateInitialValue() {
      let isChange = false
      const length = this.decorators.length < this.index ? this.decorators.length : this.index
      for (let index = 0; index < length; index++) {
        const decorator = this.decorators[index]
        const initialValue = (decorator.length > 1 && decorator[1].initialValue) ? decorator[1].initialValue : null
        if (initialValue !== this.selectArr[index].initialValue) {
          isChange = true
          this.selectArr[index].initialValue = initialValue
        }
      }
      if (isChange) {
        this.initSelected(isChange)
      }
    },
    initSelected (isChange) {
      // console.log('initSelected')
      // console.log('this.selectArr', this.selectArr, this.decorators)
      // 初始化选中
      const setParams = {}
      this.selectArr.map(obj => {
          // console.log('sss', obj.decorator.length, obj.initialValue)
          setParams[obj.fieldName] = obj.initialValue
        if (obj.initialValue) {
          const c = findWhere(obj.options, { value: obj.initialValue })
          if (c && c.index + 1 < this.index) {
            this.selectArr[c.index + 1].options = c.options
          }
        }
      })
      if (isChange) {
        // console.log('change', setParams)
        this.form.setFieldsValue(setParams)
      }
    },
    initSelectCount(options, index) {
      index = index || 0
      index++
      this.index = this.index > index ? this.index : index
      for (let i = 0; i < options.length; i++) {
        const obj = options[i]
        // 对options每一个元素附上层级
        obj.index = index - 1
        if (obj.options && (typeof obj.options === 'object')) {
          this.initSelectCount(obj.options, index)
        }
      }
    },
    handleSelectClick(key, options) {
      // console.log('key', options)
      const index = options.data.props.index + 1
      const arr = []
      if (index < this.index && options.data.props.options) {
        this.selectArr[index].options = options.data.props.options
        if (this.selectArr[index].fieldName) {
          arr.push(this.selectArr[index].fieldName)
        }
        for (let i = index + 1; i < this.index; i++) {
          this.selectArr[i].options = []
          if (this.selectArr[i].fieldName) {
            this.selectArr[i].options = []
            arr.push(this.selectArr[i].fieldName)
          }
        }
        const setParams = {}
        arr.map(key => {
          setParams[key] = null
        })
        this.form.setFieldsValue(setParams)
      }
    }
  }
}
</script>
<style scoped>

</style>

// 引入demo
// <row-cascader 
//   :labels="['一级','二级','三级']"
//   :wrapperCol="{span:18}"
//   :placeholders="['选择一级', '选择二级', '选择三级']"
//   :decorators="[[
//     'nav1',
//     { rules: [{ required: true, message: '选择选择一级' }] },
//   ],[
//     'nav2',
//     { rules: [{ required: true, message: '选择选择二级' }] },
//   ],[
//     'nav3',
//     { rules: [{ required: true, message: '选择选择三级' }] },
//   ]]"
//   :options="[{
//     label:'nav1',
//     value:'value1',
//     options:[{
//       label:'nav1-1',
//       value:'value1-1'
//     },{
//       label:'nav1-2',
//       value:'value1-2',
//       options:[{
//         label:'nav1-2-1',
//         value:'value1-2-1'
//       }]
//     },]
//   },{
//     label:'nav2',
//     value:'value2'
//   },{
//     label:'nav3',
//     value:'value3'
//   }]"></row-cascader>
