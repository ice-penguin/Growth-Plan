/*
 * @Author: jianxl
 * @Date: 2020-10-22 18:36:07
 * @LastEditTime: 2021-03-10 14:59:54
 * @LastEditors: jianxl
 * @Description: 表单校验规则
 * @FilePath: ant-design-vue-pro-master/src/utils/validate.js
 */

export function isvalidUsername(str) {
  const validMap = ['admin', 'editor']
  return validMap.indexOf(str.trim()) >= 0
}

export function validUsername(str) {
  return str.trim().length > 0
}

// 合法uri
export function validateURL(textval) {
  const urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return urlregex.test(textval)
}

// 小写字母
export function validateLowerCase(str) {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

// 大写字母
export function validateUpperCase(str) {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

// 大小写字母
export function validateAlphabets(str) {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}

export function validateTel(tel) {
  return /^1[23456789]\d{9}$/.test(tel)
}

export const regTel = /^1[23456789]\d{9}$/

export function validateCode(code) {
  return /\d{6}/.test(code)
}

// 处理数据为两位小数
export function twoFloatNumber(num) {
  const num2 = num.toFixed(3)
  return parseFloat(num2.substring(0, num2.lastIndexOf('.') + 3))
}

// 验证是否大于0
export function validatePositive(num) {
  return /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/.test(num)
}

// 验证数字
export function validateNum(num) {
  return /^[0-9]*$/.test(num)
}

export function validateNumber(num) {
  return /^(0|[1-9][0-9]*)(\.\d+)?$/.test(num)
}

// 验证正数
export function validatePositiveNumber(num) {
  return /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(num)
}

// 验证正整数和0
export function validatePositiveMore(num) {
  return /^([1-9]\d*|[0]{1,1})$/.test(num)
}

// 验证正整数
export function validateInteger(num) {
  return /^[0-9]*[1-9][0-9]*$/.test(num)
}

//验证是否是有效身份证号码
export var validateIdCard = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/

// 验证中文，英文（不能是数字）
export var validateName = /^[\u4e00-\u9fa5A-Za-z]+$/g

// 验证手机号正则
export var validatePhone = /^1[23456789]\d{9}$/

// 验证正整数和0
export var validatePositiveMoreReg = /^[0-9]*[1-9][0-9]*$/

// 验证数字大于100
export var hundredCheck = /^[1-9]{1}\d{2,}$/

// 验证6位验证码数字
export var validateSmsCode = /\d{6}$/
