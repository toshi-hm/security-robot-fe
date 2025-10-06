import type { TrainingConfig } from '~/libs/domains/training/TrainingConfig'
import type { TrainingMetrics } from '~/libs/domains/training/TrainingMetrics'
import type { TrainingSession } from '~/libs/domains/training/TrainingSession'

/**
 * 学習リポジトリインターフェース
 *
 * データアクセスを抽象化し、テスト時にモック可能にする
 */
export interface TrainingRepository {
  /** 全ての学習セッションを取得 */
  findAll(): Promise<TrainingSession[]>

  /** IDで学習セッションを取得 */
  findById(id: number): Promise<TrainingSession | null>

  /** 新しい学習セッションを作成 */
  create(config: TrainingConfig): Promise<TrainingSession>

  /** 学習セッションを停止 */
  stop(id: number): Promise<boolean>

  /** 学習セッションのメトリクスを取得 */
  getMetrics(id: number, limit?: number): Promise<TrainingMetrics[]>
}
