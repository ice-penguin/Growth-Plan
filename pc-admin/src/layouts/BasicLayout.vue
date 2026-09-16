<template>
  <pro-layout
    :menus="menus"
    :collapsed="collapsed"
    :mediaQuery="query"
    :isMobile="isMobile"
    :handleMediaQuery="handleMediaQuery"
    :handleCollapse="handleCollapse"
    :i18nRender="i18nRender"
    :siderWidth="208"
    :sub-menu-close-delay="0"
    @breakpoint="breakpoint"
    v-bind="settings"
  >
    <!-- 1.0.0+ 版本 pro-layout 提供 API，
          我们推荐使用这种方式进行 LOGO 和 title 自定义
    -->
    <template v-slot:menuHeaderRender>
      <div class="menu-header-user" :class="{ 'menu-header-user--collapsed': collapsed }" :title="nickname">
        <span v-if="!collapsed" class="menu-header-user__rect">{{ displayName }}</span>
        <span v-else class="menu-header-user__circle">{{ collapsedInitial }}</span>
      </div>
    </template>
    <template v-slot:rightContentRender>
      <right-content
        :top-menu="settings.layout === 'topmenu'"
        :is-mobile="isMobile"
        :theme="settings.theme"
      />
    </template>
    <template v-slot:footerRender>
      <!-- <global-footer /> -->
      <div></div>
    </template>
    <router-view />
  </pro-layout>
</template>

<script>
import { SettingDrawer, updateTheme } from '@ant-design-vue/pro-layout'
import { i18nRender } from '@/locales'
import { mapGetters, mapState } from 'vuex'
import { CONTENT_WIDTH_TYPE, SIDEBAR_TYPE, TOGGLE_MOBILE_TYPE } from '@/store/mutation-types'
import { configShow } from '@/api/request'
import { setFavicon } from '@/utils/domUtil'

import defaultSettings from '@/config/defaultSettings'
import RightContent from '@/components/GlobalHeader/RightContent'

export default {
  name: 'BasicLayout',
  components: {
    SettingDrawer,
    RightContent
  },
  data() {
    return {
      // preview.pro.antdv.com only use.
      isProPreviewSite: process.env.VUE_APP_PREVIEW === 'true' && process.env.NODE_ENV !== 'development',
      // end

      // base
      menus: [],
      // 侧栏收起状态
      collapsed: false,
      title: defaultSettings.title,
      settings: {
        // 布局类型
        layout: defaultSettings.layout, // 'sidemenu', 'topmenu'
        // CONTENT_WIDTH_TYPE
        contentWidth: defaultSettings.layout === 'sidemenu' ? CONTENT_WIDTH_TYPE.Fluid : defaultSettings.contentWidth,
        // 主题 'dark' | 'light'
        theme: defaultSettings.navTheme,
        // 主色调
        primaryColor: defaultSettings.primaryColor,
        fixedHeader: defaultSettings.fixedHeader,
        fixSiderbar: defaultSettings.fixSiderbar,
        colorWeak: defaultSettings.colorWeak,

        hideHintAlert: false,
        hideCopyButton: false
      },
      // 媒体查询
      query: {},

      // 是否手机模式
      isMobile: false,
      locale: {
        itemUnit: '项',
        itemsUnit: '项',
        notFoundContent: '暂无菜单'
      },
      logo: '',
      logoMin: ''
    }
  },
  computed: {
    ...mapState({
      // 动态主路由
      mainMenu: state => state.permission.addRouters
    }),
    ...mapGetters(['nickname']),
    displayName() {
      return this.truncateName(this.nickname, 8)
    },
    collapsedInitial() {
      const name = (this.nickname || '').trim()
      return name ? name.charAt(0) : '—'
    }
  },
  created() {
    const routes = this.mainMenu.find(item => item.path === '/')
    this.menus = (routes && routes.children) || []
    // 处理侧栏收起状态
    this.$watch('collapsed', () => {
      this.$store.commit(SIDEBAR_TYPE, this.collapsed)
    })
    this.$watch('isMobile', () => {
      this.$store.commit(TOGGLE_MOBILE_TYPE, this.isMobile)
    })
  },
  mounted() {
    this.configShow()
    const userAgent = navigator.userAgent
    if (userAgent.indexOf('Edge') > -1) {
      this.$nextTick(() => {
        this.collapsed = !this.collapsed
        setTimeout(() => {
          this.collapsed = !this.collapsed
        }, 16)
      })
    }

    // 仅在开启 VUE_APP_PREVIEW 且 webpack 注入 ThemeColorReplacer 时切换主题色
    // 开发环境未生成 theme-colors.css 时调用会导致「正在切换主题」loading 永不关闭
    if (process.env.VUE_APP_PREVIEW === 'true') {
      updateTheme(this.settings.primaryColor)
    }
  },
  methods: {
    i18nRender,
    truncateName(name, maxLen) {
      const text = (name || '').trim()
      if (!text) return '未登录'
      if (text.length <= maxLen) return text
      return `${text.slice(0, maxLen - 1)}…`
    },
    configShow() {
      configShow().then(res => {
        const result = res.data.result || {}
        this.logo = result.logo || ''
        this.logoMin = result.logoMin || result.logo || ''
        if (this.logoMin || this.logo) {
          setFavicon(this.logoMin || this.logo)
        }
      }).catch(() => {})
    },
    handleMediaQuery(val) {
      this.query = val
      if (this.isMobile && !val['screen-xs']) {
        this.isMobile = false
        return
      }
      if (!this.isMobile && val['screen-xs']) {
        this.isMobile = true
        this.collapsed = false
        this.settings.contentWidth = CONTENT_WIDTH_TYPE.Fluid
      }
    },
    breakpoint(v) {
      console.log(v)
    },
    handleCollapse(val) {
      this.collapsed = val
    }
  }
}
</script>

<style lang="less" scoped>
@import './BasicLayout.less';

.menu-header-user {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 64px;
  padding: 12px;
  box-sizing: border-box;

  &--collapsed {
    padding: 12px 0;
  }

  &__rect {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 40px;
    padding: 0 12px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.12);
    font-size: 15px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.95);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1;
    text-align: center;
    box-sizing: border-box;
  }

  &__circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.18);
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1;
    flex-shrink: 0;
  }
}

/deep/ .ant-pro-sider-menu-logo {
  padding: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  box-sizing: border-box !important;

  > a {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }
}

/deep/.ant-pro-global-header {
  height: 56px;
  line-height: 56px;
  display: flex;
  width: 100%;
  justify-content: space-between;
  flex-wrap: nowrap;
}
/deep/ .ant-pro-global-header-content {
  flex: auto;
  height: 56px;
  line-height: 56px;
}
.menu-set-btn {
  width: 80px;
  float: right;
  cursor: pointer;
}
.menu-show-btn {
  width: 20px;
  float: right;
  margin-right: 10px;
  cursor: pointer;
}
.menu-box {
  display: flex;
  width: calc(100% - 125px);
  height: 56px;
  // float: right;
  overflow-y: hidden;
  overflow-x: auto;
  justify-content: flex-end;
}
.menu {
  // width: 100px;
  // float: right;
  margin-right: 20px;
  cursor: pointer;
}
.menu-name {
  margin-top: 8px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  color: #1890ff;
}
.menu-des {
  height: 20px;
  line-height: 20px;
  font-size: 12px;
  text-align: center;
  color: rgba(0, 0, 0, 0.45);
}
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active for below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
</style>
