<template>
  <a-card :bordered="false">
    <page-header-wrapper :breadcrumb="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="searchGutter">
            <a-col :xxl="6" :xl="8" :xs="24" :sm="24">
              <a-form-item label="月份">
                <a-month-picker
                  v-model="monthValue"
                  style="width: 100%"
                  placeholder="请选择月份"
                  @change="onMonthChange"
                />
              </a-form-item>
            </a-col>
            <a-col class="table-operator" :xxl="14" :xl="16" :xs="24" :sm="24">
              <a-button-group class="month-quick">
                <a-button
                  v-for="item in monthQuickOptions"
                  :key="item.key"
                  :type="month === item.value ? 'primary' : 'default'"
                  @click="selectQuickMonth(item.value)"
                >
                  {{ item.label }}
                </a-button>
              </a-button-group>
              <a-button type="primary" :loading="loading" @click="loadData">查询</a-button>
              <a-button @click="handleReset">重置</a-button>
              <a-button icon="download" :loading="exporting" :disabled="!rows.length" @click="handleExport">
                导出报销单
              </a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="summary-bar">
        <span>餐费合计：{{ formatMoney(total.mealAmount) }}</span>
        <span>打车合计：{{ formatMoney(total.taxiAmount) }}</span>
        <span class="total">总合计：{{ formatMoney(total.totalAmount) }}</span>
      </div>

      <a-table
        rowKey="_user"
        :columns="columns"
        :data-source="rows"
        :loading="loading"
        :pagination="false"
        :scroll="tableScroll"
      >
        <span slot="amount" slot-scope="text">
          {{ formatMoney(text) }}
        </span>
      </a-table>
    </page-header-wrapper>
  </a-card>
</template>

<script>
import { mapGetters } from 'vuex'
import { otdailyMonthSummary, otdailyReimburseExport } from '@/api/request'
import { deviceMixin } from '@/store/device-mixin'
import { monthQuickSelectMixin, getDefaultMonth } from '@/mixins/monthQuickSelectMixin'

export default {
  name: 'OtdailyMonthSummary',
  mixins: [deviceMixin, monthQuickSelectMixin],
  data() {
    const month = getDefaultMonth()
    return {
      monthValue: month,
      month: month.format('YYYY-MM'),
      loading: false,
      exporting: false,
      rows: [],
      total: {
        mealAmount: 0,
        taxiAmount: 0,
        totalAmount: 0
      },
      tableY: 500,
      columns: [
        {
          title: '员工',
          dataIndex: 'name'
        },
        {
          title: '餐费合计',
          dataIndex: 'mealAmount',
          scopedSlots: { customRender: 'amount' }
        },
        {
          title: '打车合计',
          dataIndex: 'taxiAmount',
          scopedSlots: { customRender: 'amount' }
        },
        {
          title: '总合计',
          dataIndex: 'totalAmount',
          scopedSlots: { customRender: 'amount' }
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['fullHeight']),
    tableScroll() {
      return this.buildTableScroll(this.tableY, 560)
    }
  },
  created() {
    this.tableY = this.fullHeight - 300
    this.loadData()
  },
  methods: {
    onMonthChange(val) {
      this.month = val ? val.format('YYYY-MM') : ''
    },
    handleReset() {
      this.resetToDefaultMonth()
    },
    handleExport() {
      if (!this.month) {
        this.$message.warning('请选择月份')
        return
      }
      if (!this.rows.length) {
        this.$message.warning('暂无已通过费用可导出')
        return
      }
      this.exporting = true
      otdailyReimburseExport({ month: this.month })
        .then(res => {
          this.saveBlob(res, `费用报销单_${this.month}.xlsx`)
          this.$message.success('导出成功')
        })
        .catch(() => {})
        .finally(() => {
          this.exporting = false
        })
    },
    saveBlob(res, fallbackName) {
      const headers = (res && res.headers) || {}
      const disp = headers['content-disposition'] || headers['Content-Disposition'] || ''
      let fileName = fallbackName
      const star = disp.match(/filename\*=UTF-8''([^;]+)/i)
      const match = disp.match(/filename="?([^";]+)"?/i)
      if (star) {
        fileName = decodeURIComponent(star[1])
      } else if (match) {
        fileName = decodeURIComponent(match[1])
      }
      const url = window.URL.createObjectURL(res.data)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    },
    loadData() {
      if (!this.month) {
        this.$message.warning('请选择月份')
        return
      }
      this.loading = true
      otdailyMonthSummary({ month: this.month })
        .then(res => {
          const result = (res.data && res.data.result) || {}
          this.rows = result.rows || []
          this.total = result.total || {
            mealAmount: 0,
            taxiAmount: 0,
            totalAmount: 0
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    formatMoney(val) {
      const num = Number(val)
      if (isNaN(num)) {
        return '0.00'
      }
      return num.toFixed(2)
    }
  }
}
</script>

<style scoped lang="less">
.summary-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  color: rgba(0, 0, 0, 0.85);

  .total {
    font-weight: 600;
  }
}
</style>
