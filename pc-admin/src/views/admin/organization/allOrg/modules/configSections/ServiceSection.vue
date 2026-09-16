<template>
  <div>
    <template v-if="isSection('aliOss')">
      <div class="title" v-if="!section">阿里云 OSS</div>
      <a-form-model-item label="Endpoint">
        <a-input v-model="form.aliOss.endpoint" placeholder="请输入地域" />
      </a-form-model-item>
      <a-form-model-item label="AccessKeyId">
        <a-input v-model="form.aliOss.accessKeyId" placeholder="请输入阿里云AccessKeyId" />
      </a-form-model-item>
      <a-form-model-item label="AccessKeySecret">
        <a-input v-model="form.aliOss.accessKeySecret" placeholder="请输入阿里云AccessKeySecret" />
      </a-form-model-item>
      <a-form-model-item label="Bucket">
        <a-input v-model="form.aliOss.bucket" placeholder="请输入文件池名称" />
      </a-form-model-item>
    </template>
  </div>
</template>

<script>
export default {
  name: 'ConfigServiceSection',
  props: {
    form: { type: Object, required: true },
    section: { type: String, default: '' }
  },
  methods: {
    isSection(key) {
      return !this.section || this.section === key
    }
  }
}
</script>

<style lang="less" scoped>
.title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
}
</style>
