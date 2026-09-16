<template>
  <a-drawer
    title="机构配置"
    :width="drawerWidthWide"
    :visible="visible"
    :body-style="{ paddingBottom: '80px' }"
    @close="onClose"
  >
    <div class="table-page-search-wrapper">
      <a-form-model layout="inline" :model="form" class="table-page-search-wrapper2">
        <a-row :gutter="48">
          <a-col :xl="24">
            <a-form-model-item label="打车阈值">
              <a-time-picker
                v-model="taxiTime"
                format="HH:mm"
                style="width: 100%"
                placeholder="如 22:00"
                :allowClear="false"
              />
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row :gutter="48">
          <a-col :xl="24">
            <div class="extra">当天最晚打卡 ≥ 该阈值时视为达标（允许跨天至次日 04:00 前）</div>
          </a-col>
        </a-row>
        <a-row :gutter="48">
          <a-col :xl="24">
            <a-form-model-item label="中午餐费上限">
              <a-input-number
                v-model="form.lunchAmountMax"
                :min="0"
                :precision="2"
                :step="1"
                style="width: 100%"
                placeholder="请输入中午餐费报销上限"
              />
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row :gutter="48">
          <a-col :xl="24">
            <a-form-model-item label="晚上餐费上限">
              <a-input-number
                v-model="form.dinnerAmountMax"
                :min="0"
                :precision="2"
                :step="1"
                style="width: 100%"
                placeholder="请输入晚上餐费报销上限"
              />
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row :gutter="48">
          <a-col :xl="24">
            <div class="extra">单位：元；填 0 表示不限制</div>
          </a-col>
        </a-row>
        <a-row :gutter="48">
          <a-col :xl="24">
            <div class="section-title">阿里云 OSS</div>
          </a-col>
        </a-row>
        <a-row :gutter="48">
          <a-col :xl="24">
            <a-form-model-item label="Endpoint">
              <a-input v-model="form.aliOss.endpoint" placeholder="如 oss-cn-hangzhou.aliyuncs.com" />
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row :gutter="48">
          <a-col :xl="24">
            <a-form-model-item label="AccessKeyId">
              <a-input-password
                v-model="form.aliOss.accessKeyId"
                autocomplete="new-password"
                :placeholder="accessKeyIdPlaceholder"
              />
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row :gutter="48">
          <a-col :xl="24">
            <a-form-model-item label="AccessKeySecret">
              <a-input-password
                v-model="form.aliOss.accessKeySecret"
                autocomplete="new-password"
                :placeholder="accessKeySecretPlaceholder"
              />
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row :gutter="48">
          <a-col :xl="24">
            <a-form-model-item label="Bucket">
              <a-input v-model="form.aliOss.bucket" placeholder="请输入 Bucket 名称" />
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row :gutter="48">
          <a-col :xl="24">
            <div class="extra">密钥不回显。已配置时留空表示不修改，填了才更新。</div>
          </a-col>
        </a-row>
      </a-form-model>
    </div>
    <div class="drawer-btn">
      <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
      <a-button type="primary" :loading="saving" @click="handleSubmit">保存</a-button>
    </div>
  </a-drawer>
</template>

<script>
import moment from 'moment'
import { configShow, configUpdate } from '@/api/request'
import { deviceMixin } from '@/store/device-mixin'

export default {
  name: 'OrgConfigDrawer',
  mixins: [deviceMixin],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    orgId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      saving: false,
      form: {
        _config: '',
        lunchAmountMax: 0,
        dinnerAmountMax: 0,
        aliOss: {
          endpoint: '',
          accessKeyId: '',
          accessKeySecret: '',
          bucket: ''
        }
      },
      taxiTime: moment('22:00', 'HH:mm'),
      accessKeyIdSet: false,
      accessKeySecretSet: false
    }
  },
  computed: {
    accessKeyIdPlaceholder() {
      return this.accessKeyIdSet ? '已配置，留空则不修改' : '请输入 AccessKeyId'
    },
    accessKeySecretPlaceholder() {
      return this.accessKeySecretSet ? '已配置，留空则不修改' : '请输入 AccessKeySecret'
    }
  },
  watch: {
    visible(val) {
      if (val && this.orgId) {
        this.loadConfig()
      }
    }
  },
  methods: {
    loadConfig() {
      configShow({ _org: this.orgId }).then(res => {
        const result = (res.data && res.data.result) || {}
        const oss = result.aliOss || {}
        this.form._config = result._id || ''
        this.form.lunchAmountMax = result.lunchAmountMax || 0
        this.form.dinnerAmountMax = result.dinnerAmountMax || 0
        this.form.aliOss = {
          endpoint: oss.endpoint || '',
          accessKeyId: '',
          accessKeySecret: '',
          bucket: oss.bucket || ''
        }
        this.accessKeyIdSet = !!oss.accessKeyIdSet
        this.accessKeySecretSet = !!oss.accessKeySecretSet
        this.taxiTime = moment(result.taxiAfterTime || '22:00', 'HH:mm')
      })
    },
    onClose() {
      this.$emit('close')
    },
    handleSubmit() {
      if (!this.form._config) {
        this.$message.warning('配置不存在')
        return
      }
      this.saving = true
      configUpdate({
        _config: this.form._config,
        taxiAfterTime: this.taxiTime ? this.taxiTime.format('HH:mm') : '22:00',
        lunchAmountMax: this.form.lunchAmountMax || 0,
        dinnerAmountMax: this.form.dinnerAmountMax || 0,
        aliOss: this.form.aliOss
      })
        .then(res => {
          const oss = ((res.data && res.data.result) || {}).aliOss || {}
          this.accessKeyIdSet = !!oss.accessKeyIdSet
          this.accessKeySecretSet = !!oss.accessKeySecretSet
          this.form.aliOss.accessKeyId = ''
          this.form.aliOss.accessKeySecret = ''
          this.$message.success('保存成功')
          this.$emit('ok')
          this.onClose()
        })
        .finally(() => {
          this.saving = false
        })
    }
  }
}
</script>

<style scoped lang="less">
.table-page-search-wrapper {
  /deep/ .ant-form-item-label {
    width: 140px !important;
    display: inline-block !important;
  }
}
.section-title {
  margin: 8px 0 16px 140px;
  font-weight: 600;
}
.extra {
  margin-left: 140px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 16px;
}
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
