<!--
 * @Author: yzy
 * @LastEditors: yzy
 * I love coding too
-->
<template>
  <a-card :bordered="false">
    <page-header-wrapper :breadcrumb="false">
      <a-tabs default-active-key="1" tab-position="left" class="tabs" type="card">
        <a-tab-pane key="1" tab="菜单设置">
          <menu-setting></menu-setting>
        </a-tab-pane>
        <a-tab-pane key="2" tab="页面设置">
          <page-setting></page-setting>
        </a-tab-pane>
        <a-tab-pane key="3" tab="按钮设置">
          <button-setting></button-setting>
        </a-tab-pane>
      </a-tabs>
    </page-header-wrapper>
  </a-card>
</template>
<script>
import ButtonSetting from './modules/ButtonSetting'
import MenuSetting from './modules/MenuSetting'
import PageSetting from './modules/PageSetting'
export default {
  components: {
    ButtonSetting,
    MenuSetting,
    PageSetting
  }
}
</script>
<style lang="less" scoped>
.tabs {
  margin: 20px 0 0 0px;
}
</style>
