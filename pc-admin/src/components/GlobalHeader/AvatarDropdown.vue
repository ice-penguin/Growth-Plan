<!--
 * @Author: jianxl
 * @LastEditors: jianxl
 * @symbol_custom_string_obkoro1: I love coding
-->
<template>
  <div>
    <a-dropdown v-if="currentUser && currentUser.name" placement="bottomRight">
      <span class="ant-pro-account-avatar">
        <a-avatar
          size="small"
          style="margin-right: 8px;"
          src="https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png"
          class="antd-pro-global-header-index-avatar"
        />
        <span :title="currentUser.name">{{ displayUserName }}</span>
      </span>
      <template v-slot:overlay>
        <a-menu class="ant-pro-drop-down menu" :selected-keys="[]">
          <!-- <a-menu-item v-if="menu" key="center" @click="handleToCenter">
            <a-icon type="user" />
            个人中心
          </a-menu-item>
          <a-menu-item v-if="menu" key="settings" @click="handleToSettings">
            <a-icon type="setting" />
            个人设置
          </a-menu-item> -->
          <a-menu-item v-if="menu" key="updatePwd" @click="handleUpdatePwd">
            <a-icon type="setting" />
            修改密码
          </a-menu-item>
          <a-menu-divider v-if="menu" />
          <a-menu-item key="logout" @click="handleLogout">
            <a-icon type="logout" />
            退出登录
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
    <span v-else>
      <a-spin size="small" :style="{ marginLeft: 8, marginRight: 8 }" />
    </span>
    <a-modal v-model="visible" title="修改密码" @cancel="cancelForm('ruleForm')" @ok="submitForm('ruleForm')">
      <a-form-model ref="ruleForm" :model="ruleForm" :rules="rules" v-bind="layout">
        <a-form-model-item label="原始密码" prop="oldPassword">
          <a-input v-model="ruleForm.oldPassword" placeholder="请输入原密码" type="password" autocomplete="off" />
        </a-form-model-item>
        <a-form-model-item label="新密码" prop="pass">
          <a-input v-model="ruleForm.pass" placeholder="不少于8位且须含大写和小写英文字母" type="password" autocomplete="off" />
        </a-form-model-item>
        <a-form-model-item label="确认密码" prop="checkPass">
          <a-input v-model="ruleForm.checkPass" placeholder="再次输入新密码" type="password" autocomplete="off" />
        </a-form-model-item>
        <!-- <a-form-model-item :wrapper-col="{ span: 14, offset: 4 }">
          <a-button @click="resetForm('ruleForm')">
            重置
          </a-button>
        </a-form-model-item> -->
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import { Modal } from 'ant-design-vue'
import { userUpdatePassword } from '@/api/request'
export default {
  name: 'AvatarDropdown',
  props: {
    currentUser: {
      type: Object,
      default: () => null
    },
    menu: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    displayUserName() {
      const name = (this.currentUser && this.currentUser.name) || ''
      if (!name) return ''
      if (name.length <= 8) return name
      return `${name.slice(0, 7)}…`
    }
  },
  data() {
    const validateOldPass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入原始密码'))
      } else {
        if (this.ruleForm.oldPassword !== '') {
          // this.$refs.ruleForm.validateField('oldPassword')
        }
        callback()
      }
    }
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入新密码'))
      } else {
        if (this.ruleForm.checkPass !== '') {
          this.$refs.ruleForm.validateField('checkPass')
        }
        callback()
      }
    }
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入确认密码'))
      } else if (value !== this.ruleForm.pass) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    return {
      visible: false,
      ruleForm: {
        oldPassword: '',
        pass: '',
        checkPass: ''
      },
      rules: {
        oldPassword: [{ validator: validateOldPass, trigger: 'change' }],
        pass: [{ validator: validatePass, trigger: 'change' }],
        checkPass: [{ validator: validatePass2, trigger: 'change' }]
      },
      layout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 14 }
      }
    }
  },
  methods: {
    handleToCenter () {
      this.$router.push({ path: '/account/center' })
    },
    handleToSettings () {
      this.$router.push({ path: '/account/settings' })
    },
    handleLogout (e) {
      Modal.confirm({
        title: this.$t('退出登录'),
        content: this.$t('是否退出登录'),
        onOk: () => {
          // return new Promise((resolve, reject) => {
          //   setTimeout(Math.random() > 0.5 ? resolve : reject, 1500)
          // }).catch(() => console.log('Oops errors!'))
          return this.$store.dispatch('Logout').then(() => {
            this.$router.push({ name: 'login' })
          })
        },
        onCancel () {}
      })
    },
    handleUpdatePwd() {
      this.visible = true
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          // alert('submit!')
          const data = {
            oldPass: this.ruleForm.oldPassword,
            newPass: this.ruleForm.pass
          }
          userUpdatePassword(data).then((result) => {
            this.$message.success('密码修改成功')
            this.cancelForm(formName)
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    cancelForm(formName) {
      this.visible = false
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.ant-pro-drop-down {
  /deep/ .action {
    margin-right: 8px;
  }
  /deep/ .ant-dropdown-menu-item {
    min-width: 160px;
  }
}
</style>
