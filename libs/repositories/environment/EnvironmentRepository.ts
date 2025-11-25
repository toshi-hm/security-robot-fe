import type { EnvironmentDefinition } from '../../domains/environment/Environment'
import type { EnvironmentStateEntity } from '../../entities/environment/EnvironmentStateEntity'

/**
 * Environment Repository
 *
 * Note: トレーニングセッションの作成は TrainingRepository の責務です
 * このリポジトリは環境定義の取得と環境状態の取得のみを担当します
 */
export interface EnvironmentRepository {
  listEnvironments(): Promise<EnvironmentDefinition[]>
  fetchState(environmentId: string): Promise<EnvironmentStateEntity>
}
