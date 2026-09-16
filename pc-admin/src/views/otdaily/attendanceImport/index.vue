<template>
  <a-card :bordered="false">
    <page-header-wrapper :breadcrumb="false">
      <div class="table-operator">
        <a-upload
          :show-upload-list="false"
          :before-upload="beforeUpload"
          accept=".xlsx,.xls"
        >
          <a-button type="primary" icon="upload" :loading="uploading">导入打卡表</a-button>
        </a-upload>
        <span class="tip">按姓名匹配员工；不存在则自动创建（账号由 UserId 生成，密码 123456Aa）；同月重复导入会覆盖</span>
      </div>

      <s-table
        ref="table"
        rowKey="_id"
        :columns="columns"
        :data="loadData"
        :scroll="tableScroll"
        showPagination="auto"
      >
        <span slot="dateRange" slot-scope="text, record">
          {{ formatDate(record.dateStart) }} ~ {{ formatDate(record.dateEnd) }}
        </span>
        <span slot="createDate" slot-scope="text">
          {{ formatDateTime(text) }}
        </span>
      </s-table>
    </page-header-wrapper>
  </a-card>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import { STable } from '@/components'
import { attendanceImportExcel, attendanceImportIndex } from '@/api/request'
import listPageMixin from '@/mixins/listPageMixin'

const columns = [
  { title: '月份', dataIndex: 'month', width: 100 },
  { title: '统计区间', dataIndex: 'dateRange', scopedSlots: { customRender: 'dateRange' } },
  { title: '文件名', dataIndex: 'fileName', ellipsis: true },
  { title: '员工数', dataIndex: 'staffCount', width: 90 },
  { title: '打卡天数', dataIndex: 'dayCount', width: 100 },
  { title: '新建员工', dataIndex: 'createdStaffCount', width: 100 },
  { title: '导入时间', dataIndex: 'createDate', scopedSlots: { customRender: 'createDate' }, width: 170 }
]

export default {
  name: 'AttendanceImport',
  components: { STable },
  mixins: [listPageMixin],
  data() {
    return {
      columns,
      uploading: false,
      tableSize: { y: 500 },
      loadData: parameter => this._fetchTablePage(parameter, attendanceImportIndex)
    }
  },
  computed: {
    ...mapGetters(['fullHeight'])
  },
  created() {
    this.tableSize.y = this.fullHeight - 240
  },
  methods: {
    formatDate(val) {
      return val ? moment(val).format('YYYY-MM-DD') : '-'
    },
    formatDateTime(val) {
      return val ? moment(val).format('YYYY-MM-DD HH:mm') : '-'
    },
    beforeUpload(file) {
      const formData = new FormData()
      formData.append('file', file)
      this.uploading = true
      attendanceImportExcel(formData)
        .then(res => {
          const result = (res.data && res.data.result) || {}
          let msg = `导入成功：${result.month}，新建 ${result.createdStaffCount || 0} 人，匹配已有 ${result.matchedStaffCount || 0} 人，打卡 ${result.dayCount || 0} 条`
          if (result.skippedCount) {
            msg += `，跳过 ${result.skippedCount} 人`
          }
          this.$message.success(msg)
          if (result.skipMessages && result.skipMessages.length) {
            this.$warning({
              title: '部分人员已跳过',
              content: result.skipMessages.join('；')
            })
          }
          this.$refs.table.refresh(true)
        })
        .finally(() => {
          this.uploading = false
        })
      return false
    }
  }
}
</script>

<style scoped lang="less">
.tip {
  margin-left: 12px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 13px;
}

@media (max-width: 576px) {
  .tip {
    display: block;
    width: 100%;
    margin: 8px 0 0;
    line-height: 1.5;
  }
}
</style>
