<!--
 * @Author: jianxl
 * @LastEditors: jianxl
 * @I love coding
-->
<template>
  <div class="content">
    <!-- <a-badge
      show-zero
      :number-style="{
        backgroundColor: '#fff',
        color: '#999',
        boxShadow: '0 0 0 1px #d9d9d9 inset',
      }"
      text="已选"
    /> -->
    <span class="badge-status choose"></span>
    <span class="label">已选</span>
    <span class="badge-status occupy"></span>
    <span class="label">已占</span>
    <span class="badge-status white"></span>
    <span class="label">可预订</span>
    <span class="badge-status booking"></span>
    <span class="label">预订中</span>
    <span class="badge-status using"></span>
    <span class="label">使用中</span>
    <span class="badge-status long"></span>
    <span class="label">长包预订</span>
    <span class="badge-status common"></span>
    <span class="label">普通预订</span>
    <span class="badge-status train"></span>
    <span class="label">培训预订</span>
    <span class="badge-status used"></span>
    <span class="label">已使用</span>
    <span class="badge-status end"></span>
    <span class="label">已过期</span>
    <!-- <a-badge color="#36CBCB" class="label" text="预订中" />
    <a-badge color="#52C41B" class="label" text="使用中" />
    <a-badge color="#975FE4" class="label" text="长包预订" />
    <a-badge color="#1890FF" class="label" text="普通预订" />
    <a-badge color="#FAAD14" class="label" text="培训预订" />
    <a-badge color="rgba(0, 0, 0, 0.16)" class="label" text="已使用" />
    <a-badge color="rgba(0, 0, 0, 0.25)" text="已过期" /> -->
  </div>
</template>

<script>
export default {

}
</script>

<style lang="less" scoped>
  .content {
    font-size: 12px;
    line-height: 22px;
    color: rgba(0, 0, 0, 0.65);
    font-weight: 400;
  }
  .badge-status {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    // vertical-align: middle;
    // margin-top: -4px;
    margin-right: 4px;
  }
  .choose {
    background: #E6F7FF;
    border: 1px solid #1890FF;
  }
  .white {
    background: #FFFFFF;
    border: 1px solid #D9D9D9;
  }
  .occupy {
    background: #F44141;
  }
  .booking {
    background: #FF7A45;
  }
  .using {
    background: #F27FA6;
  }
  .long {
    background: #FAB055;
  }
  .common {
    background: #65d6de;
  }
  .train {
    background: #889BFE;
  }
  .used {
    background: #9398A4;
  }
  .end {
    background: #C4C6CB;
  }
  .label {
    margin-right: 24px;
  }
  /deep/ .ant-badge-status-text {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.65);
    font-weight: 400;
  }
</style>
