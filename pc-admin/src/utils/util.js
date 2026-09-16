import Vue from 'vue'

export function welcome() {
  const arr = ['休息一会儿吧', '准备吃什么呢?', '要不要打一把 DOTA', '我猜你可能累了']
  const index = Math.floor(Math.random() * arr.length)
  return arr[index]
}

export function timeFix() {
  const time = new Date()
  const hour = time.getHours()
  return hour < 9 ? '早上好' : hour <= 11 ? '上午好' : hour <= 13 ? '中午好' : hour < 20 ? '下午好' : '晚上好'
}

/**
 * @description: 处理后台返回的数据，以便用于表格展示并实现分页
 * @param *
 *    pageNo: 当前页
 *    pageSize: 每页条数
 *    data: 返回的数据对象 {count: 100, data: {members: [{name: '张三'},...]}}
 *    key: data对象的key值，用于取数组
 * @return {*}
 */
export function setTableData(pageNo, pageSize, data, key) {
  return {
    pageSize,
    pageNo,
    totalCount: data.count,
    totalPage: Math.ceil(data.count / pageSize),
    data: data[key]
  }
}

// 在vue上挂载一个指量 preventReClick
export const preventReClick = Vue.directive('preventReClick', {
  inserted: function (el, binding) {
    el.addEventListener('click', () => {
      if (!el.disabled) {
        el.disabled = true
        setTimeout(() => {
          el.disabled = false
        }, binding.value || 2000)
      }
    })
  }
})

export function deepCopy(obj) {
  const result = Array.isArray(obj) ? [] : {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        result[key] = deepCopy(obj[key]) // 递归复制
      } else {
        result[key] = obj[key]
      }
    }
  }
  return result
}

/**
 * 数组中查找对象
 * @param {*} arr
 * @param {*} obj
 */
export function findWhere(arr, obj) {
  let result

  for (let index = 0; index < arr.length; index++) {
    const element = arr[index]
    let isOpen = true
    for (const key in obj) {
      isOpen = true
      if (obj[key] !== element[key]) {
        isOpen = false
      }
    }
    if (isOpen) {
      result = element
      break
    }
  }
  return result
}

export function getWeekName(week) {
  let weekName = ''
  switch (week) {
    case 0:
      weekName = '周日'
      break
    case 1:
      weekName = '周一'
      break
    case 2:
      weekName = '周二'
      break
    case 3:
      weekName = '周三'
      break
    case 4:
      weekName = '周四'
      break
    case 5:
      weekName = '周五'
      break
    case 6:
      weekName = '周六'
      break
    case 7:
      weekName = '节假日'
      break
    default:
      break
  }
  return weekName
}
