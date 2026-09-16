<template>
  <a-card :bordered="false">
    <page-header-wrapper :breadcrumb="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="searchGutter">
            <a-col :xxl="6" :xl="8" :xs="24" :sm="24">
              <a-form-item label="搜索员工">
                <a-input v-model="queryParam.mix" placeholder="员工姓名/账号" />
              </a-form-item>
            </a-col>
            <a-col :xxl="6" :xl="8" :xs="24" :sm="24">
              <a-form-item label="员工角色">
                <a-select v-model="queryParam.role" placeholder="请选择" allow-clear>
                  <a-select-option :value="role.uuid" v-for="role in roles" :key="role._id">
                    {{ role.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col class="table-operator" :xxl="6" :xl="8" :xs="24" :sm="24">
              <a-button type="primary" @click="search">查询</a-button>
              <a-button @click="reset">重置</a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAdd">新建</a-button>
      </div>

      <s-table
        ref="table"
        rowKey="_id"
        :columns="columns"
        :data="loadData"
        :scroll="tableScroll"
        showPagination="auto"
      >
        <span slot="description" slot-scope="text">
          <ellipsis :length="20" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm @confirm="() => handleClickRemove(record._id)">
            <template slot="title">
              <div>删除后，此员工无法登录帐号</div>
            </template>
            <a>删除</a>
          </a-popconfirm>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定重置密码吗？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="handleClickUpdatePwd(record._id)"
          >
            <a>重置密码</a>
          </a-popconfirm>
        </span>
      </s-table>

      <a-drawer
        :title="drawerName"
        :width="drawerWidth"
        :visible="isVisible"
        :body-style="{ paddingBottom: '80px' }"
        @close="onClose"
      >
        <div class="table-page-search-wrapper">
          <a-form layout="inline" :form="form" class="table-page-search-wrapper2">
            <a-row :gutter="48">
              <a-col :xl="24">
                <a-form-item label="员工姓名">
                  <a-input
                    v-decorator="['name', { rules: [{ required: true, message: '请输入员工姓名' }] }]"
                    placeholder="请输入员工姓名"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="48">
              <a-col :xl="24">
                <a-form-item label="角色类型">
                  <a-checkbox-group
                    v-decorator="['hadRoles', { rules: [{ required: true, message: '请选择角色类型' }] }]"
                    :options="roleUpdates"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="48">
              <a-col :xl="24">
                <a-form-item label="登录账号">
                  <a-input
                    v-decorator="['account', { rules: [{ required: true, message: '请输入登录账号（手机号或邮箱）' }] }]"
                    placeholder="请输入登录账号（手机号或邮箱）"
                    autocomplete="off"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="48" v-if="!isEdit">
              <a-col :xl="24">
                <a-form-item label="登录密码">
                  <a-input
                    v-decorator="[
                      'password',
                      {
                        rules: [
                          { required: true, message: '请输入登录密码' },
                          { pattern: passwordPattern, message: '不少于8位，且包含数字、大小写字母' }
                        ]
                      }
                    ]"
                    placeholder="不少于8位，含数字、大小写字母"
                    autocomplete="off"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="48">
              <a-col :xl="24">
                <a-form-item label="手机号码">
                  <a-input
                    v-decorator="['tel', { rules: [{ required: true, message: '请输入11位手机号码', pattern: pattern.regTel }] }]"
                    placeholder="请输入手机号码"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>
        <div class="drawer-btn">
          <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
          <a-button type="primary" @click="handleClickSubmit">确定</a-button>
        </div>
      </a-drawer>
    </page-header-wrapper>
  </a-card>
</template>

<script>
import { STable, Ellipsis } from '@/components'
import { userIndex, userUpdate, userDelete, userResetPassword, roleIndex } from '@/api/request'
import { setTableData, deepCopy } from '@/utils/util'
import { mapGetters } from 'vuex'
import { regTel } from '@/utils/validate'
import pick from 'lodash.pick'
import { deviceMixin } from '@/store/device-mixin'

const columns = [
  {
    title: '姓名',
    dataIndex: 'name'
  },
  {
    title: '角色类型',
    dataIndex: 'roleName',
    scopedSlots: { customRender: 'description' }
  },
  {
    title: '账号',
    dataIndex: 'account'
  },
  {
    title: '手机号',
    dataIndex: 'tel'
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '200px',
    scopedSlots: { customRender: 'action' }
  }
]

const formFields = ['name', 'hadRoles', 'account', 'password', 'tel']

export default {
  name: 'StaffAccount',
  mixins: [deviceMixin],
  components: {
    STable,
    Ellipsis
  },
  data() {
    this.columns = columns
    return {
      isVisible: false,
      isEdit: false,
      editUserId: '',
      queryParam: {},
      loadData: parameter => {
        const requestParameters = Object.assign({}, parameter, this.queryParam)
        return userIndex(requestParameters).then(res => {
          return setTableData(parameter.pageNo, parameter.pageSize, res.data, 'result')
        })
      },
      roles: [],
      roleUpdates: [],
      tableSize: {
        y: 500
      },
      drawerName: '新建员工',
      form: this.$form.createForm(this),
      pattern: {
        regTel
      },
      passwordPattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
    }
  },
  created() {
    this.tableSize.y = this.fullHeight - 276
    this.getRoles()
  },
  computed: {
    ...mapGetters(['fullHeight']),
    tableScroll() {
      return this.buildTableScroll(this.tableSize.y, 800)
    }
  },
  methods: {
    search() {
      this.$refs.table.refresh(true)
    },
    reset() {
      this.queryParam = {}
      this.$refs.table.refresh(true)
    },
    getRoles() {
      roleIndex({ page: 1, itemsPerPage: 99 }).then(res => {
        const list = res.data.result || []
        this.roles = deepCopy(list)
        this.roleUpdates = list.map(r => ({
          value: r.uuid,
          label: r.name
        }))
        if (this.roles.length > 0) {
          this.roles.unshift({ uuid: '', name: '全部' })
        }
      })
    },
    handleAdd() {
      this.drawerName = '新建员工'
      this.isEdit = false
      this.editUserId = ''
      this.isVisible = true
      this.$nextTick(() => {
        formFields.forEach(v => this.form.getFieldDecorator(v))
        this.form.resetFields()
      })
    },
    handleEdit(record) {
      this.drawerName = '编辑员工'
      this.isEdit = true
      this.editUserId = record._id
      this.isVisible = true
      this.$nextTick(() => {
        formFields.forEach(v => this.form.getFieldDecorator(v))
        this.form.setFieldsValue(
          pick(
            {
              name: record.name,
              account: record.account,
              tel: record.tel,
              hadRoles: record.role ? record.role.split(',') : []
            },
            ['name', 'hadRoles', 'account', 'tel']
          )
        )
      })
    },
    handleClickRemove(id) {
      userDelete({ _user: id })
        .then(() => {
          this.$message.success('操作成功')
          this.$refs.table.refresh()
        })
        .catch(() => {})
    },
    handleClickSubmit(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (err) {
          return
        }
        const data = {
          name: values.name,
          account: values.account,
          tel: values.tel,
          role: (values.hadRoles || []).join(',')
        }
        if (this.isEdit) {
          data._user = this.editUserId
        } else {
          data.password = values.password
        }
        userUpdate(data).then(() => {
          this.$message.success('操作成功')
          this.isVisible = false
          this.form.resetFields()
          this.$refs.table.refresh(this.isEdit ? undefined : true)
        })
      })
    },
    handleClickUpdatePwd(id) {
      userResetPassword({ _user: id }).then(res => {
        this.$message.success(res.data.result)
      })
    },
    onClose() {
      this.isVisible = false
      this.form.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .table-page-search-wrapper2 .ant-form-item-label {
  width: 116px !important;
  display: inline-block !important;
}
</style>
