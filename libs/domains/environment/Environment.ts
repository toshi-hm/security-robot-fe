import type { RobotState } from './RobotState'

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
    public readonly robots: RobotState[], // 複数ロボット対応
    public readonly threatGrid: number[][], // [y][x] = 0.0-1.0
    public readonly coverageMap: boolean[][], // [y][x] = visited
    public readonly suspiciousObjects: SuspiciousObject[],
    public readonly obstacles: boolean[][] = [] // [y][x] = isObstacle
  ) {
    this.validateRobots()
    this.validateGridDimensions()
  }

  /**
   * 後方互換性: 最初のロボットのX座標
   */
  get robotX(): number {
    return this.robots[0]?.x ?? 0
  }

  /**
   * 後方互換性: 最初のロボットのY座標
   */
  get robotY(): number {
    return this.robots[0]?.y ?? 0
  }

  /**
   * 後方互換性: 最初のロボットの向き
   */
  get robotOrientation(): number {
    return this.robots[0]?.orientation ?? 0
  }

  /**
   * ロボットの向き(テキスト) - 最初のロボット
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

  /**
   * 指定座標が障害物か
   */
  isObstacle(x: number, y: number): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return true // 範囲外は障害物扱い
    }
    return this.obstacles[y]?.[x] ?? false
  }

  private validateRobots(): void {
    if (this.robots.length === 0) {
      throw new Error('Environment must have at least one robot')
    }
    this.robots.forEach((robot, index) => {
      if (robot.x < 0 || robot.x >= this.width) {
        throw new Error(`Robot ${index} X position ${robot.x} out of bounds`)
      }
      if (robot.y < 0 || robot.y >= this.height) {
        throw new Error(`Robot ${index} Y position ${robot.y} out of bounds`)
      }
      if (robot.orientation < 0 || robot.orientation > 3) {
        throw new Error(`Invalid robot ${index} orientation ${robot.orientation}`)
      }
    })
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
