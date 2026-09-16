import moment from 'moment'

/**
 * 月份快捷选择：上上月(YYYY-MM) / 上月 / 本月
 * 默认选中上个月。页面需具备 monthValue、month，以及 loadData()
 */
export function getDefaultMonth() {
  return moment().subtract(1, 'months')
}

export const monthQuickSelectMixin = {
  computed: {
    monthQuickOptions() {
      const now = moment()
      return [
        {
          key: 'prev2',
          label: now.clone().subtract(2, 'months').format('YYYY-MM'),
          value: now.clone().subtract(2, 'months').format('YYYY-MM')
        },
        {
          key: 'prev1',
          label: '上月',
          value: now.clone().subtract(1, 'months').format('YYYY-MM')
        },
        {
          key: 'current',
          label: '本月',
          value: now.format('YYYY-MM')
        }
      ]
    }
  },
  methods: {
    selectQuickMonth(monthStr) {
      if (!monthStr) {
        return
      }
      this.monthValue = moment(monthStr, 'YYYY-MM')
      this.month = monthStr
      this.loadData()
    },
    resetToDefaultMonth() {
      const month = getDefaultMonth()
      this.monthValue = month
      this.month = month.format('YYYY-MM')
      this.loadData()
    }
  }
}
