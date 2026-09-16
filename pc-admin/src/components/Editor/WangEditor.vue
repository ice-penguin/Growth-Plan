<!--
 * @Author: yzy
 * @LastEditors: jianxl
 * @I love coding too
-->
<template>
  <div :class="prefixCls">
    <div ref="editor" class="editor-wrapper"></div>
  </div>
</template>

<script>
import WEditor from 'wangeditor'
// import storage from 'store'
export default {
  name: 'WangEditor',
  props: {
    prefixCls: {
      type: String,
      default: 'ant-editor-wang'
    },
    // eslint-disable-next-line
    value: {
      type: String
    },
    menus: {
      type: Array,
      default() {
        return [
          'head',
          'bold',
          'fontSize',
          'fontName',
          'italic',
          'underline',
          'strikeThrough',
          'foreColor',
          'backColor',
          'link',
          'list',
          'justify',
          'image',
          'quote',
          'emoticon',
          'table',
          'code',
          'undo',
          'redo'
        ]
      }
    },
    zIndex: {
      type: Number,
      default: 10000
    },
    height: {
      type: Number,
      default: 500
    }
  },
  data() {
    return {
      editor: null,
      editorContent: null
    }
  },
  watch: {
    value(val) {
      if (!val) {
        this.editorContent = val
        this.editor.txt.html(val)
      }
    }
  },
  mounted() {
    this.initEditor()
  },
  methods: {
    // 富文本去除word格式
    removeWordXml(text) {
      let html = text
      html = html.replace(/<\/?SPANYES[^>]*>/gi, '') //  Remove  all  SPAN  tags
      html = html.replace(/<(\w[^>]*) lang=([^|>]*)([^>]*)/gi, '<$1$3') //  Remove  Lang  attributes
      html = html.replace(/<\\?\?xml[^>]*>/gi, '') //  Remove  XML  elements  and  declarations
      html = html.replace(/<\/?\w+:[^>]*>/gi, '') //  Remove  Tags  with  XML  namespace  declarations:  <o:p></o:p>
      html = html.replace(/&nbsp;/, '') //  Replace  the  &nbsp;
      html = html.replace(/\n(\n)*( )*(\n)*\n/gi, '\n')
      return html
    },
    initEditor() {
      this.editor = new WEditor(this.$refs.editor)
      // this.editor.onchangeTimeout = 200
      this.editor.customConfig.onchange = html => {
        this.editorContent = html
        this.$emit('change', this.editorContent)
      }
      this.editor.customConfig.zIndex = this.zIndex
      this.editor.customConfig.menus = this.menus
      this.editor.customConfig.height = this.height
      this.editor.customConfig.uploadImgServer = process.env.VUE_APP_API_BASE_URL + '/api/aliyun/upload'
      this.editor.customConfig.uploadFileName = 'file'
      this.editor.customConfig.debug = true // 开启debug模式
      this.editor.customConfig.uploadImgMaxSize = 5 * 1024 * 1024 // 5M
      this.editor.customConfig.uploadImgHooks = {
        // 图片上传并返回结果，但图片插入错误时触发
        fail: function (xhr, editor, result) {
          console.log(result)
        },
        success: function (xhr, editor, result) {
          // 图片上传并返回结果，图片插入成功之后触发
          console.log(result, 'success')
        },
        // 上传图片出错，一般为 http 请求的错误
        error: function(xhr, editor, resData) {
          console.log('error', xhr, resData)
        },
        customInsert: function(insertImgFn, result) {
          // result 即服务端返回的接口
          console.log('customInsert', result)

          // insertImgFn 可把图片插入到编辑器，传入图片 src ，执行函数即可
          insertImgFn(result.data.result.url)
        }
      }
      this.editor.customConfig.uploadImgParams = {
        type: 'editor'
      }
      // 配置粘贴文本的内容处理

      this.editor.customConfig.pasteTextHandle = pasteStr => {
        // 对粘贴的文本进行处理，然后返回处理后的结果
        return this.removeWordXml(pasteStr)
      }

      this.editor.create()
    }
  }
}
</script>

<style lang="less" scoped>
.ant-editor-wang {
  .editor-wrapper {
    text-align: left;
  }
}
</style>
