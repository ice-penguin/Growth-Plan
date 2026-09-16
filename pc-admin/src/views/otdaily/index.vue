<template>
  <a-card :bordered="false">
    <page-header-wrapper :breadcrumb="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="searchGutter">
            <a-col v-if="isOrg" :xxl="6" :xl="8" :xs="24" :sm="24">
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
            <a-col :xxl="8" :xl="10" :xs="24" :sm="24">
              <a-form-item label="日期">
                <a-range-picker v-model="dateRange" style="width: 100%" @change="onDateChange" />
              </a-form-item>
            </a-col>
            <a-col class="table-operator" :xxl="6" :xl="8" :xs="24" :sm="24">
              <a-button type="primary" @click="search">查询</a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="summary-bar">
        <span>待审餐费：{{ summary.pending.mealAmount | amountFilter }}</span>
        <span>待审打车：{{ summary.pending.taxiAmount | amountFilter }}</span>
        <span>待审合计：{{ summary.pending.totalAmount | amountFilter }}</span>
        <span class="total">已通过餐费：{{ summary.approved.mealAmount | amountFilter }}</span>
        <span class="total">已通过打车：{{ summary.approved.taxiAmount | amountFilter }}</span>
        <span class="total">已通过合计：{{ summary.approved.totalAmount | amountFilter }}</span>
      </div>

      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAdd">录入</a-button>
      </div>

      <s-table
        ref="table"
        rowKey="_id"
        :columns="columns"
        :data="loadData"
        :scroll="tableScroll"
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
          {{ attachmentCount(record) }}
        </span>
        <span slot="action" slot-scope="text, record">
          <a @click="handleView(record)">查看</a>
          <template v-if="canEdit(record)">
            <a-divider type="vertical" />
            <a @click="handleEdit(record)">编辑</a>
          </template>
          <template v-if="canDelete(record)">
            <a-divider type="vertical" />
            <a-popconfirm title="确定删除该记录吗？" @confirm="() => handleDelete(record._id)">
              <a>删除</a>
            </a-popconfirm>
          </template>
          <template v-if="isOrg && record.status === 'pending'">
            <a-divider type="vertical" />
            <a @click="handleReview(record, 'approve')">通过</a>
            <a-divider type="vertical" />
            <a @click="openReject(record)">驳回</a>
          </template>
          <template v-if="isOrg && record.status === 'approved'">
            <a-divider type="vertical" />
            <a-popconfirm title="退回后将离开正式表，确定退回待审？" @confirm="() => handleReview(record, 'revert')">
              <a>退回</a>
            </a-popconfirm>
          </template>
        </span>
      </s-table>

      <entry-form
        :visible="drawerVisible"
        :is-org="isOrg"
        :staff-list="staffList"
        :record="currentRecord"
        :readonly="formReadonly"
        @close="drawerVisible = false"
        @ok="onFormOk"
      />

      <a-modal
        title="驳回原因"
        :visible="rejectVisible"
        :confirm-loading="reviewing"
        @ok="confirmReject"
        @cancel="closeReject"
      >
        <a-textarea v-model="rejectReason" :rows="4" placeholder="请填写驳回原因" />
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
import { otdailyIndex, otdailyDelete, otdailyReview, userIndex } from '@/api/request'
import { setTableData } from '@/utils/util'
import listPageMixin from '@/mixins/listPageMixin'
import EntryForm from './modules/EntryForm'
import VoucherUpload from './modules/VoucherUpload'

function emptySummary() {
  return {
    mealAmount: 0,
    taxiAmount: 0,
    totalAmount: 0
  }
}

function getCurrentMonthRange() {
  const start = moment().startOf('month')
  const end = moment().endOf('month')
  return {
    dateRange: [start, end],
    dateStart: start.format('YYYY-MM-DD'),
    dateEnd: end.format('YYYY-MM-DD')
  }
}

export default {
  name: 'Otdaily',
  components: {
    STable,
    EntryForm,
    VoucherUpload
  },
  mixins: [listPageMixin],
  data() {
    const month = getCurrentMonthRange()
    return {
      defaultQueryParam: {
        _user: undefined,
        status: undefined,
        dateStart: month.dateStart,
        dateEnd: month.dateEnd
      },
      queryParam: {
        _user: undefined,
        status: undefined,
        dateStart: month.dateStart,
        dateEnd: month.dateEnd
      },
      dateRange: month.dateRange,
      staffList: [],
      drawerVisible: false,
      formReadonly: false,
      currentRecord: null,
      rejectVisible: false,
      rejectReason: '',
      rejectFiles: [],
      rejectRecord: null,
      reviewing: false,
      summary: {
        pending: emptySummary(),
        approved: emptySummary()
      },
      tableSize: {
        y: 500
      },
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
    ...mapGetters(['roles', 'fullHeight']),
    isOrg() {
      return this.roles.includes('organization')
    },
    columns() {
      const cols = []
      if (this.isOrg) {
        cols.push({
          title: '员工',
          dataIndex: 'userName'
        })
      }
      cols.push(
        {
          title: '日期',
          dataIndex: 'date',
          scopedSlots: { customRender: 'date' }
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '中午餐费',
          dataIndex: 'lunchAmount',
          scopedSlots: { customRender: 'amount' }
        },
        {
          title: '晚上餐费',
          dataIndex: 'dinnerAmount',
          scopedSlots: { customRender: 'amount' }
        },
        {
          title: '打车费',
          dataIndex: 'taxiAmount',
          scopedSlots: { customRender: 'amount' }
        },
        {
          title: '凭证',
          dataIndex: 'attachments',
          scopedSlots: { customRender: 'attachments' }
        },
        {
          title: '备注',
          dataIndex: 'remark',
          ellipsis: true
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: '240px',
          scopedSlots: { customRender: 'action' }
        }
      )
      return cols
    }
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
    this.tableSize.y = this.fullHeight - 360
    if (this.isOrg) {
      this.loadStaffList()
    }
  },
  methods: {
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
      const list = ((record && record.attachments) || []).filter(item => item.type !== 'reject')
      return list.length ? `${list.length}个` : '-'
    },
    canEdit(record) {
      if (!record) {
        return false
      }
      if (this.isOrg) {
        return record.status === 'pending' || record.status === 'rejected'
      }
      return record.status === 'rejected'
    },
    canDelete(record) {
      if (!record) {
        return false
      }
      if (this.isOrg) {
        return record.status !== 'approved'
      }
      return record.status === 'rejected'
    },
    loadStaffList() {
      userIndex({ page: 1, itemsPerPage: 999 }).then(res => {
        this.staffList = res.data.result || []
      })
    },
    onDateChange(dates) {
      if (dates && dates.length === 2) {
        this.queryParam.dateStart = dates[0].format('YYYY-MM-DD')
        this.queryParam.dateEnd = dates[1].format('YYYY-MM-DD')
      } else {
        this.queryParam.dateStart = undefined
        this.queryParam.dateEnd = undefined
      }
    },
    handleReset() {
      const month = getCurrentMonthRange()
      this.dateRange = month.dateRange
      this.reset({
        dateStart: month.dateStart,
        dateEnd: month.dateEnd
      })
    },
    handleAdd() {
      this.currentRecord = null
      this.formReadonly = false
      this.drawerVisible = true
    },
    handleView(record) {
      this.currentRecord = { ...record }
      this.formReadonly = true
      this.drawerVisible = true
    },
    handleEdit(record) {
      this.currentRecord = { ...record }
      this.formReadonly = false
      this.drawerVisible = true
    },
    handleDelete(id) {
      otdailyDelete({ _otdaily: id }).then(() => {
        this.$message.success('删除成功')
        this.$refs.table.refresh()
      })
    },
    handleReview(record, action) {
      this.reviewing = true
      otdailyReview({
        action,
        _otdailys: [record._id]
      })
        .then(() => {
          this.$message.success('操作成功')
          this.$refs.table.refresh()
        })
        .finally(() => {
          this.reviewing = false
        })
    },
    openReject(record) {
      this.rejectRecord = record
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
      this.reviewing = true
      otdailyReview({
        action: 'reject',
        _otdailys: [this.rejectRecord._id],
        rejectReason: this.rejectReason.trim(),
        rejectAttachments: this.rejectFiles || []
      })
        .then(() => {
          this.$message.success('已驳回')
          this.closeReject()
          this.$refs.table.refresh()
        })
        .finally(() => {
          this.reviewing = false
        })
    },
    onFormOk() {
      this.$refs.table.refresh(true)
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

.reject-upload {
  margin-top: 12px;
}

.reject-upload-label {
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.65);
}
</style>
