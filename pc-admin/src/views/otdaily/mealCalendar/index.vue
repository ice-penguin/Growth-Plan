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
              <a-button icon="download" :disabled="!displayRows.length" @click="handleExport">导出</a-button>
              <span class="filter-switches">
                <a-switch v-model="showEmptyPeople" size="small" />
                <span class="switch-label">无数据人员</span>
                <a-switch v-model="showEmptyDays" size="small" />
                <span class="switch-label">无数据日期</span>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="calendar-wrap">
        <a-spin :spinning="loading">
          <table v-if="days.length" class="meal-calendar">
            <thead>
              <tr>
                <th class="col-name">员工</th>
                <th class="col-meal">餐次</th>
                <th v-for="day in displayDays" :key="'h-' + day" class="col-day">{{ day }}</th>
                <th class="col-sum">人数合计</th>
                <th class="col-sum">金额合计</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="row in displayRows">
                <tr :key="row._user + '-lunch'">
                  <td class="col-name" :rowspan="2">{{ row.name }}</td>
                  <td class="col-meal">午餐</td>
                  <td
                    v-for="day in displayDays"
                    :key="row._user + '-l-' + day"
                    class="col-day"
                    :class="{ 'has-value': row.lunchDays[day] > 0 }"
                  >
                    {{ formatAmount(row.lunchDays[day]) }}
                  </td>
                  <td class="col-sum">{{ row.lunchCount || '' }}</td>
                  <td class="col-sum">{{ formatAmount(row.lunchAmount) }}</td>
                </tr>
                <tr :key="row._user + '-dinner'">
                  <td class="col-meal">晚餐</td>
                  <td
                    v-for="day in displayDays"
                    :key="row._user + '-d-' + day"
                    class="col-day"
                    :class="{ 'has-value': row.dinnerDays[day] > 0 }"
                  >
                    {{ formatAmount(row.dinnerDays[day]) }}
                  </td>
                  <td class="col-sum">{{ row.dinnerCount || '' }}</td>
                  <td class="col-sum">{{ formatAmount(row.dinnerAmount) }}</td>
                </tr>
              </template>
              <tr v-if="!displayRows.length">
                <td :colspan="displayDays.length + 4" class="empty-cell">暂无员工数据</td>
              </tr>
            </tbody>
            <tfoot v-if="displayRows.length">
              <tr>
                <td class="col-name" rowspan="2">合计</td>
                <td class="col-meal">人数合计</td>
                <td v-for="item in displayDayTotals" :key="'pc-' + item.day" class="col-day foot-cell">
                  {{ item.personCount || '' }}
                </td>
                <td class="col-sum foot-cell">{{ displayTotal.personCount || '' }}</td>
                <td class="col-sum foot-cell">{{ formatAmount(displayTotal.amount) }}</td>
              </tr>
              <tr>
                <td class="col-meal">金额合计</td>
                <td v-for="item in displayDayTotals" :key="'ac-' + item.day" class="col-day foot-cell">
                  {{ formatAmount(item.amount) }}
                </td>
                <td class="col-sum foot-cell"></td>
                <td class="col-sum foot-cell">{{ formatAmount(displayTotal.amount) }}</td>
              </tr>
            </tfoot>
          </table>
          <a-empty v-else description="请选择月份查询" />
        </a-spin>
      </div>
    </page-header-wrapper>
  </a-card>
</template>

<script>
import { otdailyMealCalendar } from '@/api/request'
import { exportAoaToExcel, appendSignerRows } from '@/utils/exportExcel'
import { deviceMixin } from '@/store/device-mixin'
import { monthQuickSelectMixin, getDefaultMonth } from '@/mixins/monthQuickSelectMixin'

export default {
  name: 'OtdailyMealCalendar',
  mixins: [deviceMixin, monthQuickSelectMixin],
  data() {
    const month = getDefaultMonth()
    return {
      monthValue: month,
      month: month.format('YYYY-MM'),
      loading: false,
      showEmptyPeople: false,
      showEmptyDays: false,
      days: [],
      rows: [],
      dayTotals: [],
      total: {
        personCount: 0,
        amount: 0
      }
    }
  },
  computed: {
    displayRows() {
      if (this.showEmptyPeople) {
        return this.rows
      }
      return this.rows.filter(row => this.rowHasData(row))
    },
    displayDays() {
      if (this.showEmptyDays) {
        return this.days
      }
      return this.days.filter(day => this.dayHasData(day, this.displayRows))
    },
    displayDayTotals() {
      return this.displayDays.map(day => {
        let lunchCount = 0
        let dinnerCount = 0
        let amount = 0
        this.displayRows.forEach(row => {
          const lunch = Number(row.lunchDays[day]) || 0
          const dinner = Number(row.dinnerDays[day]) || 0
          if (lunch > 0) {
            lunchCount += 1
            amount += lunch
          }
          if (dinner > 0) {
            dinnerCount += 1
            amount += dinner
          }
        })
        return {
          day,
          personCount: lunchCount + dinnerCount,
          amount: Math.round(amount * 100) / 100
        }
      })
    },
    displayTotal() {
      const total = this.displayRows.reduce(
        (acc, row) => {
          acc.personCount += row.personCount || (row.lunchCount || 0) + (row.dinnerCount || 0)
          acc.amount += Number(row.amount) || 0
          return acc
        },
        { personCount: 0, amount: 0 }
      )
      total.amount = Math.round(total.amount * 100) / 100
      return total
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    rowHasData(row) {
      if (!row) return false
      return (
        Number(row.amount) > 0 ||
        Number(row.personCount) > 0 ||
        Number(row.lunchCount) > 0 ||
        Number(row.dinnerCount) > 0
      )
    },
    dayHasData(day, rows) {
      return (rows || []).some(row => {
        return Number(row.lunchDays[day]) > 0 || Number(row.dinnerDays[day]) > 0
      })
    },
    onMonthChange(val) {
      this.month = val ? val.format('YYYY-MM') : ''
    },
    handleReset() {
      this.resetToDefaultMonth()
    },
    loadData() {
      if (!this.month) {
        this.$message.warning('请选择月份')
        return
      }
      this.loading = true
      otdailyMealCalendar({ month: this.month })
        .then(res => {
          const result = (res.data && res.data.result) || {}
          this.days = result.days || []
          this.rows = result.rows || []
          this.dayTotals = result.dayTotals || []
          this.total = result.total || { personCount: 0, amount: 0 }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleExport() {
      if (!this.displayRows.length) {
        this.$message.warning('暂无数据可导出')
        return
      }
      const aoa = []
      aoa.push([`餐费日历 ${this.month}`])
      aoa.push(['员工', '餐次', ...this.displayDays.map(String), '人数合计', '金额合计'])

      this.displayRows.forEach(row => {
        aoa.push([
          row.name,
          '午餐',
          ...this.displayDays.map(day => this.formatAmount(row.lunchDays[day])),
          row.lunchCount || '',
          this.formatAmount(row.lunchAmount)
        ])
        aoa.push([
          '',
          '晚餐',
          ...this.displayDays.map(day => this.formatAmount(row.dinnerDays[day])),
          row.dinnerCount || '',
          this.formatAmount(row.dinnerAmount)
        ])
      })

      aoa.push([
        '合计',
        '人数合计',
        ...this.displayDayTotals.map(item => item.personCount || ''),
        this.displayTotal.personCount || '',
        this.formatAmount(this.displayTotal.amount)
      ])
      aoa.push([
        '',
        '金额合计',
        ...this.displayDayTotals.map(item => this.formatAmount(item.amount)),
        '',
        this.formatAmount(this.displayTotal.amount)
      ])

      // 表头：员工、餐次、1号... => 15 号列索引 = 2 + days.indexOf(15)
      const day15Index = this.displayDays.indexOf(15)
      const approverColIndex = day15Index >= 0 ? 2 + day15Index : 16
      appendSignerRows(aoa, '', '', approverColIndex)
      exportAoaToExcel(aoa, `餐费日历_${this.month}`, '餐费日历')
      this.$message.success('导出成功')
    },
    formatAmount(val) {
      const num = Number(val)
      if (!num) {
        return ''
      }
      return String(parseFloat(num.toFixed(2)))
    }
  }
}
</script>

<style scoped lang="less">
.filter-switches {
  display: inline-flex;
  align-items: center;
  margin-left: 12px;
  vertical-align: middle;

  .switch-label {
    margin: 0 12px 0 6px;
    color: rgba(0, 0, 0, 0.65);
    font-size: 13px;
  }
}

.calendar-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid #e8e8e8;
  background: #fff;
  padding: 12px;
}

.meal-calendar {
  border-collapse: collapse;
  width: max-content;
  min-width: 100%;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.85);

  th,
  td {
    border: 1px solid #e8e8e8;
    padding: 6px 4px;
    text-align: center;
    white-space: nowrap;
    background: #fff;
  }

  thead th {
    background: #fafafa;
    font-weight: 500;
  }

  .col-name {
    min-width: 88px;
  }

  .col-meal {
    min-width: 56px;
  }

  .col-day {
    min-width: 52px;
  }

  .col-sum {
    min-width: 72px;
    background: #fafafa;
  }

  tbody tr:nth-child(4n + 3) td,
  tbody tr:nth-child(4n + 4) td {
    background: #fcfcfc;
  }

  .has-value {
    color: #1890ff;
    font-weight: 500;
  }

  tfoot td {
    background: #f5f5f5;
    font-weight: 500;
  }

  .empty-cell {
    padding: 32px 0;
    color: rgba(0, 0, 0, 0.45);
  }
}

@media (max-width: 576px) {
  .filter-switches {
    display: flex;
    width: 100%;
    margin: 8px 0 0;
    flex-wrap: wrap;
  }

  .calendar-wrap {
    padding: 8px;
  }
}
</style>
