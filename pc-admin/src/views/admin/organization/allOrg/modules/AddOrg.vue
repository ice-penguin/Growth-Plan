<template>
  <a-drawer title="新建" :width="drawerWidth" :visible="visibleObj.isVisible" :body-style="{ paddingBottom: '80px' }" @close="onCloseDrawer">
    <div class="table-page-search-wrapper">
      <a-form-model layout="inline" ref="ruleForm" :model="form" :rules="rules">
        <a-row :gutter="48">
          <a-col :xl="24">
            <a-form-model-item ref="name" label="名称" prop="name">
              <a-input placeholder="请输入" v-model="form.name" />
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row :gutter="48">
          <a-col :xl="24">
            <a-form-model-item ref="account" label="账号" prop="account">
              <a-input placeholder="请输入手机号或邮箱" v-model="form.account" />
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row :gutter="48">
          <a-col :xl="24">
            <a-form-model-item ref="password" label="密码" prop="password">
              <a-input placeholder="不少于8位，含数字、大小写字母" v-model="form.password" />
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row :gutter="48">
          <a-col :xl="24">
            <a-form-model-item label="手机号" prop="tel">
              <a-input v-model="form.tel" placeholder="请输入手机号" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </div>
    <div class="drawer-btn">
      <a-button @click="onCloseDrawer" style="margin-right: 10px;">取消</a-button>
      <a-button type="primary" @click="handleClickSubmit">确定</a-button>
    </div>
  </a-drawer>
</template>

<script>
import { userUpdate } from '@/api/request'
import { deviceMixin } from '@/store/device-mixin'

const emptyForm = () => ({
  name: '',
  account: '',
  password: '',
  tel: '',
  role: 'organization'
})

export default {
  mixins: [deviceMixin],
  props: {
    visibleObj: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      form: emptyForm(),
      rules: {}
    }
  },
  methods: {
    onCloseDrawer() {
      this.visibleObj.isVisible = false
      this.form = emptyForm()
    },
    handleClickSubmit() {
      userUpdate(this.form).then(() => {
        this.$message.success('操作成功')
        this.onCloseDrawer()
        this.$emit('ok')
      })
    }
  }
}
</script>

<style scoped lang="less">
.table-page-search-wrapper {
  /deep/ .ant-form-item-label {
    width: 100px !important;
    display: inline-block !important;
  }
}
</style>
