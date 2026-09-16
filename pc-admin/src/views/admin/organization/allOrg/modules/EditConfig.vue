<template>
  <a-drawer :title="drawerTitle" :width="drawerWidthWide" :visible="visible" :body-style="{ paddingBottom: '80px' }" @close="onCloseDrawer">
    <div class="table-page-search-wrapper">
      <a-form-model layout="inline" ref="ruleForm" :model="form">
        <a-row :gutter="48">
          <a-col :xl="24">
            <config-company-section v-if="activeSection === 'company'" :form="form" :section="activeSection" />
            <config-service-section
              v-if="isServiceSection"
              :form="form"
              :section="activeSection"
            />
          </a-col>
        </a-row>
      </a-form-model>
    </div>
    <div class="drawer-btn">
      <a-button @click="onCloseDrawer" style="margin-right: 10px;">取消</a-button>
      <a-button type="primary" @click="handleClickSubmit">确定</a-button>
    </div>
  </a-drawer>
</template>

<script>
import { configUpdate } from '@/api/request'
import { deepCopy } from '@/utils/util'
import ConfigCompanySection from './configSections/CompanySection'
import ConfigServiceSection from './configSections/ServiceSection'
import {
  getConfigSectionLabel,
  SERVICE_SECTION_KEYS
} from '../configSections'
import { deviceMixin } from '@/store/device-mixin'

const emptyForm = () => ({
  _organization: '',
  _config: '',
  companyInfo: {
    name: '',
    address: '',
    logo: '',
    logoMin: ''
  },
  aliOss: {
    endpoint: '',
    accessKeyId: '',
    accessKeySecret: '',
    bucket: ''
  }
})

export default {
  mixins: [deviceMixin],
  components: {
    ConfigCompanySection,
    ConfigServiceSection
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    lineObj: {
      type: Object,
      required: true
    },
    activeSection: {
      type: String,
      default: 'company'
    }
  },
  computed: {
    drawerTitle() {
      return getConfigSectionLabel(this.activeSection)
    },
    isServiceSection() {
      return SERVICE_SECTION_KEYS.indexOf(this.activeSection) !== -1
    }
  },
  data() {
    return {
      form: emptyForm()
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.initForm()
      }
    },
    activeSection() {
      if (this.visible) {
        this.initForm()
      }
    }
  },
  methods: {
    initForm() {
      const source = deepCopy(this.lineObj || {})
      this.form = {
        ...emptyForm(),
        ...source,
        _config: source._id || source._config || '',
        companyInfo: {
          ...emptyForm().companyInfo,
          ...(source.companyInfo || {})
        },
        aliOss: {
          ...emptyForm().aliOss,
          ...(source.aliOss || {})
        }
      }
    },
    onCloseDrawer() {
      this.$emit('close')
    },
    handleClickSubmit() {
      if (!this.form._config) {
        this.$message.warning('配置不存在')
        return
      }
      const payload = {
        _config: this.form._config,
        companyInfo: this.form.companyInfo,
        aliOss: this.form.aliOss
      }
      configUpdate(payload).then(() => {
        this.$message.success('保存成功')
        this.$emit('ok')
        this.onCloseDrawer()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.drawer-btn {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e9e9e9;
  padding: 10px 16px;
  background: #fff;
  text-align: right;
  z-index: 1;
}
</style>
