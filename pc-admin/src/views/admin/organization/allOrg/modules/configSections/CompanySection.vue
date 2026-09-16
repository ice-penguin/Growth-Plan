<template>
  <div>
    <div class="title" v-if="!section">公司信息</div>
    <a-form-model-item label="公司名称">
      <a-input v-model="form.companyInfo.name" placeholder="请输入公司名称" />
    </a-form-model-item>
    <a-form-model-item label="公司地址">
      <a-textarea v-model="form.companyInfo.address" placeholder="请输入公司地址" />
    </a-form-model-item>
    <a-form-model-item label="公司Logo">
      <ImageUpload v-model="form.companyInfo.logo" placeholder="上传公司Logo" :orgId="form._organization" />
    </a-form-model-item>
    <a-form-model-item label="小型Logo">
      <ImageUpload v-model="form.companyInfo.logoMin" placeholder="上传小型Logo" :orgId="form._organization" />
    </a-form-model-item>
  </div>
</template>

<script>
import ImageUpload from '../ImageUpload'

export default {
  name: 'ConfigCompanySection',
  components: { ImageUpload },
  props: {
    form: { type: Object, required: true },
    section: { type: String, default: '' }
  }
}
</script>
