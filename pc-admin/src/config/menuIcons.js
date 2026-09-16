import iconGroups from '@/components/IconSelector/icons'

/** 菜单未配置图标时的默认 Ant Design Icon type */
export const DEFAULT_MENU_ICON = 'appstore'

let cachedTypes = null

/** 全部可用的 Ant Design Icon type（去重、排序） */
export function getMenuIconTypes() {
  if (!cachedTypes) {
    const set = new Set()
    iconGroups.forEach(group => {
      group.icons.forEach(type => set.add(type))
    })
    cachedTypes = Array.from(set).sort()
  }
  return cachedTypes
}
