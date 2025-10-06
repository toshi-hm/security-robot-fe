/**
 * 学習メトリクスドメインモデル
 *
 * 学習の進捗や評価指標を保持する。
 */
export class TrainingMetrics {
  constructor(
    public readonly id: number,
    public readonly sessionId: number,
    public readonly timestep: number,
    public readonly episode: number,
    public readonly reward: number,
    public readonly loss: number,
    public readonly coverageRatio: number,
    public readonly explorationScore: number,
    public readonly timestamp?: Date
  ) {
    this.validateRatios()
  }

  /**
   * カバレッジ率 (0.0 - 1.0) をパーセンテージで返す
   */
  get coveragePercentage(): number {
    return Math.round(this.coverageRatio * 100)
  }

  /**
   * 記録時刻を ISO 文字列で返す
   */
  get isoTimestamp(): string | null {
    return this.timestamp ? this.timestamp.toISOString() : null
  }

  private validateRatios(): void {
    if (this.coverageRatio < 0 || this.coverageRatio > 1) {
      throw new Error('Coverage ratio must be between 0 and 1')
    }

    if (this.explorationScore < 0 || this.explorationScore > 1) {
      throw new Error('Exploration score must be between 0 and 1')
    }
  }
}
