export interface SuspiciousObject {
  id: number
  x: number
  y: number
  threatLevel: number
  detectedAt?: Date
}

/**
 * 環境定義型
 * 環境の基本的な定義情報
 */
export interface EnvironmentDefinition {
  id: string
  name: string
  width: number
  height: number
  description?: string
}

/**
 * 環境状態ドメインモデル
 *
 * 表現するもの:
 * - ロボットの現在位置と向き
 * - グリッド上の脅威レベル分布
 * - カバレッジマップ(どこを巡回済みか)
 * - 不審物の位置と脅威度
 */
export class Environment {
  constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly robotX: number,
    public readonly robotY: number,
    public readonly robotOrientation: number, // 0=北, 1=東, 2=南, 3=西
    public readonly threatGrid: number[][], // [y][x] = 0.0-1.0
    public readonly coverageMap: boolean[][], // [y][x] = visited
    public readonly suspiciousObjects: SuspiciousObject[]
  ) {
    this.validateRobotPosition()
    this.validateGridDimensions()
  }

  /**
   * ロボットの向き(テキスト)
   */
  get orientationText(): string {
    const directions = ['北', '東', '南', '西']
    return directions[this.robotOrientation] || '不明'
  }

  /**
   * 平均脅威レベル
   */
  get averageThreatLevel(): number {
    const total = this.threatGrid.flat().reduce((sum, val) => sum + val, 0)
    return total / (this.width * this.height)
  }

  /**
   * カバレッジ率 (0.0-1.0)
   */
  get coverageRatio(): number {
    const covered = this.coverageMap.flat().filter((v) => v).length
    return covered / (this.width * this.height)
  }

  /**
   * 不審物数
   */
  get suspiciousObjectCount(): number {
    return this.suspiciousObjects.length
  }

  /**
   * 指定座標の脅威レベルを取得
   */
  getThreatLevelAt(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return 0
    }
    return this.threatGrid[y]?.[x] ?? 0
  }

  /**
   * 指定座標がカバー済みか
   */
  isCovered(x: number, y: number): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return false
    }
    return this.coverageMap[y]?.[x] ?? false
  }

  private validateRobotPosition(): void {
    if (this.robotX < 0 || this.robotX >= this.width) {
      throw new Error(`Robot X position ${this.robotX} out of bounds`)
    }
    if (this.robotY < 0 || this.robotY >= this.height) {
      throw new Error(`Robot Y position ${this.robotY} out of bounds`)
    }
    if (this.robotOrientation < 0 || this.robotOrientation > 3) {
      throw new Error(`Invalid robot orientation ${this.robotOrientation}`)
    }
  }

  private validateGridDimensions(): void {
    if (this.threatGrid.length !== this.height) {
      throw new Error('Threat grid height mismatch')
    }
    if (this.threatGrid[0]?.length !== this.width) {
      throw new Error('Threat grid width mismatch')
    }
    if (this.coverageMap.length !== this.height) {
      throw new Error('Coverage map height mismatch')
    }
    if (this.coverageMap[0]?.length !== this.width) {
      throw new Error('Coverage map width mismatch')
    }
  }
}
