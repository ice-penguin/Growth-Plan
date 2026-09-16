<template>
  <a-card :bordered="false">
    <page-header-wrapper :breadcrumb="false">
      <div class="welcome">
        <h2>欢迎使用成长计划</h2>
        <p>登录已就绪，业务模块会陆续加上。</p>
      </div>
    </page-header-wrapper>
  </a-card>
</template>

<script>
export default {
  name: 'Welcome'
}
</script>

<style lang="less" scoped>
.welcome {
  padding: 48px 24px;
  text-align: center;

  h2 {
    margin-bottom: 12px;
    font-size: 24px;
    font-weight: 500;
  }

  p {
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
  }
}
</style>
