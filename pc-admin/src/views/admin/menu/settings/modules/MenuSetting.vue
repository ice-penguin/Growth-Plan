<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-row :gutter="48">
        <a-col :xxl="6" :xl="8" :sm="24">
          <a-input-search placeholder="请输入名称/路由/描述" v-model="queryParam.mix" @search="onSearch" />
        </a-col>
        <a-col class="table-operator" :xxl="6" :xl="8" :sm="24">
          <a-button type="primary" icon="plus" @click="handleOpen">新增</a-button>
        </a-col>
      </a-row>
    </div>

    <s-table
      ref="table"
      size="default"
      rowKey="_id"
      :columns="columns"
      :data="loadData"
      :scroll="tableScroll"
      showPagination="auto"
      :pagination="{ showSizeChanger: true, showQuickJumper: true }"
    >
      <span slot="action" slot-scope="text, record">
        <template>
          <a @click="handleEdit(record)">
            编辑
          </a>
          <a-divider type="vertical" />
          <a @click="handleClickRemove(record._id)">
            删除
          </a>
        </template>
      </span>
    </s-table>

    <a-drawer :title="drawerName" :width="drawerWidth" :visible="visible" :body-style="{ paddingBottom: '80px' }" @close="handleClickClose">
      <div class="table-page-search-wrapper table-page-search-wrapper2">
        <a-form-model :model="form" ref="form" layout="inline" :rules="rules">
          <a-row :gutter="48">
            <a-col :xl="24">
              <a-form-model-item label="菜单名称" prop="name">
                <a-input v-model="form.name"></a-input>
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-row :gutter="48">
            <a-col :xl="24">
              <a-form-model-item label="页面地址" prop="path">
                <a-input v-model="form.path"></a-input>
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-row :gutter="48">
            <a-col :xl="24">
              <a-form-model-item label="重定向地址" prop="redirect">
                <a-input v-model="form.redirect"></a-input>
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-row :gutter="48">
            <a-col :xl="24">
              <a-form-model-item label="图标" prop="icon">
                <menu-icon-select v-model="form.icon" />
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-row :gutter="48">
            <a-col :xl="24">
              <a-form-model-item label="导航显示" prop="isShow">
                <a-radio-group v-model="form.isShow" :default-value="true">
                  <a-radio :value="true">
                    显示
                  </a-radio>
                  <a-radio :value="false">
                    不显示
                  </a-radio>
                </a-radio-group>
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-row :gutter="48">
            <a-col :xl="24">
              <a-form-model-item label="是否隐藏下级" prop="isHideChildrenInMenu">
                <a-radio-group v-model="form.isHideChildrenInMenu" :default-value="true">
                  <a-radio :value="true">
                    隐藏
                  </a-radio>
                  <a-radio :value="false">
                    不隐藏
                  </a-radio>
                </a-radio-group>
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-row :gutter="48">
            <a-col :xl="24">
              <a-form-model-item label="描述" prop="description">
                <a-textarea placeholder="简单描述一下菜单" :auto-size="{ minRows: 3, maxRows: 5 }" v-model="form.description"></a-textarea>
              </a-form-model-item>
            </a-col>
          </a-row>
        </a-form-model>
      </div>

      <div class="drawer-btn">
        <a-button @click="handleClickClose">取消</a-button>
        <a-button type="primary" @click="handleAdd">确定</a-button>
      </div>
    </a-drawer>
  </a-card>
</template>

<script>
import { STable } from '@/components'
import { setTableData } from '@/utils/util'
import { mapGetters } from 'vuex'
import { authUpdate, authIndex, authDelete } from '@/api/request'
import MenuIconSelect from '@/components/MenuIconSelect'
import { deviceMixin } from '@/store/device-mixin'

const columns = [
  {
    title: '菜单名称',
    dataIndex: 'name'
  },
  {
    title: '菜单路由',
    dataIndex: 'path'
  },
  {
    title: '描述',
    dataIndex: 'description'
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  mixins: [deviceMixin],
  components: {
    STable,
    MenuIconSelect
  },
  data() {
    this.columns = columns
    return {
      drawerName: '',
      queryParam: {
        mix: '',
        type: 'nav'
      },
      loadData: parameter => {
        const requestParameters = Object.assign({}, parameter, this.queryParam)
        return authIndex(requestParameters).then(res => {
          const data = setTableData(parameter.pageNo, parameter.pageSize, res.data, 'result')
          return data
        })
      },
      tableSize: {
        y: 500
      },
      visible: false,
      form: {
        name: '',
        uuid: '',
        target: '_self',
        component: '',
        redirect: '',
        path: '',
        icon: '',
        description: '',
        isShow: true,
        isHideChildrenInMenu: false,
        type: 'nav',
        belong_auth: '',
        introduce: ''
      },
      auths: [],
      rules: {
        name: [{ required: true, message: '请输入菜单名称', trigger: 'change' }],
        uuid: [{ required: true, message: '请输入UUID', trigger: 'change' }]
      }
    }
  },
  created() {
    this.tableSize.y = this.fullHeight - 228
  },
  computed: {
    ...mapGetters(['fullHeight', 'btns']),
    tableScroll() {
      return this.buildTableScroll(this.tableSize.y)
    }
  },
  methods: {
    onSearch() {
      this.$refs.table.refresh(true)
    },
    handleOpen() {
      this.visible = true
      this.drawerName = '新增菜单'
      this.getAuth()
    },
    handleEdit(record) {
      this.drawerName = '编辑菜单'
      this.form = JSON.parse(JSON.stringify(record))
      this.visible = true
    },
    getAuth() {
      authIndex({
        isShowAll: false,
        pageNo: 1,
        pageSize: 999,
        name: '',
        type: 'nav'
      }).then(res => {
        this.auths = res.data.auths
      })
    },
    handleClickRemove(id) {
      authDelete({ _auth: id }).then(res => {
        this.$message.success('删除成功')
        this.$refs.table.refresh()
      })
    },
    handleClickClose() {
      this.visible = false
      this.form = {
        name: '',
        uuid: '',
        target: '_self',
        component: '',
        redirect: '',
        path: '',
        icon: '',
        description: '',
        isShow: true,
        isHideChildrenInMenu: false,
        type: 'nav',
        belong_auth: '',
        introduce: ''
      }
      this.auths = []
    },
    handleAdd() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const action = this.drawerName === '新增菜单' ? '新增' : '更新'
          const params = this.drawerName === '新增菜单' ? this.form : { ...this.form, _auth: this.form._id }
          
          authUpdate(params).then(res => {
            this.$message.success(`${action}成功`)
            this.handleClickClose()
            this.$refs.table.refresh()
          })
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .table-page-search-wrapper2 .ant-form-item-label {
  width: 110px !important;
  display: inline-block !important;
}
</style>
