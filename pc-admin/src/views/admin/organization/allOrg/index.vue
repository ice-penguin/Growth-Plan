<template>
  <a-card class="my-field" :bordered="false">
    <page-header-wrapper :breadcrumb="false"></page-header-wrapper>
    <a-button style="margin: 24px 0;" type="primary" icon="plus" @click="handOpenDrawer()">新建</a-button>
    <a-table
      ref="table"
      :scroll="tableScroll"
      :rowKey="(record, index) => index"
      :columns="columns"
      :data-source="orgArr"
      :pagination="false"
      :showHeader="orgArr.length > 0"
    >
      <span slot="action" slot-scope="text, record">
        <template>
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a @click="handleConfig(record)">配置</a>
            <a-popconfirm
              title="确定重置密码吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleResetPsd(record)"
            >
              <a>重置密码</a>
            </a-popconfirm>
            <a-popconfirm
              title="确定删除吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record)"
            >
              <a>删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </span>
    </a-table>
    <add-org :visibleObj="visibleObj" @ok="onRefresh"></add-org>
    <edit-org :visibleObj="visibleObj" :lineObj="lineObj" @ok="onRefresh"></edit-org>
    <org-config-drawer
      :visible="configVisible"
      :org-id="configOrgId"
      @close="configVisible = false"
      @ok="onRefresh"
    />
  </a-card>
</template>

<script>
import AddOrg from './modules/AddOrg'
import EditOrg from './modules/EditOrg'
import OrgConfigDrawer from './modules/OrgConfigDrawer'
import { userIndex, userDelete, userResetPassword } from '@/api/request'
import { mapGetters } from 'vuex'
import { deviceMixin } from '@/store/device-mixin'

const columns = [
  {
    title: '机构名称',
    dataIndex: 'name',
    width: 200
  },
  {
    title: '账号',
    dataIndex: 'account',
    width: 200
  },
  {
    title: '手机号',
    dataIndex: 'tel',
    width: 200
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
    width: 280,
    fixed: 'right',
    ellipsis: true
  }
]

export default {
  mixins: [deviceMixin],
  data() {
    return {
      columns,
      layoutHeight: '',
      orgArr: [],
      visibleObj: {
        isVisible: false,
        editOrgVisible: false
      },
      tableSize: {
        x: '100%'
      },
      lineObj: {},
      configVisible: false,
      configOrgId: ''
    }
  },
  components: { AddOrg, EditOrg, OrgConfigDrawer },
  created() {
    this.getOrgList()
    this.layoutHeight = this.fullHeight - 25 + 'px'
  },
  computed: {
    ...mapGetters(['fullHeight']),
    tableScroll() {
      return this.isMobile ? { x: 880 } : this.tableSize
    }
  },
  methods: {
    onRefresh() {
      this.getOrgList()
    },
    handleDelete(data) {
      userDelete({
        _user: data._id
      }).then(() => {
        this.$message.success('操作成功')
        this.getOrgList()
      })
    },
    handleResetPsd(data) {
      userResetPassword({
        _user: data._id
      }).then(res => {
        this.$message.success(res.data.result)
      })
    },
    getOrgList() {
      userIndex().then(res => {
        this.orgArr = res.data.result
      })
    },
    handOpenDrawer() {
      this.visibleObj.isVisible = true
    },
    handleEdit(record) {
      this.lineObj = Object.assign({}, record)
      this.visibleObj.editOrgVisible = true
    },
    handleConfig(record) {
      this.configOrgId = record._id
      this.configVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.my-field {
  height: 100%;
  /deep/ .ant-pro-page-header-wrap-children-content {
    margin: 0;
  }
}
</style>
