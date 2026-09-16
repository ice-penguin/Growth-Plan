<template>
  <div class="clearfix upload-box">
    <a-upload
      name="avatar"
      :list-type="listType"
      class="avatar-uploader"
      :accept="acceptType"
      :show-upload-list="false"
      :action="imgHost"
      :before-upload="beforeUpload"
      :data="uploadData"
      @change="handleImageChange"
    >
      <img
        v-if="imageUrl && count === 1 && !customText"
        :src="imageUrl"
        :style="{ width: '104px', height: '104px' }"
        alt="icon"
      />
      <div v-if="imgList.length < count && listType !== 'text'">
        <a-icon :type="loading ? 'loading' : 'plus'" />
        <div class="ant-upload-text">{{ uploadText }}</div>
      </div>
      <div v-if="listType === 'text'" class="upload-text">{{ customText }}</div>
    </a-upload>
  </div>
</template>
<script>
import storage from 'store'
export default {
  props: {
    // 上传列表的内建样式，支持三种基本样式 text, picture 和 picture-card
    listType: {
      type: String,
      default: 'picture-card'
    },
    count: {
      type: Number,
      default: 1
    },
    fileType: {
      type: String,
      default: 'image'
    },
    fileUrl: {
      type: String,
      default: ''
    },
    fileList: {
      type: Array,
      default() {
        return []
      }
    },
    // 上传类型是否是人脸
    isFace: {
      type: Boolean,
      default: false
    },
    // 自定义文字
    customText: {
      type: String,
      default: ''
    },
    // maxWidth，maxHight在需要进行压缩时生效
    maxWidth: {
      type: Number,
      default: 500
    }, // 单位px
    maxHight: {
      type: Number,
      default: 500
    }, // 单位px
    maxSize: {
      type: Number,
      default: 0.5
    } // 图片最大大小，单位m
  },
  data() {
    return {
      loading: false,
      imageUrl: '',
      imgList: [],
      videoUrl: '',
      videoList: [],
      imgHost: storage.get('orgInfo').imgHost,
      uploadImageData: {},
      uploadVideoData: {}
    }
  },
  computed: {
    uploadText() {
      if (this.fileType === 'video') {
        return '上传视频'
      } else {
        return '上传图片'
      }
      // return this.fileType === 'video' ? '上传视频' : '上传图片'
    },
    acceptType() {
      return this.fileType === 'video' ? 'video/*,.mp4, .rmvb, .avi' : 'image/*, .jpg, .jpeg, .png'
    },
    uploadData() {
      return this.fileType === 'video' ? this.uploadVideoData : this.uploadImageData
    }
  },
  watch: {
    fileUrl: {
      handler(val) {
        if (this.count === 1) {
          if (val) {
            this.imageUrl = val
            this.imgList.push(val)
          } else {
            this.imageUrl = ''
            this.imgList.length = 0
          }
        }
      },
      immediate: true
    },
    fileList: {
      handler(arr) {
        if (arr.length) {
          this.imgList = arr
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    handleImageChange(info) {
      console.log(this.count, 'info')
      if (info.file.status === 'uploading') {
        if (this.uploadImageData) {
          this.loading = true
        }
        return
      }
      if (info.file.status === 'done') {
        if (info.file.type.indexOf('video') > -1) {
          this.videoUrl = info.file.response.data.url
          if (this.count > 1) {
            this.videoList.push(this.videoUrl)
          } else {
            this.videoList = [this.videoUrl]
          }
          this.loading = false
          this.$emit('uploadVideo', this.videoList)
        } else {
          this.imageUrl = info.file.response.data.url
          console.log(this.imageUrl, 'this.imageUrl')
          if (this.count > 1) {
            this.imgList.push(this.imageUrl)
          } else {
            this.imgList[0] = this.imageUrl
          }
          this.imgList = this.imgList.filter(url => url)
          this.loading = false
          this.$emit('uploadImg', this.imgList)
        }
      }
      if (info.file.status === 'error') {
        this.loading = false
        this.$message.error('上传失败')
      }
    },
    beforeUpload(file) {
      console.log(file, '149149')
      if (this.fileType === 'image') {
        this.uploadImageData = {
          type: this.isFace ? 'face' : 'normal', // 区分是上传人脸还是普通图片
          file: file,
          _org: storage.get('orgInfo').imgFolderName
        }
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
        if (!isJpgOrPng) {
          this.$message.error('请上传.jpeg或者.png或者.jpg类型图片')
          return false
        }

        const size = file.size / 1024 / 1024
        if (size > this.maxSize) {
          return this.imgcompress(file)
        } else {
          return true
        }
      } else {
        this.uploadVideoData = {
          type: 'normal',
          file: file,
          _org: storage.get('orgInfo').imgFolderName
        }
        const isVideoType = file.type === 'video/mp4' || file.type === 'video/rmvb' || file.type === 'video/avi'
        if (!isVideoType) {
          this.$message.error('请上传.mp4, .rmvb, .avi类型的视频')
        }
        const isLt500M = file.size / 1024 / 1024 < 500
        if (!isLt500M) {
          this.$message.error('视频大小不能超过500M')
        }
        return isVideoType && isLt500M
      }
    },
    imgcompress(file) {
      const img = document.createElement('img')
      const reader = new FileReader() // 读取文件资源实例
      reader.readAsDataURL(file) // 读取图片资源
      return new Promise((resolve, reject) => {
        // 读取成功
        reader.onload = e => {
          img.src = e.target.result
          img.onload = rs => {
            const { width: originWidth, height: originHeight } = img // 上传的图片的宽高
            const maxWidth = this.maxWidth // 设置一个canvas 的最大宽高
            const maxHight = this.maxHight
            if (originWidth > maxWidth || originHeight > maxHight) {
              // 计算出图片的缩放比例
              if (originWidth > originHeight) {
                // 宽 大于 高
                const Proportion = Math.ceil(originWidth / maxWidth)
                const targetWidht = parseInt(originWidth / Proportion) // 目标的宽度
                const targetHeight = parseInt(originHeight / Proportion) // 目标的高度

                this.createCanvasCompress(targetWidht, targetHeight, img, file)
                  .then(file => {
                    resolve(file)
                  })
                  .catch(err => {
                    reject(err)
                  })
              } else {
                const Proportion = Math.ceil(originHeight / maxHight) // 高大于宽
                const targetWidht = parseInt(originWidth / Proportion) // 目标的宽度
                const targetHeight = parseInt(originHeight / Proportion) // 目标的高度
                this.createCanvasCompress(targetWidht, targetHeight, img, file)
                  .then(file => {
                    resolve(file)
                  })
                  .catch(err => {
                    reject(err)
                  })
              }
            } else {
              const quality = 0.8
              this.createCanvasCompress(originWidth, originHeight, img, file, quality)
                .then(file => {
                  resolve(file)
                })
                .catch(err => {
                  reject(err)
                })
            }
          }
        }
      })
    },
    createCanvasCompress(targetWidth, targetHeight, img, file, quality) {
      const that = this
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        // 设置宽高度为等同于要压缩图片的尺寸
        canvas.width = targetWidth
        canvas.height = targetHeight
        context.clearRect(0, 0, targetWidth, targetHeight)
        // 将img绘制到画布上
        context.drawImage(img, 0, 0, targetWidth, targetHeight)

        canvas.toBlob(
          function (blob) {
            // 拿到的是blob格式的图片，需要把blob格式转换为file格式
            const file1 = new window.File([blob], file.name, { type: file.type })
            that.uploadImageData.file = file1
            resolve(file1)
          },
          'image/png',
          quality
        )
      })
    }
  }
}
</script>
<style lang="less" scoped>
.avatar-uploader > .ant-upload {
  width: 128px;
  height: 128px;
}
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
.upload-text {
  cursor: pointer;
}
</style>
