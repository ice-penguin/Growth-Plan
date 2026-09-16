<template>
  <div id="userLayout" class="wrap" :class="['user-layout-wrapper', isMobileLayout && 'mobile']">
    <div v-if="showLoginScene" class="login-scene-panel">
      <login-scene-canvas
        :focus-field="loginScene.focusField"
        :password-visible="loginScene.passwordVisible"
        :password-length="loginScene.passwordLength"
        :look-target="loginScene.lookTarget"
      />
    </div>
    <div class="container">
      <div class="container__body">
        <router-view />
      </div>
    </div>
    <div class="footer">
      <div class="copyright">
        <a :href="currentRecord.link" class="copyright-a" target="_blank">
          Copyright©️2020 黄龙呼啦 浙ICP备15034173号-1
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { setFavicon } from '@/utils/domUtil'
import defaultFavicon from '@/assets/logo.svg'
import LoginSceneCanvas from '@/components/LoginScene/LoginSceneCanvas'

const MOBILE_BREAKPOINT = 576

export default {
  name: 'UserLayout',
  components: { LoginSceneCanvas },
  data () {
    return {
      viewportMobile: false,
      loginScene: {
        focusField: '',
        passwordVisible: false,
        passwordLength: 0,
        lookTarget: null
      },
      recordConfigs: [
        {
          domain: 'default',
          text: '浙ICP备15034173号-1',
          link: 'https://beian.miit.gov.cn'
        }
      ]
    }
  },
  provide () {
    return {
      updateLoginScene: this.updateLoginScene
    }
  },
  computed: {
    isMobileLayout () {
      return this.viewportMobile
    },
    showLoginScene () {
      return !this.viewportMobile
    },
    currentRecord () {
      const hostname = window.location.hostname
      const matchedRecord = this.recordConfigs.find(item => item.domain === hostname)
      return matchedRecord || this.recordConfigs.find(item => item.domain === 'default')
    }
  },
  mounted () {
    document.body.classList.add('userLayout')
    setFavicon(defaultFavicon)
    this.syncViewport()
    window.addEventListener('resize', this.syncViewport)
  },
  beforeDestroy () {
    document.body.classList.remove('userLayout')
    window.removeEventListener('resize', this.syncViewport)
    this.updateLoginScene({
      focusField: '',
      passwordVisible: false,
      passwordLength: 0,
      lookTarget: null
    })
  },
  methods: {
    syncViewport () {
      this.viewportMobile = window.innerWidth < MOBILE_BREAKPOINT
    },
    updateLoginScene (payload) {
      Object.assign(this.loginScene, payload)
    }
  }
}
</script>

<style lang="less" scoped>
.wrap {
  position: relative;
  display: flex;
  min-height: 100vh;
  background: #f0f2f5 url(~@/assets/background.svg) no-repeat 50%;
  background-size: 100%;

  .login-scene-panel {
    flex: 1;
    min-width: 0;
    max-width: 55%;
    display: flex;
    align-items: center;
  }

  .footer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    padding: 0 16px 32px;
    text-align: center;
    pointer-events: none;

    .copyright {
      color: rgba(0, 0, 0, 0.45);
      font-size: 14px;
      pointer-events: auto;

      &-a {
        color: rgba(0, 0, 0, 0.45);
      }
    }
  }
}

#userLayout.user-layout-wrapper {
  height: 100%;

  &.mobile {
    display: block;

    .container {
      flex: none;
      min-width: 0;
      max-width: 100%;
      width: 100%;
      padding: 32px 16px 72px;

      &__body {
        max-width: 100%;
        transform: none;
      }

      .main {
        max-width: 368px;
        width: 100%;
        min-width: 0;
      }
    }
  }

  .container {
    flex: 0 0 45%;
    min-width: 400px;
    max-width: 520px;
    min-height: 100vh;
    background: transparent;
    padding: 48px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;

    a {
      text-decoration: none;
    }

    &__body {
      width: 100%;
      max-width: 368px;
      margin: 0 auto;
      transform: translateY(6%);
    }

    .main {
      min-width: 260px;
      width: 100%;
      max-width: 368px;
      margin: 0 auto;
    }
  }
}
</style>
