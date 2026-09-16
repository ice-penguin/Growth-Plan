<template>
  <a-card class="my-field" :bordered="false">
    <page-header-wrapper :breadcrumb="false">
      <a-layout class="my-layout" :style="{ height: layoutHeight, overflow: 'hidden' }">
        <a-layout-sider :style="{ height: layoutHeight, overflow: 'auto' }">
          <template>
            <a-row class="menuTitle">
              <a-col :span="12">机构列表</a-col>
            </a-row>
            <a-menu
              mode="inline"
              style="width: 234px"
              theme="light"
              :multiple="false"
              :defaultSelectedKeys="defaultSelectedKeys"
              @click="chooseMenu"
            >
              <a-menu-item class="menuItem" v-for="staff in staffs" :key="staff._id">
                <a-row>
                  <a-col :span="20">{{ staff.name }}</a-col>
                </a-row>
              </a-menu-item>
            </a-menu>
          </template>
        </a-layout-sider>

        <a-layout>
          <a-layout-header>
            <a-row class="menuTitle2">
              <a-col :span="24">功能权限</a-col>
            </a-row>
          </a-layout-header>
          <a-layout-content>
            <a-checkbox @change="onChangeChooseAll" :checked="isChooseAll">全选</a-checkbox>
            <div class="treeBox">
              <a-tree
                v-model="checkedKeys"
                :checkable="true"
                :expanded-keys="expandedKeys"
                :auto-expand-parent="false"
                :selectable="false"
                :tree-data="treeData"
                :replace-fields="replaceFields"
                @expand="onExpand"
              />
            </div>
            <a-button style="margin-top:24px" type="primary" @click="handleClickSubmitAuth">保存</a-button>
          </a-layout-content>
        </a-layout>
      </a-layout>
    </page-header-wrapper>
  </a-card>
</template>
<script>
import { navGetOther, roleUpdateAuth, userIndex } from '@/api/request'
import { mapGetters } from 'vuex'
import { findWhere } from '@/utils/util'
export default {
  data() {
    return {
      form: {
        name: '',
        description: ''
      },
      layoutHeight: '',
      staffs: [],
      defaultSelectedKeys: [],
      openKeys: [],
      clientApps: [],
      clientAppsTrain: [],
      chooseRole: '',
      expandedKeys: [], // 所有选中的父节点
      checkedKeys: [], // 所有选中的节点
      treeData: [],
      count: 0, // 所有节点个数
      type: 1,
      isChooseAll: false,
      replaceFields: {
        children: 'navArr',
        title: 'name',
        key: '_id'
      }
    }
  },
  components: {},
  filters: {},
  watch: {
    checkedKeys() {
      this.isChooseAll = this.checkedKeys.length === this.count
    },
    treeData() {
      this.isChooseAll = this.treeData.every(item => item.isSelect)
    }
  },
  created() {
    this.loadSatffRoles()
    // this.loadNavs()
    this.layoutHeight = this.fullHeight - 20 + 'px'
  },

  computed: {
    ...mapGetters(['fullHeight'])
  },
  methods: {
    callback(key) {
      this.type = key
      if (key === 1) {
        this.loadNavs(this.chooseRole)
      }
    },
    loadSatffRoles() {
      userIndex().then(res => {
        this.staffs = res.data.result
        if (this.staffs.length > 0) {
          this.defaultSelectedKeys.push(this.staffs[0]._id)
          this.chooseRole = this.staffs[0]._id
          this.loadNavs(this.chooseRole)
        }
      })
    },
    onChange(e) {
      e.isSelect = !e.isSelect
    },
    onChangeTrain(e) {
      if (e.openStatus === 'ON') {
        e.openStatus = 'OFF'
      } else {
        e.openStatus = 'ON'
      }
    },
    chooseMenu(item) {
      const staff = findWhere(this.staffs, { _id: item.key })
      this.chooseRole = staff._id
      if (this.type === 1) {
        this.loadNavs(this.chooseRole)
      }
    },
    loadNavs(staff) {
      const self = this
      self.treeData = []
      self.checkedKeys = []
      self.expandedKeys = []
      self.count = 0
      const params = {
        role: 'organization',
        _org: staff,
        isChange: false
      }
      navGetOther(params).then(res => {
        self.treeData = res.data.navArr
        const dealNav = function(navs, count) {
          let index = 0 // 记录选中数量
          navs.map(nav => {
            self.count++
            if (nav.navArr && nav.navArr.length > 0) {
              dealNav(nav.navArr, index)
              if (index === navs.length) {
                self.checkedKeys.push(nav._id)
                count++
              }
            } else {
              if (nav.isSelect) {
                self.checkedKeys.push(nav._id)
                index++
              }
            }
          })
        }
        dealNav(self.treeData)

        // // 用以下的三层for循环，改写出上面的递归写法，for保留用于排查错误
        // for (let i = 0; i <= self.treeData.length - 1; i++) {
        //   const firstNav = self.treeData[i]
        //   if (firstNav.navArr && firstNav.navArr.length > 0) {
        //     let secondCount = 0
        //     for (let j = 0; j <= firstNav.navArr.length - 1; j++) {
        //       const secondNav = firstNav.navArr[j]
        //       if (secondNav.navArr && secondNav.navArr.length > 0) {
        //         let thirdCount = 0
        //         for (let k = 0; k <= secondNav.navArr.length - 1; k++) {
        //           const thirdNav = secondNav.navArr[k]
        //           if (thirdNav.isSelect) {
        //             self.checkedKeys.push(thirdNav._id)
        //             thirdCount++
        //           }
        //         }
        //         if (thirdCount === secondNav.navArr.length) {
        //           self.checkedKeys.push(secondNav._id)
        //           secondCount++
        //         }
        //       } else {
        //         if (secondNav.isSelect) {
        //           self.checkedKeys.push(secondNav._id)
        //           secondCount++
        //         }
        //       }
        //     }
        //     if (secondCount === firstNav.navArr.length) {
        //       self.checkedKeys.push(firstNav._id)
        //     }
        //   } else {
        //     if (firstNav.isSelect) {
        //       self.checkedKeys.push(firstNav._id)
        //     }
        //   }
        // }
        if (self.checkedKeys.length === self.count) {
          self.isChooseAll = true
        } else {
          self.isChooseAll = false
        }
      })
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
    },
    onChangeChooseAll(e) {
      // 全选
      const self = this
      self.isChooseAll = e.target.checked
      if (e.target.checked) {
        self.checkedKeys = []
        const dealNav = function(navs) {
          navs.map(nav => {
            if (nav.navArr && nav.navArr.length > 0) {
              dealNav(nav.navArr)
            }
            self.checkedKeys.push(nav._id)
          })
        }
        dealNav(self.treeData)
      } else {
        self.checkedKeys = []
      }
    },
    handleClickSubmitAuth() {
      const self = this
      const data = {
        role: 'organization',
        _org: this.chooseRole,
        authArr: []
      }
      const dealNav = function (navs, lastNav) {
        navs.map(nav => {
          nav.isSelect = false
          if (nav.navArr && nav.navArr.length > 0) {
            dealNav(nav.navArr, nav)
          } else {
            if (self.checkedKeys.indexOf(nav._id) !== -1) {
              nav.isSelect = true
              if (lastNav) {
                lastNav.isSelect = true
              }
            }
          }
          if (lastNav && nav.isSelect) {
            lastNav.isSelect = true
          }
        })
      }
      dealNav(self.treeData)
      
      data.navArr = this.treeData
      function extractSelectedAuths(navArr) {
        const result = []
        function traverse(nodes) {
          if (!nodes || !Array.isArray(nodes)) return
          nodes.forEach(node => {
            if (node.isSelect === true && node._auth) {
              result.push(node._auth)
            }
            if (node.navArr && node.navArr.length > 0) {
              traverse(node.navArr)
            }
          })
        }
        traverse(navArr)
        return result
      }
      data.authArr = extractSelectedAuths(data.navArr)
      roleUpdateAuth(data).then(res => {
        this.$message.success('操作成功')
        this.expandedKeys = []
      })
    }
  }
}
</script>
<style lang="less" scoped>
.menuTitle {
  border-right: 1px solid #e8e8e8;
  height: 64px;
  padding: 0 24px;
  font-size: 16px;
  font-weight: 500;
  line-height: 64px;
}
.menuTitle2 {
  height: 64px;
  font-size: 16px;
  font-weight: 500;
  line-height: 64px;
}
.menuIcon {
  display: none;
}
.menuItem:hover {
  background: #e6f7ff;
}
.menuItem:hover .menuIcon {
  display: inline;
}
.treeBox {
  height: 600px;
  overflow-y: auto;
}
.my-field {
  /deep/ .ant-pro-grid-content {
    height: 100%;
  }
  /deep/ .my-layout {
    height: 100%;
  }
  /deep/ .ant-layout-sider {
    flex: 0 0 234px !important;
    max-width: 234px !important;
    min-width: 234px !important;
    width: 234px !important;
    border-radius: 2px 0px 0px 2px;
    height: 100% !important;
    background: #ffffff !important;
  }
  /deep/ .ant-pro-page-header-wrap-children-content {
    margin: 0;
  }
  /deep/ .ant-layout-header {
    padding: 0 24px;
    background: #ffffff;
  }

  /deep/ .ant-layout-content {
    padding: 0 24px;
    background: #ffffff;
  }
}
.after-input-text {
  margin-left: 8px;
}
/deep/ .ant-form-item-label {
  width: 94px !important;
  display: inline-block !important;
}
/deep/ .table-page-search-wrapper2 .ant-form-item-label {
  width: auto !important;
}

/deep/ .btn-role {
  .ant-tree-child-tree {
    display: flex;
  }
  .ant-tree-child-tree > li:first-child {
    padding-top: 4px;
  }
}

/deep/ .disabled {
  .ant-tree-checkbox {
    cursor: not-allowed;
    pointer-events: none;
    .ant-tree-checkbox-inner {
      color: rgba(0, 0, 0, 0.65);
      background-color: #f5f5f5;
      border-color: #d9d9d9 !important;
      &::after {
        border-color: rgba(0, 0, 0, 0.25);
      }
    }
  }
  /deep/ .ant-tree-child-tree > li:first-child {
    padding-top: 0 !important;
  }
}
// /deep/ .ant-tabs {
//   background-color: #fff;
//   padding-left: 20px;
//   padding-bottom: 41px;
// }
// /deep/.ant-tabs-bar {
//   margin-top: 10px;
//   margin-bottom: 24px;
//   border: 0;
// }
// /deep/.ant-tabs-nav .ant-tabs-tab {
//   padding: 12px 0;
// }
// /deep/ table tbody tr:hover > td {
//   background-color: #ffffff !important;
// }
/deep/ .app .ant-checkbox-wrapper {
  display: block;
  margin-bottom: 4px;
}
/deep/ .app .ant-checkbox-wrapper + .ant-checkbox-wrapper {
  margin-left: 0;
}
</style>
