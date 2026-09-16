<template>
  <div class="image-upload-container">
    <a-upload
      :name="name"
      list-type="picture-card"
      class="avatar-uploader"
      :show-upload-list="false"
      :before-upload="beforeUpload"
      :customRequest="handleUpload"
      :disabled="!!value"
    >
      <div v-if="!value" class="upload-placeholder">
        <a-icon :type="loading ? 'loading' : 'plus'" />
        <div class="ant-upload-text">{{ placeholder }}</div>
      </div>
      
      <div v-else class="image-preview-wrapper" @click.stop="handlePreview">
        <img :src="value" :alt="placeholder" />
        <div class="image-actions">
          <a-tooltip title="预览">
            <a-icon type="eye" @click.stop="handlePreview" />
          </a-tooltip>
          <a-tooltip title="删除">
            <a-icon type="delete" @click.stop="handleRemove" />
          </a-tooltip>
        </div>
      </div>
    </a-upload>
    
    <a-modal :visible="previewVisible" :footer="null" @cancel="previewVisible = false">
      <img alt="预览图片" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>

<script>
import storage from 'store'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { aliyunUpload } from '@/api/request'

export default {
  props: {
    value: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: 'file'
    },
    placeholder: {
      type: String,
      default: '上传图片'
    },
    orgId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      previewVisible: false,
      previewImage: ''
    }
  },
  methods: {
    beforeUpload(file) {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
      if (!isJpgOrPng) {
        this.$message.error('只能上传JPG/PNG格式的图片!')
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('图片大小不能超过2MB!')
      }
      return isJpgOrPng && isLt2M
    },
    
    async handleUpload({ file }) {
      this.loading = true
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('_org', this.orgId)

        const res = await aliyunUpload(formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer ' + storage.get(ACCESS_TOKEN)
          }
        })
        this.$emit('input', res.data.result.url)
        this.$emit('change', res.data.result.url)
        this.$message.success('图片上传成功')
      } catch (error) {
        this.$message.error('上传失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },
    
    handlePreview() {
      this.previewImage = this.value
      this.previewVisible = true
    },
    
    handleRemove() {
      this.$emit('input', '')
      this.$emit('change', '')
      this.$message.success('图片已删除')
    }
  }
}
</script>

<style scoped lang="less">
.image-upload-container {
  position: relative;
  
  /deep/ .ant-upload.ant-upload-select-picture-card {
    margin: 0;
    border: 1px dashed #d9d9d9; /* 添加虚线边框 */
    border-radius: 4px; /* 圆角 */
    background: transparent;
    transition: border-color 0.3s; /* 过渡动画 */

    &:hover {
      border-color: #1890ff; /* 悬停时边框颜色变化 */
    }
  }
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(0, 0, 0, 0.65);
  
  .ant-upload-text {
    margin-top: 8px;
  }
}

.image-preview-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  border: 1px solid #d9d9d9; /* 预览图边框 */
  border-radius: 4px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  &:hover {
    border-color: #1890ff; /* 悬停效果 */
    
    .image-actions {
      opacity: 1;
    }
  }
}

.image-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  opacity: 0;
  transition: all 0.3s;
  
  .anticon {
    color: white;
    font-size: 20px;
    cursor: pointer;
    
    &:hover {
      color: #1890ff;
    }
  }
}

/* 调整上传卡片的大小和边框 */
/deep/ .avatar-uploader > .ant-upload {
  width: 128px;
  height: 128px;
  padding: 4px;
  background-color: #fafafa; /* 更浅的背景色 */
  border: 1px dashed #d9d9d9;
  border-radius: 4px;

  &:hover {
    border-color: #1890ff;
  }
}
</style>
