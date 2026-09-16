<template>
  <div class="voucher-upload">
    <a-upload
      :file-list="fileList"
      :custom-request="handleUpload"
      :before-upload="beforeUpload"
      :accept="acceptAttr"
      :multiple="true"
      :disabled="disabled"
      :remove="handleRemove"
      @preview="handlePreview"
    >
      <a-button v-if="!disabled && fileList.length < maxCount" icon="upload" size="small">
        {{ imageOnly ? '上传图片' : '上传凭证' }}
      </a-button>
    </a-upload>
    <a-modal
      title="查看凭证"
      :visible="previewVisible"
      :footer="null"
      :width="720"
      @cancel="closePreview"
    >
      <div class="preview-toolbar">
        <a-button icon="undo" @click="rotateBy(-90)">向左旋转</a-button>
        <a-button icon="redo" @click="rotateBy(90)">向右旋转</a-button>
        <a-button @click="previewRotate = 0">复位</a-button>
      </div>
      <div class="preview-stage">
        <img
          v-if="previewImage"
          alt="预览"
          class="preview-image"
          :src="previewImage"
          :style="{ transform: 'rotate(' + previewRotate + 'deg)' }"
        />
      </div>
    </a-modal>
  </div>
</template>

<script>
import { aliyunUpload } from '@/api/request'

const IMAGE_EXT = /\.(jpe?g|png)$/i

export default {
  name: 'VoucherUpload',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    fileType: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    maxCount: {
      type: Number,
      default: 2
    },
    maxSize: {
      type: Number,
      default: 10
    },
    imageOnly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      previewVisible: false,
      previewImage: '',
      previewRotate: 0
    }
  },
  computed: {
    fileList() {
      return (this.value || []).map((item, index) => ({
        uid: item.uid || item._id || `${item.url || item.fileName || item.name}-${index}`,
        name: item.name || `凭证${index + 1}`,
        status: 'done',
        url: item.url,
        fileName: item.fileName || ''
      }))
    },
    acceptAttr() {
      if (this.imageOnly) {
        return '.jpg,.jpeg,.png,image/jpeg,image/png'
      }
      return '.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf'
    }
  },
  methods: {
    beforeUpload(file, fileList) {
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
      const isImage =
        file.type === 'image/jpeg' ||
        file.type === 'image/png' ||
        file.type === 'image/jpg' ||
        /\.(jpe?g|png)$/i.test(file.name)
      if (this.imageOnly) {
        if (!isImage) {
          this.$message.error('请上传 jpg / png 图片')
          return false
        }
      } else if (!isImage && !isPdf) {
        this.$message.error('请上传 jpg / png / pdf')
        return false
      }
      if (this.fileList.length >= this.maxCount) {
        this.$message.error(`最多上传${this.maxCount}张`)
        return false
      }
      const batch = Array.isArray(fileList) ? fileList : [file]
      const remain = this.maxCount - this.fileList.length
      const index = batch.indexOf(file)
      if (index >= remain) {
        if (index === remain) {
          this.$message.error(`最多上传${this.maxCount}张`)
        }
        return false
      }
      const size = file.size / 1024 / 1024
      if (size > this.maxSize) {
        this.$message.error(`文件不能超过${this.maxSize}MB`)
        return false
      }
      return true
    },
    handleUpload({ file, onSuccess, onError }) {
      const formData = new FormData()
      formData.append('file', file)
      aliyunUpload(formData)
        .then(res => {
          const result = (res.data && res.data.result) || {}
          const next = (this.value || []).concat({
            type: this.fileType,
            url: result.url,
            name: file.name,
            fileName: result.fileName || ''
          })
          this.$emit('input', next)
          this.$emit('change', next)
          onSuccess(result, file)
        })
        .catch(err => {
          this.$message.error('上传失败')
          onError(err)
        })
    },
    handleRemove(file) {
      const list = this.value || []
      const index = this.fileList.findIndex(item => item.uid === file.uid)
      const next =
        index >= 0
          ? list.filter((_, i) => i !== index)
          : list.filter(item => {
              if (file.url && item.url) {
                return item.url !== file.url
              }
              if (file.fileName && item.fileName) {
                return item.fileName !== file.fileName
              }
              return item.name !== file.name
            })
      this.$emit('input', next)
      this.$emit('change', next)
      return true
    },
    rotateBy(deg) {
      this.previewRotate = (this.previewRotate + deg + 360) % 360
    },
    closePreview() {
      this.previewVisible = false
      this.previewRotate = 0
    },
    handlePreview(file) {
      const url = file.url || ''
      if (!url) {
        return
      }
      if (IMAGE_EXT.test(file.name || url) || IMAGE_EXT.test(url.split('?')[0])) {
        this.previewImage = url
        this.previewRotate = 0
        this.previewVisible = true
        return
      }
      window.open(url, '_blank')
    }
  }
}
</script>

<style scoped lang="less">
.voucher-upload {
  /deep/ .ant-upload-list-item {
    position: relative;
    margin-top: 8px;
  }

  /deep/ .ant-upload-list-item-name {
    padding-right: 24px;
  }

  /deep/ .ant-upload-list-item-card-actions {
    position: absolute;
    z-index: 2;
    right: 0;
  }
}

.preview-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.preview-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  max-height: 70vh;
  overflow: auto;
  background: #f5f5f5;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  transition: transform 0.2s ease;
}
</style>
