import { ref } from 'vue'

import type { EnvironmentDefinition } from '~/libs/domains/environment/Environment'
import type { TrainingConfig } from '~/libs/domains/training/TrainingConfig'
import type { TrainingSession } from '~/libs/domains/training/TrainingSession'
import type { EnvironmentStateEntity } from '~/libs/entities/environment/EnvironmentStateEntity'
import type { EnvironmentRepository } from '~/libs/repositories/environment/EnvironmentRepository'
import { EnvironmentRepositoryImpl } from '~/libs/repositories/environment/EnvironmentRepositoryImpl'

/**
 * Environment管理Composable
 *
 * @param repository - EnvironmentRepository (依存性注入、テスト時にモック可能)
 */
export const useEnvironment = (repository: EnvironmentRepository = new EnvironmentRepositoryImpl()) => {
  const environments = ref<EnvironmentDefinition[]>([])
  const currentState = ref<EnvironmentStateEntity | null>(null)

  const fetchEnvironments = async () => {
    environments.value = await repository.listEnvironments()
  }

  const fetchState = async (environmentId: string) => {
    currentState.value = await repository.fetchState(environmentId)
  }

  const createSession = async (config: TrainingConfig): Promise<TrainingSession> => {
    return await repository.createSession(config)
  }

  return {
    environments,
    currentState,
    fetchEnvironments,
    fetchState,
    createSession,
  }
}
