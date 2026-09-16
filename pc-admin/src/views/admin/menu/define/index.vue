<template>
  <a-card :bordered="false">
    <!-- 新增tab切换栏 -->
    <a-tabs v-model="activeTab" @change="handleTabChange">
      <a-tab-pane key="org" tab="机构菜单"></a-tab-pane>
      <a-tab-pane key="admin" tab="超级管理员菜单"></a-tab-pane>
    </a-tabs>

    <div class="table-operator">
      <a-button type="primary" @click="handleSave">保存</a-button>
    </div>
    <!-- table区域-begin -->
    <div>
      <a-table
        :columns="columns"
        size="default"
        :pagination="false"
        rowKey="_id"
        :dataSource="dataSource"
        :loading="loading"
        :scroll="tableScroll"
        childrenColumnName="navArr"
        expandRowByClick
      >
        <span slot="action" slot-scope="text, record">
          <a @click.stop="handleToTop(record)">一键置顶</a>
          <a-divider type="vertical" />
          <a @click.stop="handleAddSame(record)" v-if="record.type !== 'btn'">增加同级</a>
          <a-divider type="vertical" v-if="record.type !== 'btn'" />
          <a @click.stop="handleAddNext(record)" v-if="record.type !== 'btn'">增加下级</a>
          <a-divider type="vertical" v-if="record.type !== 'btn'" />
          <a @click.stop="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="删除后子菜单也同步删除，你还要继续吗？"
            ok-text="确认"
            cancel-text="取消"
            @confirm.stop="handleDelete(record)"
          >
            <a>删除</a>
          </a-popconfirm>
        </span>
      </a-table>
    </div>
    <a-drawer :title="drawerName" :width="drawerWidth" :visible="visible" :body-style="{ paddingBottom: '80px' }" @close="handleClickClose">
      <div class="table-page-search-wrapper table-page-search-wrapper2">
        <a-form-model :model="form" ref="form" layout="inline" :rules="rules">
          <a-row :gutter="48">
            <a-col :xl="24">
              <a-form-model-item label="类型">
                <a-radio-group v-model="form.type" @change="getAuths">
                  <a-radio value="nav">
                    菜单
                  </a-radio>
                  <a-radio value="page">
                    页面
                  </a-radio>
                  <a-radio value="btn">
                    按钮
                  </a-radio>
                </a-radio-group>
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-row :gutter="48">
            <a-col :xl="24">
              <a-form-model-item label="选择" prop="_auth">
                <a-select
                  v-model="form._auth"
                  @change="getName()"
                  style="width:100%"
                  showSearch
                  :allowClear="true"
                  option-filter-prop="children"
                  :filter-option="filterOption"
                >
                  <a-select-option v-for="(item, index) in auths" :key="index" :value="item._id">
                    {{ item.name + (item.description ? '(' + item.description + ')' : '') }}
                  </a-select-option>
                </a-select>
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
import { navGetDefault, navUpdateDefault, authIndex } from '@/api/request'

import { Ellipsis } from '@/components'
import { deviceMixin } from '@/store/device-mixin'

const columns = [
  {
    title: '菜单名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    customRender: (text, record) => {
      return text === 'nav' ? '菜单' : text === 'page' ? '页面' : '按钮'
    }
  },
  {
    title: '等级',
    dataIndex: 'level',
    key: 'level'
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
    align: 'center',
    fixed: 'right'
  }
]

export default {
  name: 'PermissionList',
  mixins: [deviceMixin],
  components: {
    Ellipsis
  },
  data() {
    return {
      activeTab: 'org', // 默认显示机构菜单
      // 表头
      columns: columns,
      loading: false,
      dataSource: [],
      drawerName: '',
      visible: false,
      form: {
        type: 'nav',
        _auth: '',
        name: '',
        index: '',
        isSelect: true,
        _id: Math.random(),
        navArr: []
      },
      auths: [],
      rules: {
        _auth: [{ required: true, message: '请选择', trigger: 'change' }]
      },
      path: '',
      postion: [], // 改元素在整体中的位置
      myPosition: 0 // 改操作元素的index
    }
  },
  mounted() {
    this.loadData()
  },
  computed: {
    tableScroll() {
      return this.buildTableScroll(undefined, 900)
    }
  },
  methods: {
    // tab切换事件
    handleTabChange(activeKey) {
      this.activeTab = activeKey
      this.loadData()
    },
    // 获取当前菜单类型
    getCurrentNavType() {
      return this.activeTab === 'admin' ? 'adminDefault' : 'default'
    },
    handleToTop(record) {
      this.myPosition = record.index
      this.findIndex(this.dataSource, this.myPosition)
      // eslint-disable-next-line
      eval(`this.dataSource` + this.getSame(this.postion)).unshift(eval(`this.dataSource` + this.getSame(this.postion)).splice(this.postion[this.postion.length - 1], 1)[0])
    },
    // 下拉搜索
    filterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
    },
    // 获取数据
    loadData() {
      this.dataSource = []
      navGetDefault({ type: this.getCurrentNavType() }).then(res => {
        this.dataSource = res.data.navArr
        this.addIsSelect(this.dataSource)
      })
    },
    // 关闭弹窗
    handleClickClose() {
      this.visible = false
      this.form = {
        type: 'nav',
        _auth: '',
        name: '',
        index: '',
        isSelect: true,
        _id: Math.random(),
        navArr: []
      }
    },
    // 获取nav list
    getNav(type) {
      const data = {
        isShowAll: false,
        itemsPerPage: 999,
        page: 1,
        type: type,
        uuid: ''
      }
      if (type === 'btn') {
        data.uuid = this.path
      } else {
        data.uuid = ''
      }
      authIndex(data).then(res => {
        this.auths = res.data.result
      })
    },
    // 增加同级
    handleAddSame(record) {
      this.visible = true
      this.drawerName = '增加同级'
      this.getNav('nav')
      this.myPosition = record.index
      this.findIndex(this.dataSource, this.myPosition)
    },
    // 增加下级
    handleAddNext(record) {
      this.visible = true
      this.drawerName = '增加下级'
      this.getNav('nav')
      this.path = record.path
      this.myPosition = record.index
      this.findIndex(this.dataSource, this.myPosition)
    },
    // 编辑
    handleEdit(record) {
      const data = JSON.parse(JSON.stringify(record))
      this.visible = true
      this.drawerName = '编辑'
      this.myPosition = record.index
      this.findIndex(this.dataSource, this.myPosition)
      this.form = {
        type: data.type,
        _auth: data._auth,
        name: data.name,
        index: data.index,
        isSelect: true,
        _id: Math.random(),
        navArr: []
      }
      this.getNav(this.form.type)
    },
    // 删除
    handleDelete(record) {
      this.myPosition = record.index
      this.findIndex(this.dataSource, this.myPosition)
      // eslint-disable-next-line
      eval(`this.dataSource` + this.getSame(this.postion)).splice(this.postion[this.postion.length - 1], 1)[0]
    },
    // 获取list
    getAuths() {
      this.form._auth = ''
      this.getNav(this.form.type)
    },
    //
    handleAdd() {
      if (this.form._auth !== '') {
        if (this.drawerName === '增加同级') {
          // index用于定位
          this.form.index = Math.random()
          // eslint-disable-next-line
          eval('this.dataSource' + this.getSame(this.postion)).splice(this.postion[this.postion.length - 1] + 1, 0, this.form)
        } else if (this.drawerName === '增加下级') {
          // index用于定位
          this.form.index = Math.random()
          // eslint-disable-next-line
          eval('this.dataSource' + this.getNext(this.postion)).push(this.form)
        } else {
          // eslint-disable-next-line
          eval('this.dataSource' + this.getSame(this.postion)).splice(this.postion[this.postion.length - 1], 1, this.form)
        }

        this.handleClickClose()
      } else {
        this.$message.warning('请选择')
      }
    },
    // 获取下一层
    getNext(arr) {
      let str = ''
      arr.forEach(x => {
        str += '[' + x + ']' + '.navArr'
      })
      return str
    },
    // 获取同层
    getSame(arr) {
      let str = ''
      arr.forEach((x, index) => {
        if (index < arr.length - 1) {
          str += '[' + x + ']' + '.navArr'
        }
      })
      return str
    },
    // 获取名称
    getName() {
      this.form.name = this.auths.find(x => x._id === this.form._auth).name
    },
    // 找寻操作的内容所在的位置
    search(arr, value, result) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].index === value) {
          result.push(i)
          return true
        }
        if (arr[i].navArr) {
          result.push(i)
          if (this.search(arr[i].navArr, value, result)) {
            return true
          } else {
            result.pop()
          }
        }
      }
      return false
    },
    // 增加属性
    addIsSelect(arr) {
      arr.forEach(x => {
        x.isSelect = true
        if (x.navArr && x.navArr.length > 0) {
          this.addIsSelect(x.navArr)
        }
      })
    },
    // 找寻位置
    findIndex(arr, val) {
      this.postion = []
      this.search(arr, val, this.postion)
    },
    // 保存
    handleSave() {
      if (this.dataSource.length > 0) {
        const data = {
          type: this.getCurrentNavType(),
          navArr: this.dataSource
        }
        navUpdateDefault(data).then(res => {
          this.$message.success('操作成功')
          this.loadData()
        })
      } else {
        this.$error('数据为空')
      }
    }
  }
}
</script>
<style scoped></style>
