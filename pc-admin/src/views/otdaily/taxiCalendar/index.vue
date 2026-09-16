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
            <a-col class="table-operator" :xxl="16" :xl="16" :xs="24" :sm="24">
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
              <a-button icon="download" :disabled="!displayRows.length" @click="handleExportCalendar">导出日历</a-button>
              <a-button icon="download" :loading="exporting" :disabled="!days.length" @click="handleExport">导出原表</a-button>
              <span class="filter-switches">
                <a-switch v-model="showEmptyPeople" size="small" />
                <span class="switch-label">无数据人员</span>
                <a-switch v-model="showEmptyDays" size="small" />
                <span class="switch-label">无数据日期</span>
              </span>
              <span v-if="taxiAfterTime" class="threshold-tip">
                打车阈值：打卡 &gt; {{ taxiAfterTime }} 且 ≤ 次日 {{ taxiOvernightEnd }}
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="calendar-wrap">
        <a-spin :spinning="loading">
          <div v-if="days.length" class="sheet-box">
            <div class="sheet-title">打卡时间 统计日期：{{ dateStart }} 至 {{ dateEnd }}</div>
            <table class="taxi-calendar">
              <thead>
                <tr>
                  <th class="col-name">姓名</th>
                  <th class="col-type">类型</th>
                  <th
                    v-for="item in displayDayHeaders"
                    :key="'h-' + item.day"
                    class="col-day"
                    :class="{ weekend: item.isWeekend }"
                  >
                    {{ item.label }}
                  </th>
                  <th class="col-sum">人数合计</th>
                  <th class="col-sum">金额合计</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="row in displayRows">
                  <tr :key="row._user + '-punch'">
                    <td class="col-name" :rowspan="2">{{ row.name }}</td>
                    <td class="col-type">打卡</td>
                    <td
                      v-for="item in displayDayHeaders"
                      :key="row._user + '-p-' + item.day"
                      class="col-day"
                      :class="[
                        { weekend: item.isWeekend },
                        cellStatusClass(row.days[item.day])
                      ]"
                    >
                      <a-tooltip
                        v-if="getLastPunchText(row.days[item.day])"
                        placement="top"
                        overlay-class-name="taxi-punch-tooltip"
                      >
                        <template slot="title">
                          <div class="punch-tip">{{ formatAllPunches(row.days[item.day]) }}</div>
                        </template>
                        <span class="punch-last">{{ getLastPunchText(row.days[item.day]) }}</span>
                      </a-tooltip>
                    </td>
                    <td class="col-sum"></td>
                    <td class="col-sum"></td>
                  </tr>
                  <tr :key="row._user + '-amount'">
                    <td class="col-type">金额</td>
                    <td
                      v-for="item in displayDayHeaders"
                      :key="row._user + '-a-' + item.day"
                      class="col-day"
                      :class="[
                        { weekend: item.isWeekend },
                        cellAmountClass(row.days[item.day])
                      ]"
                    >
                      {{ formatAmount(row.days[item.day] && row.days[item.day].taxiAmount) }}
                    </td>
                    <td class="col-sum">{{ row.claimCount || row.eligibleCount || '' }}</td>
                    <td class="col-sum">{{ formatAmount(row.amount) }}</td>
                  </tr>
                </template>
                <tr v-if="!displayRows.length">
                  <td :colspan="displayDayHeaders.length + 4" class="empty-cell">暂无员工数据</td>
                </tr>
              </tbody>
              <tfoot v-if="displayRows.length">
                <tr>
                  <td class="col-name" rowspan="2">合计</td>
                  <td class="col-type">人数合计</td>
                  <td v-for="item in displayDayTotals" :key="'pc-' + item.day" class="col-day foot-cell">
                    {{ item.personCount || '' }}
                  </td>
                  <td class="col-sum foot-cell">{{ displayTotal.personCount || '' }}</td>
                  <td class="col-sum foot-cell">{{ formatAmount(displayTotal.amount) }}</td>
                </tr>
                <tr>
                  <td class="col-type">金额合计</td>
                  <td v-for="item in displayDayTotals" :key="'ac-' + item.day" class="col-day foot-cell">
                    {{ formatAmount(item.amount) }}
                  </td>
                  <td class="col-sum foot-cell"></td>
                  <td class="col-sum foot-cell">{{ formatAmount(displayTotal.amount) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <a-empty v-else description="请选择月份查询" />
        </a-spin>
      </div>
    </page-header-wrapper>
  </a-card>
</template>

<script>
import { attendanceTaxiCalendar, attendanceTaxiCalendarExport } from '@/api/request'
import { exportAoaToCsv, appendSignerRows } from '@/utils/exportExcel'
import { deviceMixin } from '@/store/device-mixin'
import { monthQuickSelectMixin, getDefaultMonth } from '@/mixins/monthQuickSelectMixin'

function timeToMinutes(time) {
  const [h, m] = String(time || '0:0').split(':').map(Number)
  return h * 60 + m
}

/** 跨夜感知排序：≤ overnightEnd 视为次日凌晨，排在当晚之后 */
function punchSortKey(time, overnightEndMins) {
  let mins = timeToMinutes(time)
  if (mins <= overnightEndMins) {
    mins += 24 * 60
  }
  return mins
}

export default {
  name: 'OtdailyTaxiCalendar',
  mixins: [deviceMixin, monthQuickSelectMixin],
  data() {
    const month = getDefaultMonth()
    return {
      monthValue: month,
      month: month.format('YYYY-MM'),
      loading: false,
      exporting: false,
      showEmptyPeople: false,
      showEmptyDays: false,
      taxiAfterTime: '',
      taxiOvernightEnd: '05:00',
      dateStart: '',
      dateEnd: '',
      days: [],
      dayHeaders: [],
      rows: [],
      dayTotals: [],
      total: { personCount: 0, amount: 0 }
    }
  },
  computed: {
    displayRows() {
      if (this.showEmptyPeople) {
        return this.rows
      }
      return this.rows.filter(row => this.rowHasData(row))
    },
    displayDayHeaders() {
      if (this.showEmptyDays) {
        return this.dayHeaders
      }
      return this.dayHeaders.filter(item => this.dayHasData(item.day, this.displayRows))
    },
    displayDayTotals() {
      return this.displayDayHeaders.map(item => {
        let personCount = 0
        let amount = 0
        this.displayRows.forEach(row => {
          const cell = row.days[item.day]
          const taxiAmount = cell ? Number(cell.taxiAmount) || 0 : 0
          if (taxiAmount > 0) {
            personCount += 1
            amount += taxiAmount
          }
        })
        return {
          day: item.day,
          personCount,
          amount: Math.round(amount * 100) / 100
        }
      })
    },
    displayTotal() {
      const total = this.displayRows.reduce(
        (acc, row) => {
          acc.personCount += row.claimCount || row.eligibleCount || 0
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
    cellHasTaxi(cell) {
      return !!(cell && Number(cell.taxiAmount) > 0)
    },
    rowHasData(row) {
      if (!row) return false
      if (Number(row.amount) > 0 || Number(row.claimCount) > 0) {
        return true
      }
      const days = row.days || {}
      return Object.keys(days).some(day => this.cellHasTaxi(days[day]))
    },
    dayHasData(day, rows) {
      return (rows || []).some(row => this.cellHasTaxi(row.days && row.days[day]))
    },
    getPunches(cell) {
      if (!cell) return []
      if (cell.punches && cell.punches.length) {
        return cell.punches
      }
      if (cell.rawText) {
        return String(cell.rawText)
          .replace(/\r/g, '')
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
          .map(line => {
            const isField = line.includes('外勤')
            const match = line.match(/(\d{1,2}:\d{2})/)
            if (!match) return null
            const [h, m] = match[1].split(':').map(Number)
            return {
              time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
              isField,
              raw: line
            }
          })
          .filter(Boolean)
      }
      return []
    },
    getLastPunch(cell) {
      const punches = this.getPunches(cell)
      if (!punches.length) {
        if (cell && cell.lastPunchTime) {
          return { time: cell.lastPunchTime, isField: false }
        }
        return null
      }
      let best = null
      let bestKey = -1
      const overnightEndMins = timeToMinutes(this.taxiOvernightEnd || '05:00')
      punches.forEach(p => {
        const key = punchSortKey(p.time, overnightEndMins)
        if (key >= bestKey) {
          bestKey = key
          best = p
        }
      })
      return best
    },
    getLastPunchText(cell) {
      const last = this.getLastPunch(cell)
      if (!last) return ''
      return `${last.time}${last.isField ? '外勤' : ''}`
    },
    formatAllPunches(cell) {
      const punches = this.getPunches(cell)
      if (punches.length) {
        return punches.map(p => `${p.time}${p.isField ? '外勤' : ''}`).join('\n')
      }
      if (cell && cell.rawText) {
        return String(cell.rawText).replace(/\r/g, '').trim()
      }
      return this.getLastPunchText(cell)
    },
    onMonthChange(val) {
      this.month = val ? val.format('YYYY-MM') : ''
    },
    handleReset() {
      this.resetToDefaultMonth()
    },
    handleExportCalendar() {
      if (!this.displayRows.length) {
        this.$message.warning('暂无数据可导出')
        return
      }
      const dayLabels = this.displayDayHeaders.map(item => item.label)
      const aoa = []
      aoa.push([`打卡时间 统计日期：${this.dateStart} 至 ${this.dateEnd}`])
      aoa.push(['姓名', '类型', ...dayLabels, '人数合计', '金额合计'])

      this.displayRows.forEach(row => {
        aoa.push([
          row.name,
          '打卡',
          ...this.displayDayHeaders.map(item => this.formatAllPunches(row.days[item.day])),
          '',
          ''
        ])
        aoa.push([
          '',
          '金额',
          ...this.displayDayHeaders.map(item => this.formatAmount(row.days[item.day] && row.days[item.day].taxiAmount)),
          row.claimCount || row.eligibleCount || '',
          this.formatAmount(row.amount)
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

      const day15Index = this.displayDayHeaders.findIndex(item => Number(item.day) === 15)
      const approverColIndex = day15Index >= 0 ? 2 + day15Index : 16
      appendSignerRows(aoa, '', '', approverColIndex)
      exportAoaToCsv(aoa, `打车日历_${this.month}`)
      this.$message.success('导出成功')
    },
    handleExport() {
      if (!this.month) {
        this.$message.warning('请选择月份')
        return
      }
      this.exporting = true
      attendanceTaxiCalendarExport({ month: this.month })
        .then(res => {
          this.saveBlob(res, `打卡时间_${this.month}.xlsx`)
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
      attendanceTaxiCalendar({ month: this.month })
        .then(res => {
          const result = (res.data && res.data.result) || {}
          this.taxiAfterTime = result.taxiAfterTime || ''
          this.taxiOvernightEnd = result.taxiOvernightEnd || '05:00'
          this.dateStart = result.dateStart || ''
          this.dateEnd = result.dateEnd || ''
          this.days = result.days || []
          this.dayHeaders = result.dayHeaders || (this.days || []).map(d => ({ day: d, label: String(d), isWeekend: false }))
          this.rows = result.rows || []
          this.dayTotals = result.dayTotals || []
          this.total = result.total || { personCount: 0, amount: 0 }
        })
        .finally(() => {
          this.loading = false
        })
    },
    cellStatusClass(cell) {
      if (!cell) {
        return ''
      }
      // 蓝色：当日达标；红色：有打车费但未达标（次日不连带标色）
      if (cell.status === 'ok') {
        return 'status-ok'
      }
      if (cell.taxiAmount > 0 && cell.status === 'bad') {
        return 'status-bad'
      }
      return ''
    },
    // 金额行：仅字体色，无背景色块
    cellAmountClass(cell) {
      if (!cell || !(Number(cell.taxiAmount) > 0)) {
        return ''
      }
      if (cell.status === 'ok') {
        return 'amount-ok'
      }
      if (cell.status === 'bad') {
        return 'amount-bad'
      }
      return 'has-amount'
    },
    formatAmount(val) {
      const num = Number(val)
      if (!num) return ''
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

.threshold-tip {
  margin-left: 12px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 13px;
}

.calendar-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: #fff;
}

.sheet-box {
  border: 1px solid #e8e8e8;
  padding: 12px;
  min-width: min-content;
}

.sheet-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: rgba(0, 0, 0, 0.85);
}

.taxi-calendar {
  border-collapse: collapse;
  width: max-content;
  min-width: 100%;
  font-size: 12px;

  th,
  td {
    border: 1px solid #bfbfbf;
    padding: 4px 6px;
    text-align: center;
    vertical-align: middle;
    background: #fff;
  }

  thead th {
    background: #f0f0f0;
    font-weight: 600;
  }

  .col-name {
    min-width: 72px;
    white-space: nowrap;
  }

  .col-type {
    min-width: 48px;
    white-space: nowrap;
  }

  .col-day {
    min-width: 56px;
    max-width: 72px;
  }

  .col-sum {
    min-width: 72px;
    background: #fafafa;
    white-space: nowrap;
  }

  tbody tr:nth-child(4n + 3) td,
  tbody tr:nth-child(4n + 4) td {
    background: #fcfcfc;
  }

  .weekend {
    background: #fff7e6;
  }

  thead .weekend {
    background: #ffe7ba;
  }

  .status-ok,
  .status-ok.weekend {
    background: #bae7ff !important;
  }

  .status-bad,
  .status-bad.weekend {
    background: #ffccc7 !important;
  }

  .punch-last {
    cursor: default;
    white-space: nowrap;
  }

  .has-amount,
  .amount-ok,
  .amount-bad {
    font-weight: 600;
  }

  .amount-ok {
    color: #096dd9;
  }

  .amount-bad {
    color: #cf1322;
  }

  tfoot td {
    background: #f5f5f5;
    font-weight: 600;
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

  .threshold-tip {
    display: block;
    width: 100%;
    margin: 8px 0 0;
    line-height: 1.5;
  }

  .sheet-box {
    padding: 8px;
  }
}
</style>

<style lang="less">
.taxi-punch-tooltip {
  .ant-tooltip-inner {
    white-space: pre-line;
    text-align: left;
  }

  .punch-tip {
    white-space: pre-line;
    line-height: 1.5;
  }
}
</style>
