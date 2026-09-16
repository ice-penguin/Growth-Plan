<template>
  <div class="main">
    <a-form
      id="formLogin"
      class="user-layout-login"
      ref="formLogin"
      :form="form"
      @submit="handleSubmit"
    >
      <div class="tip">
        <div class="tip-title">
          <img :src="require('@/assets/images/login_circle.png')" width="18" alt="">
          <span class="tip-title-text">登录</span>
        </div>
        <div class="tip-des">
          欢迎使用成长计划，请输入您的帐号和密码
        </div>
      </div>
      <a-alert v-if="isLoginError" type="error" showIcon style="margin-bottom: 24px;" :message="message" />
      <a-form-item>
        <a-input
          ref="accountInput"
          size="large"
          type="text"
          placeholder="账户"
          v-decorator="[
            'account',
            {rules: [{ required: true, message: '请输入账号' }, { validator: handleUsernameOrEmail }], validateTrigger: 'change'}
          ]"
          @focus="onAccountFocus"
          @blur="onAccountBlur"
          @input="onAccountInput"
        >
          <a-icon slot="prefix" type="user" :style="{ color: '#1890ff', marginRight: '8px' }"/>
        </a-input>
      </a-form-item>

      <a-form-item>
        <a-input-password
          ref="passwordInput"
          size="large"
          placeholder="密码"
          v-decorator="[
            'password',
            {rules: [{ required: true, message: '请输入密码' }], validateTrigger: 'blur'}
          ]"
          @focus="onPasswordFocus"
          @blur="onPasswordBlur"
          @input="onPasswordInput"
        >
          <a-icon slot="prefix" type="lock" :style="{ color: '#1890ff', marginRight: '8px' }"/>
        </a-input-password>
      </a-form-item>

      <a-form-item style="margin-top:24px">
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="login-button"
          :loading="state.loginBtn"
          :disabled="state.loginBtn"
        >确定</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { timeFix } from '@/utils/util'

export default {
  inject: {
    updateLoginScene: { default: null }
  },
  data() {
    return {
      isLoginError: false,
      form: this.$form.createForm(this),
      state: {
        loginBtn: false,
        loginType: 0
      },
      message: ''
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.bindPasswordVisibilityToggle()
    })
  },
  methods: {
    ...mapActions(['Login', 'Logout']),
    getInputElement(refName) {
      const comp = this.$refs[refName]
      if (!comp) return null
      return comp.$refs?.input || comp.$el?.querySelector('input') || null
    },
    reportLookTarget(el) {
      if (!this.updateLoginScene) return
      if (!el) {
        this.updateLoginScene({ lookTarget: null })
        return
      }
      const rect = el.getBoundingClientRect()
      this.updateLoginScene({
        lookTarget: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        }
      })
    },
    onAccountFocus(e) {
      if (!this.updateLoginScene) return
      this.updateLoginScene({ focusField: 'account', passwordVisible: false })
      this.reportLookTarget(e.target)
    },
    onAccountBlur() {
      if (!this.updateLoginScene) return
      this.updateLoginScene({ focusField: '', lookTarget: null })
    },
    onAccountInput(e) {
      this.reportLookTarget(e.target)
    },
    onPasswordFocus(e) {
      if (!this.updateLoginScene) return
      this.syncPasswordVisible()
      this.updateLoginScene({ focusField: 'password' })
      this.reportLookTarget(e.target)
    },
    onPasswordBlur() {
      if (!this.updateLoginScene) return
      this.updateLoginScene({ focusField: '', lookTarget: null, passwordVisible: false })
    },
    onPasswordInput(e) {
      if (!this.updateLoginScene) return
      this.updateLoginScene({ passwordLength: (e.target.value || '').length })
      this.reportLookTarget(e.target)
    },
    syncPasswordVisible() {
      const input = this.getInputElement('passwordInput')
      if (!this.updateLoginScene || !input) return
      this.updateLoginScene({
        passwordVisible: input.type === 'text',
        passwordLength: (input.value || '').length
      })
    },
    bindPasswordVisibilityToggle() {
      const pwdComp = this.$refs.passwordInput
      if (!pwdComp || !pwdComp.$el) return
      pwdComp.$el.addEventListener('click', () => {
        setTimeout(() => {
          this.syncPasswordVisible()
          const input = this.getInputElement('passwordInput')
          if (input && document.activeElement === input) {
            this.reportLookTarget(input)
          }
        }, 0)
      })
    },
    handleUsernameOrEmail(rule, value, callback) {
      const regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
      this.state.loginType = regex.test(value) ? 0 : 1
      callback()
    },
    handleSubmit(e) {
      e.preventDefault()
      const { form: { validateFields }, state, Login } = this
      state.loginBtn = true
      validateFields(['account', 'password'], { force: true }, (err, values) => {
        if (!err) {
          Login({
            account: values.account,
            password: values.password
          })
            .then(res => this.loginSuccess(res))
            .catch(err => this.requestFailed(err))
            .finally(() => {
              state.loginBtn = false
            })
        } else {
          setTimeout(() => {
            state.loginBtn = false
          }, 600)
        }
      })
    },
    loginSuccess() {
      this.$router.push({ path: '/welcome' })
      setTimeout(() => {
        this.$notification.success({
          message: '欢迎',
          description: `${timeFix()}，欢迎回来`
        })
      }, 1000)
      this.isLoginError = false
    },
    requestFailed(err) {
      this.isLoginError = true
      this.message = ((err.response || {}).data || {}).message || err.message || '请求出现错误，请稍后再试'
      this.state.loginBtn = false
    }
  }
}
</script>

<style lang="less" scoped>
.user-layout-login {
  label {
    font-size: 14px;
  }

  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }

  button.login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
  }
}

.tip {
  margin-bottom: 24px;

  .tip-title {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .tip-title-text {
      margin-left: 8px;
      font-size: 20px;
      font-weight: 500;
    }
  }

  .tip-des {
    color: rgba(0, 0, 0, 0.45);
  }
}
</style>
