<!--
 * @Author: yzy
 * @LastEditors: yzy
 * @I love coding too
-->
<template>
  <a-modal
    v-model="modalVisible"
    :title="title"
    width="608px"
    @ok="handleOk"
    @cancel="handleCancel"
    okText="保存"
  >
    <video
      v-show="show"
      id="video"
      style="height:601px;width:560px;object-fit: fill;display:block;"
    ></video>
    <audio id="audio"></audio>
    <canvas id="canvas" style="display:none;" width="560px" height="601px"></canvas>
    <img
      :src="img"
      id="img"
      v-show="!show"
      style="height:601px;width:560px;object-fit: fill;display:block;"
    />
    <img
      class="capture"
      src="../../../src/assets/images/bt_paizhao.png"
      @click="tackcapture"
      width="560px"
    />
    <br />请保持五官清晰可见，避免戴帽子、墨镜、口罩等物件。保证光线充足
    <template slot="footer">
      <a-button key="back" v-show="false">
        Return
      </a-button>
      <a-button key="submit" type="primary" @click="handleOk">
        保存
      </a-button>
    </template>
  </a-modal>
</template>
<script>
import { aliyunUpload } from '@/api/request'
import storage from 'store'
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    img: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      modalVisible: false,
      show: true,
      uploadImageData: {},
      path: '' // 上传成功后阿里云的地址
    }
  },

  mounted() {},

  methods: {
    handleOk() {
      if (!this.show) {
        aliyunUpload(this.uploadImageData)
          .then(res => {
            this.handleCancel()
            this.path = res.data.url
            this.$emit('getImageUrl', this.path)
          })
          .catch(res => {
            console.log(this.uploadImageData, '9999')
          })
      } else {
        this.$message.warning('请先拍照再保存')
      }
    },
    handleCancel() {
      this.modalVisible = false
      this.show = true
      this.closeVideo()
    },

    opening() {
      this.$nextTick(() => {
        const video = document.querySelector('#video')
        const audio = document.querySelector('audio')
        // 老的浏览器可能根本没有实现 mediaDevices，所以我们可以先设置一个空的对象
        if (navigator.mediaDevices === undefined) {
          navigator.mediaDevices = {}
        }
        // 获取用户媒体,包含视频和音频
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then(stream => {
            video.srcObject = stream // 将捕获的视频流传递给video  放弃window.URL.createObjectURL(stream)的使用
            video.play() //  播放视频
            audio.srcObject = stream
            this.mediaStreamTrack = stream
            audio.play()
          })
          .catch(() => {
            this.img = require('@/assets/images/img_tu.png')
            this.show = false
            this.$message.error('没有摄像头，请检查权限或设备')
          })
      })
    },
    tackcapture() {
      // 需要判断媒体流是否就绪
      if (this.show) {
        const canvas = document.querySelector('#canvas')
        const video = document.querySelector('#video')
        const img = document.querySelector('#img')
        const context = canvas.getContext('2d')
        const streaming = true // 是否开始捕获媒体
        if (streaming) {
          this.show = false
          context.drawImage(video, 0, 0, 560, 601) // 将视频画面捕捉后绘制到canvas里面
          img.src = canvas.toDataURL('image/png') // 将canvas的数据传送到img里
          // console.log(img.src) // 这边的值可以传入后端
          const blob = this.dataURLtoBlob(img.src)
          this.uploadImageData = new FormData()
          this.uploadImageData.append('_org', storage.get('orgInfo').imgFolderName)
          this.uploadImageData.append('type', 'normal')
          this.uploadImageData.append('file', blob)
          this.$forceUpdate()
        }
      } else {
        this.show = true
        this.opening()
      }
    },

    dataURLtoBlob(dataurl) {
      const arr = dataurl.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], 'face.png', {
        type: mime
      })
    },

    // getUserMedia(constraints, success, error) {
    //   if (navigator.mediaDevices.getUserMedia) {
    //     // 最新的标准API
    //     navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error)
    //   } else if (navigator.webkitGetUserMedia) {
    //     // webkit核心浏览器
    //     navigator.webkitGetUserMedia(constraints, success, error)
    //   } else if (navigator.mozGetUserMedia) {
    //     // firfox浏览器
    //     navigator.mozGetUserMedia(constraints, success, error)
    //   } else if (navigator.getUserMedia) {
    //     // 旧版API
    //     navigator.getUserMedia(constraints, success, error)
    //   }
    // },

    // success(stream) {
    //   // 兼容webkit核心浏览器
    //   let CompatibleURL = window.URL || window.webkitURL
    //   // 将视频流设置为video元素的源
    //   console.log(stream)
    //   mediaStreamTrack = stream
    //   // video.src = CompatibleURL.createObjectURL(stream)
    //   video.srcObject = stream
    //   video.play()
    // },

    // error(error) {
    //   console.log(`访问用户媒体设备失败${error.name}, ${error.message}`)
    // },

    // // 启动摄像头
    // openVideo() {
    //   if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
    //     // 调用用户媒体设备, 访问摄像头
    //     this.getUserMedia({ video: { width: 320, height: 320 } }, this.success, this.error)
    //     return true
    //   } else {
    //     alert('不支持访问用户媒体')
    //     return false
    //   }
    // },

    // 关闭摄像头
    closeVideo() {
      if (this.mediaStreamTrack) {
        this.mediaStreamTrack.getTracks().forEach(track => {
          track.stop()
        })
      }
    }
  }
}
</script>
<style lang="less" scoped>
.capture {
  position: absolute;
  bottom: 64px;
}
/deep/ .ant-modal-footer {
  position: absolute;
  right: 1px;
  bottom: 8px;
  border: none;
}
</style>
