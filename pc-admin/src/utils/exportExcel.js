import XLSX from 'xlsx'
import { saveAs } from 'file-saver'

/**
 * 导出二维数组为 xlsx
 * @param {Array<Array>} aoa sheet 数据
 * @param {string} fileName 文件名（可不带后缀）
 * @param {string} [sheetName='Sheet1']
 */
export function exportAoaToExcel(aoa, fileName, sheetName = 'Sheet1') {
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  const colCount = Math.max(...aoa.map(row => (row || []).length), 1)
  ws['!cols'] = Array.from({ length: colCount }, (_, i) => ({
    wch: i < 2 ? 12 : 8
  }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const name = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), name)
}

function escapeCsvCell(value) {
  if (value === undefined || value === null) {
    return ''
  }
  const text = String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

/**
 * 导出二维数组为 csv（单元格内换行可正确显示）
 * @param {Array<Array>} aoa
 * @param {string} fileName
 */
export function exportAoaToCsv(aoa, fileName) {
  const lines = (aoa || []).map(row =>
    (row || []).map(escapeCsvCell).join(',')
  )
  const content = `\uFEFF${lines.join('\n')}\n`
  const name = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`
  saveAs(new Blob([content], { type: 'text/csv;charset=utf-8' }), name)
}

/**
 * 追加空行 + 制表人 / 审批人
 * @param {Array<Array>} aoa
 * @param {string} preparerName 制表人（可为空）
 * @param {string} approverName 审批人
 * @param {number} [approverColIndex=2] 审批人所在列（0 起）；餐费日历固定为 15 号列
 */
export function appendSignerRows(aoa, preparerName = '', approverName = '', approverColIndex = 2) {
  aoa.push([])
  const col = Math.max(Number(approverColIndex) || 0, 0)
  const row = new Array(col + 1).fill('')
  row[0] = `制表人：${preparerName || ''}`
  row[col] = `审批人：${approverName || ''}`
  aoa.push(row)
  return aoa
}
