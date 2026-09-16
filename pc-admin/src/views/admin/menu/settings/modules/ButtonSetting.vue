<!--
 * @Author: yzy
 * @LastEditors: yaozy 947409601@qq.com
 * I love coding too
-->
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
              <a-form-model-item label="按钮名称" prop="name">
                <a-input v-model.trim="form.name"></a-input>
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-row :gutter="48">
            <a-col :xl="24">
              <a-form-model-item label="path" prop="path">
                <a-input v-model.trim="form.path" :disabled="drawerName === '编辑按钮'"></a-input>
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-row :gutter="48">
            <a-col :xl="24">
              <a-form-model-item label="锁定选中" prop="isLock">
                <a-radio-group v-model="form.isLock" :default-value="true">
                  <a-radio :value="true">
                    锁定
                  </a-radio>
                  <a-radio :value="false">
                    不锁定
                  </a-radio>
                </a-radio-group>
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-row :gutter="48">
            <a-col :xl="24">
              <a-form-model-item label="描述" prop="description">
                <a-textarea placeholder="简单描述一下按钮" :auto-size="{ minRows: 3, maxRows: 5 }" v-model="form.description"></a-textarea>
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
import { STable, Ellipsis } from '@/components'
import { setTableData } from '@/utils/util'
import { mapGetters } from 'vuex'
import { authUpdate, authIndex, authDelete } from '@/api/request'
import { deviceMixin } from '@/store/device-mixin'

const columns = [
  {
    title: '按钮名称',
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
    Ellipsis
  },
  data() {
    this.columns = columns
    return {
      drawerName: '',
      // 查询参数
      queryParam: {
        mix: '',
        type: 'btn'
      },
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        let requestParameters = {}
        requestParameters = Object.assign({}, parameter, this.queryParam)
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
        target: '',
        component: '',
        redirect: '',
        path: '',
        icon_name: '',
        description: '',
        isShow: true,
        type: 'btn',
        belong_auth: '',
        isLock: false
      },
      auths: [],
      rules: {
        name: [{ required: true, message: '请输入按钮名称', trigger: 'change' }],
        path: [{ required: true, message: '请输入path', trigger: 'change' }]
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
    // 下拉搜索
    filterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
    },
    onSearch() {
      this.$refs.table.refresh(true)
    },
    handleOpen() {
      this.visible = true
      this.drawerName = '新增按钮'
      this.getAuth()
    },
    handleEdit(record) {
      this.drawerName = '编辑按钮'
      this.getAuth()
      this.form = JSON.parse(JSON.stringify(record))
      this.visible = true
    },
    getAuth() {
      authIndex({
        isShowAll: false,
        pageNo: 1,
        pageSize: 999,
        name: '',
        type: 'page'
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
        target: '',
        component: '',
        redirect: '',
        path: '',
        icon_name: '',
        description: '',
        isShow: true,
        type: 'btn',
        belong_auth: '',
        isLock: false
      }
      this.auths = []
    },
    handleAdd() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.drawerName === '新增按钮') {
            authUpdate(this.form).then(res => {
              this.$message.success('操作成功')
              this.handleClickClose()
              this.$refs.table.refresh()
            })
          } else {
            this.form._auth = this.form._id
            authUpdate(this.form).then(res => {
              this.$message.success('操作成功')
              this.handleClickClose()
              this.$refs.table.refresh()
            })
          }
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
/deep/ .table-page-search-wrapper2 .ant-form-item-label {
  width: 94px !important;
  display: inline-block !important;
}
</style>
