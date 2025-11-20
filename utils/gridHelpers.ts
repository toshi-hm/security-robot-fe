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

/**
 * 障害物の総数をカウントする
 */
export const countObstacles = (obstacles: ReadonlyArray<ReadonlyArray<boolean>>): number => {
  if (!obstacles?.length) return 0

  return obstacles.reduce((count, row) => {
    const rowCount = row?.reduce((rowSum, cell) => rowSum + (cell ? 1 : 0), 0) ?? 0
    return count + rowCount
  }, 0)
}

/**
 * 脅威度グリッドの平均値を計算する
 */
export const calculateAverageThreat = (threatGrid: ReadonlyArray<ReadonlyArray<number>>): number => {
  if (!threatGrid?.length) return 0

  const width = threatGrid[0]?.length ?? 0
  if (width === 0) return 0

  const total = threatGrid.reduce((sum, row) => {
    const rowTotal = row?.reduce((rowSum, cell) => rowSum + cell, 0) ?? 0
    return sum + rowTotal
  }, 0)

  return total / (width * threatGrid.length)
}

/**
 * 脅威度グリッドの最大値を取得する
 */
export const calculateMaxThreat = (threatGrid: ReadonlyArray<ReadonlyArray<number>>): number => {
  if (!threatGrid?.length) return 0

  let max = Number.NEGATIVE_INFINITY

  threatGrid.forEach((row) => {
    if (!row?.length) return
    const rowMax = Math.max(...row)
    if (rowMax > max) {
      max = rowMax
    }
  })

  return max === Number.NEGATIVE_INFINITY ? 0 : max
}
