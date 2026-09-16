<template>
  <a-drawer
    :title="drawerTitle"
    :width="drawerWidthWide"
    :visible="visible"
    :body-style="{ paddingBottom: '80px' }"
    @close="onClose"
  >
    <div class="table-page-search-wrapper">
      <a-alert
        v-if="record && record.status === 'rejected' && (record.rejectReason || rejectFiles.length)"
        type="warning"
        show-icon
        style="margin-bottom: 16px"
        :message="record.rejectReason ? '驳回原因：' + record.rejectReason : '已驳回'"
      />
      <div v-if="rejectFiles.length" class="upload-wrap reject-files">
        <div class="reject-label">驳回附图</div>
        <voucher-upload v-model="rejectFiles" file-type="reject" :image-only="true" :disabled="true" />
      </div>
      <a-form-model ref="ruleForm" layout="inline" :model="form" :rules="rules" class="table-page-search-wrapper2">
        <a-row :gutter="searchGutter" v-if="isOrg">
          <a-col :xl="24" :xs="24">
            <a-form-model-item label="员工" prop="_user">
              <a-select
                v-model="form._user"
                show-search
                option-filter-prop="children"
                placeholder="请选择员工"
                :disabled="isEdit || readonly"
              >
                <a-select-option v-for="item in staffList" :key="item._id" :value="item._id">
                  {{ item.name }}（{{ item.account }}）
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row :gutter="searchGutter">
          <a-col :xl="24" :xs="24">
            <a-form-model-item label="日期" prop="date">
              <a-date-picker
                v-model="form.date"
                style="width: 100%"
                placeholder="请选择加班日期"
                :disabled="readonly"
              />
              <div class="field-tip">
                打车时间可能是加班日的次日凌晨，请选择加班当天的日期。例如：打车时间为 2026年7月31日 1:30，加班日期请选择 2026年7月30日。
              </div>
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row :gutter="searchGutter">
          <a-col :xl="24" :xs="24">
            <a-form-model-item label="中午餐费" prop="lunchAmount">
              <a-input-number
                v-model="form.lunchAmount"
                :min="0"
                :precision="2"
                :step="0.01"
                style="width: 100%"
                placeholder="请输入中午餐费"
                :disabled="readonly"
              />
              <div v-if="lunchAmountMax > 0" class="field-tip">金额不能超过{{ lunchAmountMax }}元</div>
              <div class="field-tip">
                发票左下空白处写上名字、日期<span v-if="lunchAmountMax > 0">、报销金额（如果超过{{ lunchAmountMax }}元）</span>
              </div>
              <div class="upload-wrap">
                <voucher-upload v-model="form.lunchFiles" file-type="lunch" :disabled="readonly" :max-count="2" />
                <div v-if="(form.lunchAmount || 0) > 0" class="field-tip">有金额必须上传午餐凭证，最多2张</div>
              </div>
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row :gutter="searchGutter">
          <a-col :xl="24" :xs="24">
            <a-form-model-item label="晚上餐费" prop="dinnerAmount">
              <a-input-number
                v-model="form.dinnerAmount"
                :min="0"
                :precision="2"
                :step="0.01"
                style="width: 100%"
                placeholder="请输入晚上餐费"
                :disabled="readonly"
              />
              <div v-if="dinnerAmountMax > 0" class="field-tip">金额不能超过{{ dinnerAmountMax }}元</div>
              <div class="field-tip">
                发票左下空白处写上名字、日期<span v-if="dinnerAmountMax > 0">、报销金额（如果超过{{ dinnerAmountMax }}元）</span>
              </div>
              <div class="upload-wrap">
                <voucher-upload v-model="form.dinnerFiles" file-type="dinner" :disabled="readonly" :max-count="2" />
                <div v-if="(form.dinnerAmount || 0) > 0" class="field-tip">有金额必须上传晚餐凭证，最多2张</div>
              </div>
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row :gutter="searchGutter">
          <a-col :xl="24" :xs="24">
            <a-form-model-item label="打车费" prop="taxiAmount">
              <a-input-number
                v-model="form.taxiAmount"
                :min="0"
                :precision="2"
                :step="0.01"
                style="width: 100%"
                placeholder="请输入打车费"
                :disabled="readonly"
              />
              <div class="field-tip">行车单上写上名字</div>
              <div class="upload-wrap">
                <voucher-upload v-model="form.taxiFiles" file-type="taxi" :disabled="readonly" :max-count="2" />
                <div v-if="(form.taxiAmount || 0) > 0" class="field-tip">有金额必须上传打车凭证，最多2张</div>
              </div>
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row :gutter="searchGutter">
          <a-col :xl="24" :xs="24">
            <a-form-model-item label="备注" prop="remark">
              <a-textarea v-model="form.remark" :rows="3" placeholder="选填" :disabled="readonly" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </div>
    <div class="drawer-btn">
      <a-button style="margin-right: 8px" @click="onClose">{{ readonly ? '关闭' : '取消' }}</a-button>
      <a-button v-if="!readonly" type="primary" :loading="submitting" @click="handleSubmit">确定</a-button>
    </div>
  </a-drawer>
</template>

<script>
import moment from 'moment'
import { otdailyUpdate, configShow } from '@/api/request'
import { deviceMixin } from '@/store/device-mixin'
import VoucherUpload from './VoucherUpload'

const defaultForm = () => ({
  _otdaily: '',
  _user: undefined,
  date: null,
  lunchAmount: undefined,
  dinnerAmount: undefined,
  taxiAmount: undefined,
  remark: '',
  lunchFiles: [],
  dinnerFiles: [],
  taxiFiles: []
})

function toAmountValue(value) {
  if (value === undefined || value === null || value === '') {
    return undefined
  }
  const num = Number(value)
  if (isNaN(num) || num === 0) {
    return undefined
  }
  return num
}

function splitAttachments(list) {
  const attachments = Array.isArray(list) ? list : []
  return {
    lunchFiles: attachments.filter(item => item.type === 'lunch'),
    dinnerFiles: attachments.filter(item => item.type === 'dinner'),
    taxiFiles: attachments.filter(item => item.type === 'taxi'),
    rejectFiles: attachments.filter(item => item.type === 'reject')
  }
}

export default {
  name: 'EntryForm',
  components: { VoucherUpload },
  mixins: [deviceMixin],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    isOrg: {
      type: Boolean,
      default: false
    },
    staffList: {
      type: Array,
      default: () => []
    },
    record: {
      type: Object,
      default: null
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      submitting: false,
      form: defaultForm(),
      lunchAmountMax: 0,
      dinnerAmountMax: 0,
      rejectFiles: []
    }
  },
  computed: {
    isEdit() {
      return !!(this.record && this.record._id)
    },
    drawerTitle() {
      if (this.readonly) {
        return '查看加班费用'
      }
      return this.isEdit ? '编辑加班费用' : '录入加班费用'
    },
    rules() {
      const rules = {
        date: [{ required: true, message: '请选择日期', trigger: 'change' }]
      }
      if (this.isOrg) {
        rules._user = [{ required: true, message: '请选择员工', trigger: 'change' }]
      }
      return rules
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.loadAmountMax()
        this.initForm()
      }
    }
  },
  methods: {
    loadAmountMax() {
      configShow()
        .then(res => {
          const result = (res.data && res.data.result) || {}
          this.lunchAmountMax = Number(result.lunchAmountMax) || 0
          this.dinnerAmountMax = Number(result.dinnerAmountMax) || 0
        })
        .catch(() => {
          this.lunchAmountMax = 0
          this.dinnerAmountMax = 0
        })
    },
    initForm() {
      if (this.record && this.record._id) {
        const files = splitAttachments(this.record.attachments)
        this.form = {
          _otdaily: this.record._id,
          _user: this.record._user,
          date: this.record.date ? moment(this.record.date) : null,
          lunchAmount: toAmountValue(this.record.lunchAmount),
          dinnerAmount: toAmountValue(this.record.dinnerAmount),
          taxiAmount: toAmountValue(this.record.taxiAmount),
          remark: this.record.remark || '',
          lunchFiles: files.lunchFiles,
          dinnerFiles: files.dinnerFiles,
          taxiFiles: files.taxiFiles
        }
        this.rejectFiles = files.rejectFiles
      } else {
        this.form = defaultForm()
        this.rejectFiles = []
      }
      this.$nextTick(() => {
        if (this.$refs.ruleForm) {
          this.$refs.ruleForm.clearValidate()
        }
      })
    },
    onClose() {
      this.$emit('close')
    },
    handleSubmit() {
      this.$refs.ruleForm.validate(valid => {
        if (!valid) {
          return
        }
        const lunchAmount = Number(this.form.lunchAmount) || 0
        const dinnerAmount = Number(this.form.dinnerAmount) || 0
        const taxiAmount = Number(this.form.taxiAmount) || 0
        if (lunchAmount === 0 && dinnerAmount === 0 && taxiAmount === 0) {
          this.$message.warning('请至少填写一项费用')
          return
        }
        if (this.lunchAmountMax > 0 && lunchAmount > this.lunchAmountMax) {
          this.$message.error(`中午餐费不能超过${this.lunchAmountMax}元`)
          return
        }
        if (this.dinnerAmountMax > 0 && dinnerAmount > this.dinnerAmountMax) {
          this.$message.error(`晚上餐费不能超过${this.dinnerAmountMax}元`)
          return
        }
        if (lunchAmount > 0 && !(this.form.lunchFiles && this.form.lunchFiles.length)) {
          this.$message.error('请上传中午餐费凭证')
          return
        }
        if (dinnerAmount > 0 && !(this.form.dinnerFiles && this.form.dinnerFiles.length)) {
          this.$message.error('请上传晚上餐费凭证')
          return
        }
        if (taxiAmount > 0 && !(this.form.taxiFiles && this.form.taxiFiles.length)) {
          this.$message.error('请上传打车费凭证')
          return
        }
        if ((this.form.lunchFiles || []).length > 2) {
          this.$message.error('中午餐费凭证最多2张')
          return
        }
        if ((this.form.dinnerFiles || []).length > 2) {
          this.$message.error('晚上餐费凭证最多2张')
          return
        }
        if ((this.form.taxiFiles || []).length > 2) {
          this.$message.error('打车费凭证最多2张')
          return
        }
        const params = {
          date: this.form.date ? moment(this.form.date).format('YYYY-MM-DD') : '',
          lunchAmount,
          dinnerAmount,
          taxiAmount,
          remark: this.form.remark || '',
          attachments: []
            .concat(this.form.lunchFiles || [])
            .concat(this.form.dinnerFiles || [])
            .concat(this.form.taxiFiles || [])
        }
        if (this.isEdit) {
          params._otdaily = this.form._otdaily
        }
        if (this.isOrg) {
          params._user = this.form._user
        }
        this.submitting = true
        otdailyUpdate(params)
          .then(() => {
            this.$message.success(this.isOrg && !this.isEdit ? '已录入并直接通过' : '操作成功')
            this.$emit('ok')
            this.onClose()
          })
          .finally(() => {
            this.submitting = false
          })
      })
    }
  }
}
</script>

<style scoped lang="less">
.table-page-search-wrapper {
  /deep/ .ant-form-item-label {
    width: 100px !important;
    display: inline-block !important;
  }
}

.field-tip {
  margin-top: 6px;
  line-height: 1.5;
  color: #f5222d;
  font-size: 12px;
  white-space: normal;
}

.upload-wrap {
  margin-top: 8px;
}

.reject-files {
  margin-bottom: 16px;
}

.reject-label {
  margin-bottom: 6px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 13px;
}

@media (max-width: 576px) {
  .table-page-search-wrapper {
    /deep/ .ant-form-item-label {
      width: 100% !important;
      text-align: left;
    }
  }
}
</style>
