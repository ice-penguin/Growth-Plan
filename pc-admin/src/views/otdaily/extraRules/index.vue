<template>
  <a-card :bordered="false">
    <page-header-wrapper :breadcrumb="false">
      <a-alert type="info" show-icon style="margin-bottom: 16px" message="补充规则只给线下核对使用，不会拦截员工录入。保存后，按月下载包里的 rules.md / rules.json 会带上这段文字。" />
      <div class="hint">
        <div class="hint-title">建议写清这些内容：</div>
        <ul>
          <li>凭证金额是否等于填写金额</li>
          <li>发票日期是否对得上加班日（打车允许次日凌晨）</li>
          <li>抬头、税号、是否正式发票</li>
          <li>午餐 / 晚餐怎么从票面区分</li>
        </ul>
      </div>
      <a-textarea
        v-model="extraRules"
        :rows="16"
        :placeholder="placeholder"
      />
      <div class="actions">
        <a-button type="primary" :loading="saving" @click="handleSave">保存</a-button>
      </div>
    </page-header-wrapper>
  </a-card>
</template>

<script>
import { configShow, configExtraRulesUpdate } from '@/api/request'

export default {
  name: 'ExtraRules',
  data() {
    return {
      extraRules: '',
      saving: false,
      placeholder: [
        '请用文字写清线下核对时要检查什么，例如：',
        '凭证金额是否等于填写金额',
        '发票日期是否对得上加班日（打车允许次日凌晨）',
        '抬头、税号、是否正式发票',
        '午餐 / 晚餐怎么从票面区分'
      ].join('\n')
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    loadData() {
      configShow().then(res => {
        const result = (res.data && res.data.result) || {}
        this.extraRules = result.extraRules || ''
      })
    },
    handleSave() {
      this.saving = true
      configExtraRulesUpdate({ extraRules: this.extraRules || '' })
        .then(() => {
          this.$message.success('已保存')
        })
        .finally(() => {
          this.saving = false
        })
    }
  }
}
</script>

<style scoped lang="less">
.hint {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #fafafa;
  border: 1px solid #f0f0f0;

  .hint-title {
    margin-bottom: 8px;
    font-weight: 600;
  }

  ul {
    margin: 0;
    padding-left: 20px;
    color: rgba(0, 0, 0, 0.65);
  }
}

.actions {
  margin-top: 16px;
}
</style>
