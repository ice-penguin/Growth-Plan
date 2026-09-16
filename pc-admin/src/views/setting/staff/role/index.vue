<template>
  <a-card class="my-field" :bordered="false">
    <page-header-wrapper :breadcrumb="false">
      <a-layout class="my-layout" :style="{height: layoutHeight, overflow: 'hidden'}">
        <a-layout-sider :style="{height: layoutHeight, overflow: 'auto'}">
          <template>
            <a-row class="menuTitle">
              <a-col :span="12">角色</a-col>
              <a-col :span="12" push="1">
                <a-button type="primary" icon="plus" @click="handOpenDrawer()">新建</a-button>
              </a-col>
            </a-row>
            <a-menu
              mode="inline"
              style="width: 234px"
              theme="light"
              :multiple="false"
              :defaultSelectedKeys="defaultSelectedKeys"
              @click="chooseMenu"
            >
              <a-menu-item class="menuItem" v-for="role in roles" :key="role._id">
                <a-row>
                  <a-col :span="20">{{ role.name }}</a-col>
                  <a-col :span="4" push="1" @click="handOpenDrawer(role)">
                    <a-icon class="menuIcon" type="edit" />
                  </a-col>
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
    <a-drawer
      :title="drawerName"
      :width="drawerWidth"
      :visible="isVisible"
      :body-style="{ paddingBottom: '80px' }"
      @close="onCloseDrawer"
    >
      <div class="table-page-search-wrapper">
        <a-form-model layout="inline" ref="ruleForm" :model="form" :rules="rules">
          <a-row :gutter="48">
            <a-col :xl="24">
              <a-form-model-item ref="name" label="角色名称" prop="name">
                <a-input placeholder="最多8个字" v-model="form.name" />
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-row :gutter="48">
            <a-col :xl="24">
              <a-form-model-item ref="name" label="角色描述" prop="description">
                <a-input placeholder="最多30个字" v-model="form.description" />
              </a-form-model-item>
            </a-col>
          </a-row>
        </a-form-model>
      </div>
      <div class="drawer-btn">
        <a-button @click="onCloseDrawer" style="margin-right: 10px;">取消</a-button>
        <a-button type="primary" @click="handleClickSubmit">确定</a-button>
      </div>
    </a-drawer>
  </a-card>
</template>
<script>
import { roleUpdateAuth, roleIndex, roleUpdate, navGetOther } from '@/api/request'
import { mapGetters } from 'vuex'
import { findWhere } from '@/utils/util'
import { deviceMixin } from '@/store/device-mixin'
export default {
  mixins: [deviceMixin],
  data() {
    return {
      form: {
        name: '',
        description: ''
      },
      layoutHeight: '',
      roles: [],
      defaultSelectedKeys: [],
      openKeys: [],
      isVisible: false,
      drawerName: '新建角色',
      rules: {
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '角色名称长度为2-8位', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { max: 30, message: '角色名称长度最多30位', trigger: 'blur' }
        ]
      },
      chooseRole: '',
      expandedKeys: [], // 所有选中的父节点
      checkedKeys: [], // 所有选中的节点
      treeData: [],
      count: 0, // 所有节点个数
      isChooseAll: false,
      replaceFields: {
        children: 'navArr',
        title: 'name',
        key: '_id'
      }
    }
  },
  components: {
  },
  filters: {
  },
  watch: {
    checkedKeys() {
      if (this.checkedKeys.length === this.count) {
        this.isChooseAll = true
      } else {
        this.isChooseAll = false
      }
    }
  },
  created() {
    this.loadSatffRoles()
    this.layoutHeight = this.fullHeight - 20 + 'px'
  },
  computed: {
    ...mapGetters(['fullHeight'])
  },
  methods: {
    loadSatffRoles() {
      roleIndex({ page: 1, itemsPerPage: 99 }).then(res => {
        this.roles = res.data.result
        if (this.roles.length > 0) {
          this.defaultSelectedKeys.push(this.roles[0]._id)
          this.chooseRole = this.roles[0].uuid
          this.loadNavs(this.chooseRole)
        }
      })
    },
    chooseMenu(item) {
      const role = findWhere(this.roles, { _id: item.key })
      this.chooseRole = role.uuid
      this.loadNavs(this.chooseRole)
    },
    loadNavs(role) {
      const self = this
      self.treeData = []
      self.checkedKeys = []
      self.expandedKeys = []
      self.count = 0
      const params = {
        role: role,
        isChange: false
      }
      navGetOther(params).then(res => {
        self.treeData = res.data.navArr
        const dealNav = function (navs, count) {
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
    handOpenDrawer(role) {
      this.isVisible = true
      this.form = {}
      if (role) {
        this.drawerName = '编辑角色'
        this.form = {
          _id: role._id,
          name: role.name,
          description: role.description
        }
      }
    },
    onCloseDrawer() {
      this.isVisible = false
    },
    handleClickSubmit() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          const params = {
            _role: this.form._id,
            name: this.form.name,
            description: this.form.description,
            auths: []
          }
          if (params._role) {
            roleUpdate(params).then(res => {
              this.loadSatffRoles()
              this.onCloseDrawer()
              this.$message.success('操作成功')
            })
          } else {
            roleUpdate(params).then(res => {
              this.loadSatffRoles()
              this.onCloseDrawer()
              this.$message.success('操作成功')
            })
          }
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
        const dealNav = function (navs) {
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
        role: this.chooseRole,
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
      // // 用以下的三层for循环，改写出上面的递归写法，for保留用于排查错误
      // for (let i = 0; i <= self.treeData.length - 1; i++) {
      //   const firstNav = self.treeData[i]
      //   firstNav.isSelect = false
      //   if (firstNav.navArr && firstNav.navArr.length > 0) {
      //     for (let j = 0; j <= firstNav.navArr.length - 1; j++) {
      //       const secondNav = firstNav.navArr[j]
      //       secondNav.isSelect = false
      //       if (secondNav.navArr && secondNav.navArr.length > 0) {
      //         for (let k = 0; k <= secondNav.navArr.length - 1; k++) {
      //           const thirdNav = secondNav.navArr[k]
      //           thirdNav.isSelect = false
      //           if (self.checkedKeys.indexOf(thirdNav._id) !== -1) {
      //             thirdNav.isSelect = true
      //             secondNav.isSelect = true
      //           }
      //         }
      //       } else {
      //         if (self.checkedKeys.indexOf(secondNav._id) !== -1) {
      //           secondNav.isSelect = true
      //           firstNav.isSelect = true
      //         }
      //       }
      //       if (secondNav.isSelect) {
      //         firstNav.isSelect = true
      //       }
      //     }
      //   } else {
      //     if (self.checkedKeys.indexOf(firstNav._id) !== -1) {
      //       firstNav.isSelect = true
      //     }
      //   }
      // }
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
  /deep/ .ant-layout-header,
  /deep/ .ant-layout-content {
    padding: 0 24px;
    background: #ffffff;
  }
}

@media (max-width: 576px) {
  .my-field {
    /deep/ .my-layout {
      flex-direction: column !important;
      height: auto !important;
      overflow: visible !important;
    }
    /deep/ .ant-layout-sider {
      flex: none !important;
      max-width: 100% !important;
      min-width: 100% !important;
      width: 100% !important;
      height: auto !important;
      max-height: 240px;
      overflow: auto !important;
      border-bottom: 1px solid #e8e8e8;
    }
    /deep/ .ant-menu {
      width: 100% !important;
    }
    /deep/ .ant-layout-header,
    /deep/ .ant-layout-content {
      padding: 0 12px;
    }
  }
  .treeBox {
    height: 360px;
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
</style>
