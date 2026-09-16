/*
 * @Author: yzy
 * @LastEditors: yzy
 * @I love coding too
 */
import Vue from 'vue'
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')

Vue.filter('NumberFormat', function(value) {
  if (!value) {
    return '0'
  }
  const intPartFormat = value.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') // 将整数部分逢三一断
  return intPartFormat
})

Vue.filter('dayjs', function(dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return moment(dataStr).format(pattern)
})

Vue.filter('moment', function(dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return moment(dataStr).format(pattern)
})

// 翻译常用状态为中文
Vue.filter('toChinese', value => {
  let chinese
  switch (value) {
    case 'alipay':
      chinese = '支付宝'
      break
    case 'ccb':
      chinese = '建行'
      break
    case 'wx':
      chinese = '微信'
      break
    case 'cash':
      chinese = '现金'
      break
    case 'card':
      chinese = '转账'
      break
    case 'pos':
      chinese = 'POS机'
      break
    case 'member':
      chinese = '余额'
      break
    case 'member_vir':
      chinese = '虚拟卡'
      break
    case 'member_spe':
      chinese = '专用账户'
      break
    case 'other':
      chinese = '其他'
      break
    case 'abc':
      chinese = '农行'
      break
    case 'long':
      chinese = '订场时长卡'
      break
    case 'ALIPAY':
      chinese = '支付宝'
      break
    case 'WECHAT':
      chinese = '微信'
      break
    case 'TRANSFER':
      chinese = '转账'
      break
    case 'check':
      chinese = '支票'
      break
    case 'CASH':
      chinese = '现金'
      break
    case 'POS':
      chinese = 'POS机'
      break
    case 'charge':
      chinese = '充值卡'
      break
    case 'CCBBANK':
      chinese = '建行'
      break
    case 'AGRIBANK':
      chinese = '农业银行'
      break
    case 'MEMBER':
      chinese = '余额'
      break
    case 'UN_LIMIT':
      chinese = '不限制'
      break
    case 'MAN':
      chinese = '男性'
      break
    case 'WOMAN':
      chinese = '女性'
      break
    case 'TRAIN':
      chinese = '培训系统'
      break
    case 'ACTIVITY':
      chinese = '活动报名'
      break
    case 'OTHER':
      chinese = '其他'
      break
    case 'ON':
      chinese = '开启'
      break
    case 'OFF':
      chinese = '关闭'
      break
    case 'ADULT':
      chinese = '成年人'
      break
    case 'CHILDREN':
      chinese = '未成年人'
      break
    case 'UN_SIGN':
      chinese = '未签到'
      break
    case 'SIGNED_IN':
      chinese = '已签到'
      break
    default:
      chinese = '暂无'
      break
  }
  return chinese
})
