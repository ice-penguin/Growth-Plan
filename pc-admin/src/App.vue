<template>
  <a-config-provider :locale="locale">
    <div ref="appRef" id="app">
      <router-view/>
    </div>
  </a-config-provider>
</template>

<script>
import { domTitle, setDocumentTitle } from '@/utils/domUtil'
import { userMe } from '@/api/request' // 这个不能去掉，一去掉就报错，不
import { i18nRender } from '@/locales'
export default {
  data () {
    return {
    }
  },
  computed: {
    locale () {
      // 只是为了切换语言时，更新标题
      const { title } = this.$route.meta
      title && (setDocumentTitle(`${i18nRender(title)} - ${domTitle}`))
      return this.$i18n.getLocaleMessage(this.$store.getters.lang).antLocale
    }
  },
  methods: {
    userMe() {
      userMe().then(res => {
        console.log(res)
      })
    }
  }
}
</script>
