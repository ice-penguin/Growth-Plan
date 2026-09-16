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
            <a-col :xxl="6" :xl="8" :xs="24" :sm="24">
              <a-form-item label="员工">
                <a-select
                  v-model="queryParam._user"
                  allow-clear
                  show-search
                  option-filter-prop="children"
                  placeholder="全部员工"
                >
                  <a-select-option v-for="item in staffList" :key="item._id" :value="item._id">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xxl="6" :xl="8" :xs="24" :sm="24">
              <a-form-item label="状态">
                <a-select v-model="queryParam.status" allow-clear placeholder="全部状态">
                  <a-select-option value="pending">待审核</a-select-option>
                  <a-select-option value="approved">已通过</a-select-option>
                  <a-select-option value="rejected">已驳回</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col class="table-operator" :xxl="6" :xl="8" :xs="24" :sm="24">
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
              <a-button type="primary" @click="search">查询</a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="summary-bar">
        <span>待审合计：{{ summary.pending.totalAmount | amountFilter }}</span>
        <span class="total">已通过合计：{{ summary.approved.totalAmount | amountFilter }}</span>
      </div>

      <div class="table-operator">
        <a-dropdown>
          <a-menu slot="overlay" @click="onDownloadMenu">
            <a-menu-item key="pending">按月下载待审核</a-menu-item>
            <a-menu-item key="pendingAndApproved">按月下载待审核+已通过</a-menu-item>
            <a-menu-item key="selected" :disabled="!selectedRowKeys.length">下载勾选记录</a-menu-item>
          </a-menu>
          <a-button type="primary" icon="download" :loading="downloading">
            按月下载 <a-icon type="down" />
          </a-button>
        </a-dropdown>
        <a-tooltip title="上传核对结果 xlsx，按「全部条目」的系统id、结论、原因处理待审；待确认按不通过驳回">
          <a-upload
            :show-upload-list="false"
            :before-upload="beforeReviewImport"
            accept=".xlsx,.xls"
          >
            <a-button icon="upload" :loading="importing">回传核对结果</a-button>
          </a-upload>
        </a-tooltip>
        <a-button :disabled="!selectedRowKeys.length" :loading="reviewing" @click="batchReview('approve')">
          勾选通过
        </a-button>
        <a-button :disabled="!selectedRowKeys.length" :loading="reviewing" @click="openReject('selected')">
          勾选驳回
        </a-button>
        <a-button :disabled="!queryParam._user" :loading="reviewing" @click="batchByUser('approve')">
          按人通过
        </a-button>
        <a-button :disabled="!queryParam._user" :loading="reviewing" @click="openReject('user')">
          按人驳回
        </a-button>
        <a-popconfirm :title="'确定通过 ' + month + ' 全部待审记录？'" @confirm="batchByMonth('approve')">
          <a-button :loading="reviewing">按月通过</a-button>
        </a-popconfirm>
        <a-button :loading="reviewing" @click="openReject('month')">按月驳回</a-button>
      </div>

      <s-table
        ref="table"
        rowKey="_id"
        :columns="columns"
        :data="loadData"
        :scroll="tableScroll"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        showPagination="auto"
      >
        <span slot="date" slot-scope="text">
          {{ text | dateFilter }}
        </span>
        <span slot="amount" slot-scope="text">
          {{ text | amountFilter }}
        </span>
        <span slot="status" slot-scope="text">
          <a-tag :color="statusColor(text)">{{ statusText(text) }}</a-tag>
        </span>
        <span slot="attachments" slot-scope="text, record">
          <a v-if="attachmentCount(record)" @click="handleView(record)">{{ attachmentCount(record) }}个</a>
          <span v-else>-</span>
        </span>
        <span slot="action" slot-scope="text, record">
          <a @click="handleView(record)">查看</a>
          <template v-if="record.status === 'pending'">
            <a-divider type="vertical" />
            <a @click="singleReview(record, 'approve')">通过</a>
            <a-divider type="vertical" />
            <a @click="openReject('single', record)">驳回</a>
          </template>
          <template v-if="record.status === 'approved'">
            <a-divider type="vertical" />
            <a-popconfirm title="退回后将离开正式表，确定退回待审？" @confirm="() => singleReview(record, 'revert')">
              <a>退回</a>
            </a-popconfirm>
          </template>
        </span>
      </s-table>

      <entry-form
        :visible="drawerVisible"
        :is-org="true"
        :staff-list="staffList"
        :record="currentRecord"
        :readonly="true"
        @close="drawerVisible = false"
      />

      <a-modal
        title="驳回原因"
        :visible="rejectVisible"
        :confirm-loading="reviewing"
        @ok="confirmReject"
        @cancel="closeReject"
      >
        <a-textarea v-model="rejectReason" :rows="4" placeholder="请填写驳回原因，将应用到本次驳回的全部记录" />
        <div class="reject-upload">
          <div class="reject-upload-label">附图（选填，最多3张）</div>
          <voucher-upload v-model="rejectFiles" file-type="reject" :image-only="true" :max-count="3" />
        </div>
      </a-modal>
    </page-header-wrapper>
  </a-card>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import { STable } from '@/components'
import { otdailyIndex, otdailyReview, otdailyDownload, otdailyReviewImport, userIndex } from '@/api/request'
import { setTableData } from '@/utils/util'
import listPageMixin from '@/mixins/listPageMixin'
import { monthQuickSelectMixin, getDefaultMonth } from '@/mixins/monthQuickSelectMixin'
import EntryForm from '../modules/EntryForm'
import VoucherUpload from '../modules/VoucherUpload'

function emptySummary() {
  return {
    mealAmount: 0,
    taxiAmount: 0,
    totalAmount: 0
  }
}

export default {
  name: 'OtdailyReview',
  components: {
    STable,
    EntryForm,
    VoucherUpload
  },
  mixins: [listPageMixin, monthQuickSelectMixin],
  data() {
    const month = getDefaultMonth()
    const monthStr = month.format('YYYY-MM')
    return {
      monthValue: month,
      month: monthStr,
      defaultQueryParam: {
        _user: undefined,
        status: 'pending',
        dateStart: month.clone().startOf('month').format('YYYY-MM-DD'),
        dateEnd: month.clone().endOf('month').format('YYYY-MM-DD')
      },
      queryParam: {
        _user: undefined,
        status: 'pending',
        dateStart: month.clone().startOf('month').format('YYYY-MM-DD'),
        dateEnd: month.clone().endOf('month').format('YYYY-MM-DD')
      },
      staffList: [],
      selectedRowKeys: [],
      selectedRows: [],
      drawerVisible: false,
      currentRecord: null,
      rejectVisible: false,
      rejectReason: '',
      rejectFiles: [],
      rejectMode: 'selected',
      rejectRecord: null,
      reviewing: false,
      downloading: false,
      importing: false,
      summary: {
        pending: emptySummary(),
        approved: emptySummary()
      },
      tableSize: { y: 500 },
      columns: [
        { title: '员工', dataIndex: 'userName' },
        { title: '日期', dataIndex: 'date', scopedSlots: { customRender: 'date' } },
        { title: '状态', dataIndex: 'status', scopedSlots: { customRender: 'status' } },
        { title: '中午餐费', dataIndex: 'lunchAmount', scopedSlots: { customRender: 'amount' } },
        { title: '晚上餐费', dataIndex: 'dinnerAmount', scopedSlots: { customRender: 'amount' } },
        { title: '打车费', dataIndex: 'taxiAmount', scopedSlots: { customRender: 'amount' } },
        { title: '凭证', dataIndex: 'attachments', scopedSlots: { customRender: 'attachments' } },
        { title: '备注', dataIndex: 'remark', ellipsis: true },
        { title: '操作', dataIndex: 'action', width: '180px', scopedSlots: { customRender: 'action' } }
      ],
      loadData: parameter => {
        const requestParameters = Object.assign({}, parameter, this.queryParam)
        return otdailyIndex(requestParameters)
          .then(res => {
            const data = res.data || {}
            this.summary = {
              pending: (data.summary && data.summary.pending) || emptySummary(),
              approved: (data.summary && data.summary.approved) || emptySummary()
            }
            const page = requestParameters.page || parameter.pageNo || 1
            const pageSize = requestParameters.itemsPerPage || parameter.pageSize || 10
            return setTableData(page, pageSize, data, 'result')
          })
          .catch(() => {
            this.summary = {
              pending: emptySummary(),
              approved: emptySummary()
            }
            this.resert()
          })
      }
    }
  },
  computed: {
    ...mapGetters(['fullHeight'])
  },
  filters: {
    dateFilter(val) {
      return val ? moment(val).format('YYYY-MM-DD') : '-'
    },
    amountFilter(val) {
      const num = Number(val)
      if (isNaN(num)) {
        return '0.00'
      }
      return num.toFixed(2)
    }
  },
  created() {
    this.tableSize.y = this.fullHeight - 380
    this.loadStaffList()
  },
  methods: {
    loadStaffList() {
      userIndex({ page: 1, itemsPerPage: 999 }).then(res => {
        this.staffList = res.data.result || []
      })
    },
    applyMonth(monthStr) {
      const value = moment(monthStr, 'YYYY-MM')
      this.monthValue = value
      this.month = monthStr
      this.queryParam.dateStart = value.clone().startOf('month').format('YYYY-MM-DD')
      this.queryParam.dateEnd = value.clone().endOf('month').format('YYYY-MM-DD')
    },
    onMonthChange(val) {
      if (!val) {
        return
      }
      this.applyMonth(val.format('YYYY-MM'))
    },
    selectQuickMonth(monthStr) {
      this.applyMonth(monthStr)
      this.search()
    },
    handleReset() {
      const month = getDefaultMonth()
      this.applyMonth(month.format('YYYY-MM'))
      this.reset({
        status: 'pending',
        dateStart: this.queryParam.dateStart,
        dateEnd: this.queryParam.dateEnd
      })
    },
    onSelectChange(keys, rows) {
      this.selectedRowKeys = keys
      this.selectedRows = rows
    },
    statusText(status) {
      if (status === 'approved') {
        return '已通过'
      }
      if (status === 'rejected') {
        return '已驳回'
      }
      return '待审核'
    },
    statusColor(status) {
      if (status === 'approved') {
        return 'green'
      }
      if (status === 'rejected') {
        return 'red'
      }
      return 'orange'
    },
    attachmentCount(record) {
      return ((record && record.attachments) || []).filter(item => item.type !== 'reject').length
    },
    handleView(record) {
      this.currentRecord = { ...record }
      this.drawerVisible = true
    },
    singleReview(record, action) {
      this.submitReview({ action, _otdailys: [record._id] })
    },
    batchReview(action) {
      if (!this.selectedRowKeys.length) {
        this.$message.warning('请先勾选记录')
        return
      }
      this.submitReview({ action, _otdailys: this.selectedRowKeys })
    },
    batchByUser(action) {
      if (!this.queryParam._user) {
        this.$message.warning('请先筛选员工')
        return
      }
      this.submitReview({
        action,
        month: this.month,
        _user: this.queryParam._user
      })
    },
    batchByMonth(action) {
      this.submitReview({
        action,
        month: this.month
      })
    },
    openReject(mode, record) {
      if (mode === 'selected' && !this.selectedRowKeys.length) {
        this.$message.warning('请先勾选记录')
        return
      }
      if (mode === 'user' && !this.queryParam._user) {
        this.$message.warning('请先筛选员工')
        return
      }
      this.rejectMode = mode
      this.rejectRecord = record || null
      this.rejectReason = ''
      this.rejectFiles = []
      this.rejectVisible = true
    },
    closeReject() {
      this.rejectVisible = false
      this.rejectFiles = []
    },
    confirmReject() {
      if (!this.rejectReason || !this.rejectReason.trim()) {
        this.$message.warning('请填写驳回原因')
        return
      }
      const payload = {
        action: 'reject',
        rejectReason: this.rejectReason.trim(),
        rejectAttachments: this.rejectFiles || []
      }
      if (this.rejectMode === 'single' && this.rejectRecord) {
        payload._otdailys = [this.rejectRecord._id]
      } else if (this.rejectMode === 'selected') {
        payload._otdailys = this.selectedRowKeys
      } else if (this.rejectMode === 'user') {
        payload.month = this.month
        payload._user = this.queryParam._user
      } else {
        payload.month = this.month
      }
      this.submitReview(payload, () => {
        this.closeReject()
      })
    },
    submitReview(payload, onOk) {
      this.reviewing = true
      otdailyReview(payload)
        .then(res => {
          const count = (res.data && res.data.result && res.data.result.count) || 0
          this.$message.success(`已处理 ${count} 条`)
          this.selectedRowKeys = []
          this.selectedRows = []
          this.$refs.table.refresh()
          if (onOk) {
            onOk()
          }
        })
        .finally(() => {
          this.reviewing = false
        })
    },
    beforeReviewImport(file) {
      this.$confirm({
        title: '回传核对结果',
        content: '将读取「全部条目」的系统id、结论、原因处理待审记录：通过则通过；不通过或待确认则整天驳回并写入原因；无系统id、非待审会跳过。确定继续？',
        onOk: () => this.submitReviewImport(file)
      })
      return false
    },
    submitReviewImport(file) {
      const formData = new FormData()
      formData.append('file', file)
      this.importing = true
      return otdailyReviewImport(formData)
        .then(res => {
          const result = (res.data && res.data.result) || {}
          let msg = `已回传：通过 ${result.approvedCount || 0} 条，驳回 ${result.rejectedCount || 0} 条`
          if (result.skippedCount) {
            msg += `，跳过 ${result.skippedCount} 条`
          }
          if (result.missingIdRowCount) {
            msg += `，${result.missingIdRowCount} 行无系统id`
          }
          this.$message.success(msg)
          if (result.skipMessages && result.skipMessages.length) {
            this.$warning({
              title: '部分记录已跳过',
              content: result.skipMessages.join('；')
            })
          }
          this.selectedRowKeys = []
          this.selectedRows = []
          this.$refs.table.refresh()
        })
        .finally(() => {
          this.importing = false
        })
    },
    onDownloadMenu({ key }) {
      if (!this.month) {
        this.$message.warning('请选择月份')
        return
      }
      const params = { month: this.month }
      if (key === 'pendingAndApproved') {
        params.scope = 'pendingAndApproved'
      } else if (key === 'selected') {
        if (!this.selectedRowKeys.length) {
          this.$message.warning('请先勾选记录')
          return
        }
        params.scope = 'pendingAndApproved'
        params._otdailys = this.selectedRowKeys
      } else {
        params.scope = 'pending'
      }
      if (this.queryParam._user && key !== 'selected') {
        params._user = this.queryParam._user
      }
      this.downloading = true
      otdailyDownload(params)
        .then(res => {
          const [year, monthNum] = (this.month || '').split('-')
          const fallback = `加班报销${year}年${Number(monthNum)}月汇总包.zip`
          this.saveBlob(res, fallback)
        })
        .finally(() => {
          this.downloading = false
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

.month-quick {
  margin-right: 8px;
}

.table-operator /deep/ .ant-upload {
  margin-right: 8px;
}

.reject-upload {
  margin-top: 12px;
}

.reject-upload-label {
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.65);
}
</style>
