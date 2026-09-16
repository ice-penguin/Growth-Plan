import { setTableData } from '@/utils/util'
import { deviceMixin } from '@/store/device-mixin'

export const DEFAULT_PAGE_QUERY = {
  page: 1,
  itemsPerPage: 10
}

/**
 * 列表页通用 mixin
 *
 * data() 示例：
 *   defaultQueryParam: { page: 1, itemsPerPage: 10, mix: '' },
 *   queryParam: { page: 1, itemsPerPage: 10, mix: '' },
 *   loadData: parameter => this._fetchTablePage(parameter, memberIndex)
 */
export default {
  mixins: [deviceMixin],
  computed: {
    /** 依赖 data.tableSize.y；手机自动补 scroll.x */
    tableScroll() {
      const y = this.tableSize && this.tableSize.y
      return this.buildTableScroll(y)
    }
  },
  methods: {
    search() {
      this.$refs.table.refresh(true)
    },

    /** 项目内历史拼写 resert，reset 为别名 */
    resert(overrides = {}) {
      const base = this.defaultQueryParam || DEFAULT_PAGE_QUERY
      this.queryParam = { ...base, ...overrides }
      if (this.$refs.table) {
        this.$refs.table.refresh(true)
      }
    },

    reset(overrides = {}) {
      this.resert(overrides)
    },

    /**
     * @param {Function} parameter STable 分页参数
     * @param {Function} apiFn createPostRequest 返回的接口函数
     * @param {object} [options]
     * @param {string} [options.resultKey='result']
     * @param {Function} [options.beforeRequest] 请求前修改 requestParameters
     * @param {boolean} [options.resetOnError=true]
     * @param {string[]} [options.exportFlags=['isExport']] 触发导出的 data 字段名
     * @param {object} [options.exportParams] 导出时附加参数，如 { excel: 'excel' }
     */
    _fetchTablePage(parameter, apiFn, options = {}) {
      const {
        resultKey = 'result',
        beforeRequest,
        resetOnError = true,
        exportFlags = ['isExport'],
        exportParams = { excel: 'excel' }
      } = options

      const requestParameters = Object.assign({}, parameter, this.queryParam)
      if (beforeRequest) {
        beforeRequest.call(this, requestParameters, parameter)
      }

      const isExporting = exportFlags.some(flag => this[flag])
      if (isExporting) {
        Object.assign(requestParameters, exportParams)
      }

      return apiFn(requestParameters)
        .then(res => {
          if (isExporting) {
            if (options.onExportSuccess) {
              options.onExportSuccess.call(this, res)
              exportFlags.forEach(flag => {
                this[flag] = false
              })
              return
            }
            this.$message.success('导出成功，请在任务页下载')
            this.$router.push('/setting/downloadTask')
            exportFlags.forEach(flag => {
              this[flag] = false
            })
            return
          }

          const page = requestParameters.page || parameter.pageNo || 1
          const pageSize = requestParameters.itemsPerPage || parameter.pageSize || 10
          return setTableData(page, pageSize, res.data, resultKey)
        })
        .catch(() => {
          if (resetOnError) {
            this.resert()
          }
        })
    }
  }
}
