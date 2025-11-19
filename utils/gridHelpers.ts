/**
 * 許容されるグリッド入力
 */
export type GridLike =
  | number[][]
  | boolean[][]
  | Record<string | number, unknown>
  | Array<Record<string | number, unknown>>
  | null
  | undefined

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'boolean') return value ? 1 : 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const normalizeRow = (row: unknown): number[] => {
  if (Array.isArray(row)) {
    return row.map((cell) => toNumber(cell))
  }

  if (row && typeof row === 'object') {
    return Object.values(row as Record<string, unknown>).map((cell) => toNumber(cell))
  }

  if (row == null) return []
  return [toNumber(row)]
}

/**
 * APIから返却されるさまざまな形式のグリッドを number[][] に正規化する
 */
export const normalizeGridMatrix = (grid: GridLike): number[][] => {
  if (!grid) return []

  if (Array.isArray(grid)) {
    return grid.map((row) => normalizeRow(row))
  }

  if (typeof grid === 'object') {
    return Object.values(grid as Record<string, unknown>).map((row) => normalizeRow(row))
  }

  return []
}
