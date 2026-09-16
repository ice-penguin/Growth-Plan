<template>
  <div :class="prefixCls" class="editor-wrap">
    <quill-editor
      v-model="content"
      class="quill-editor"
      ref="myQuillEditor"
      :options="editorOption"
      @blur="onEditorBlur($event)"
      @focus="onEditorFocus($event)"
      @ready="onEditorReady($event)"
      @change="onEditorChange($event)"
    ></quill-editor>
  </div>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import { quillEditor } from 'vue-quill-editor'

export default {
  name: 'QuillEditor',
  components: {
    quillEditor
  },
  props: {
    prefixCls: {
      type: String,
      default: 'ant-editor-quill'
    },
    placeholder: {
      type: String,
      default: '请输入文本...'
    },
    // 表单校验用字段
    // eslint-disable-next-line
    value: {
      type: String,
      default: ''
    }
  },
  watch: {
    value(val) {
      this.content = val
    },
    placeholder: {
      handler(newVal) {
        this.editorOption.placeholder = newVal
      },
      immediate: true
    }
  },
  data() {
    return {
      content: null,
      editorOption: {
        placeholder: '',
        modules: {
          toolbar: false
        }
      }
    }
  },
  methods: {
    onEditorBlur(quill) {
      console.log('editor blur!', quill)
    },
    onEditorFocus(quill) {
      console.log('editor focus!', quill)
    },
    onEditorReady(quill) {
      console.log('editor ready!', quill)
    },
    onEditorChange({ quill, html, text }) {
      console.log('editor change!', html, text)
      this.$emit('changeRichText', html)
    }
  }
}
</script>

<style lang="less" scoped>
@import url('../index.less');
.editor-wrap {
  height: 300px;
  .quill-editor {
    height: 100%;
  }
}
/* 覆盖 quill 默认边框圆角为 ant 默认圆角，用于统一 ant 组件风格 */
.ant-editor-quill {
  line-height: initial;
  /deep/ .ql-toolbar.ql-snow {
    border-radius: @border-radius-base @border-radius-base 0 0;
  }
  /deep/ .ql-container.ql-snow {
    border-radius: 0 0 @border-radius-base @border-radius-base;
  }
}
</style>
