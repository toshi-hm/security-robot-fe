import type { MapConfig } from './TrainingConfig'

export type TrainingAlgorithm = 'ppo' | 'a3c'
export type TrainingEnvironmentType = 'standard' | 'enhanced'
export type TrainingStatus = 'created' | 'queued' | 'running' | 'paused' | 'completed' | 'failed'

/**
 * 学習セッションドメインモデル
 *
 * ビジネスルール:
 * - status が 'running' の場合のみ進捗更新が可能
 * - totalTimesteps に達したら自動的に 'completed' に遷移
 * - 進捗率は常に 0-100 の範囲
 */
export class TrainingSession {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly algorithm: TrainingAlgorithm,
    public readonly environmentType: TrainingEnvironmentType,
    public readonly status: TrainingStatus,
    public readonly totalTimesteps: number,
    public readonly currentTimestep: number,
    public readonly episodesCompleted: number,
    public readonly envWidth: number,
    public readonly envHeight: number,
    public readonly coverageWeight: number,
    public readonly explorationWeight: number,
    public readonly diversityWeight: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly learningRate: number | null = null,
    public readonly batchSize: number | null = null,
    public readonly mapConfig: MapConfig | null = null,
    public readonly modelPath?: string | null,
    public readonly config?: Record<string, unknown> | null,
    public readonly startedAt?: Date,
    public readonly completedAt: Date | null = null
  ) {
    this.validateTimesteps()
    this.validateEnvironmentSize()
    this.validateWeights()
  }

  /** 学習が進行中か */
  get isRunning(): boolean {
    return this.status === 'running'
  }

  /** 学習が完了したか */
  get isCompleted(): boolean {
    return this.status === 'completed'
  }

  /** 進捗率 (0-100) */
  get progress(): number {
    if (this.totalTimesteps === 0) {
      return 0
    }

    const ratio = this.currentTimestep / this.totalTimesteps
    const clamped = Math.min(Math.max(ratio, 0), 1)
    return Math.round(clamped * 100)
  }

  /** 学習時間 (ミリ秒) */
  get duration(): number | null {
    if (!this.startedAt) {
      return null
    }

    const endTime = this.completedAt ?? new Date()
    return endTime.getTime() - this.startedAt.getTime()
  }

  /** アルゴリズム表示名 */
  get algorithmDisplayName(): string {
    return this.algorithm.toUpperCase()
  }

  /** 環境タイプ表示名 */
  get environmentTypeDisplayName(): string {
    return this.environmentType === 'enhanced' ? '拡張環境' : '標準環境'
  }

  private validateTimesteps(): void {
    if (this.totalTimesteps < 1000) {
      throw new Error('Total timesteps must be at least 1000')
    }

    if (this.currentTimestep < 0 || this.currentTimestep > this.totalTimesteps) {
      throw new Error('Current timestep out of range')
    }
  }

  private validateEnvironmentSize(): void {
    if (this.envWidth < 5 || this.envWidth > 50) {
      throw new Error('Environment width must be between 5 and 50')
    }

    if (this.envHeight < 5 || this.envHeight > 50) {
      throw new Error('Environment height must be between 5 and 50')
    }
  }

  private validateWeights(): void {
    const validateWeight = (value: number, name: string) => {
      if (value < 0 || value > 10) {
        throw new Error(`${name} must be between 0 and 10`)
      }
    }

    validateWeight(this.coverageWeight, 'Coverage weight')
    validateWeight(this.explorationWeight, 'Exploration weight')
    validateWeight(this.diversityWeight, 'Diversity weight')
  }
}
