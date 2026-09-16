// 机构配置区块（仅保留公司信息与 OSS）
export const CONFIG_SECTIONS = [
  { key: 'company', label: '公司信息', shortLabel: '公司' },
  { key: 'aliOss', label: '阿里云OSS配置', shortLabel: 'OSS' }
]

/** 操作列直接展示的配置按钮数量，其余收入「配置」下拉；0 表示全部收入下拉 */
export const CONFIG_SECTION_VISIBLE_COUNT = 0

export const SERVICE_SECTION_KEYS = ['aliOss']
export const OPS_SECTION_KEYS = []

export function getConfigSectionLabel(key) {
  const item = CONFIG_SECTIONS.find(s => s.key === key)
  return item ? item.label : '配置信息'
}
