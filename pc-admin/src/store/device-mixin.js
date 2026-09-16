import { mapState } from 'vuex'

const deviceMixin = {
  computed: {
    ...mapState({
      isMobile: state => state.app.isMobile
    }),
    /** 常规抽屉宽度：手机全屏，桌面 36% */
    drawerWidth() {
      return this.isMobile ? '100%' : '36%'
    },
    /** 宽抽屉：手机全屏，桌面 60% */
    drawerWidthWide() {
      return this.isMobile ? '100%' : '60%'
    },
    /** 搜索区 gutter */
    searchGutter() {
      return this.isMobile ? 16 : 48
    }
  },
  methods: {
    /**
     * 列表表格 scroll：手机补横向滚动
     * @param {number} [y]
     * @param {number} [x=900]
     */
    buildTableScroll(y, x = 900) {
      const scroll = {}
      if (y) {
        scroll.y = y
      }
      if (this.isMobile) {
        scroll.x = x
      }
      return scroll
    }
  }
}

export { deviceMixin }
export default deviceMixin
