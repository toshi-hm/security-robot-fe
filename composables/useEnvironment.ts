import { EnvironmentRepositoryImpl } from '~/libs/repositories/environment/EnvironmentRepositoryImpl'
import type { EnvironmentDefinition } from '~/libs/domains/environment/Environment'
import type { EnvironmentStateEntity } from '~/libs/entities/environment/EnvironmentStateEntity'

const repository = new EnvironmentRepositoryImpl()

export const useEnvironment = () => {
  const environments = ref<EnvironmentDefinition[]>([])
  const currentState = ref<EnvironmentStateEntity | null>(null)

  const fetchEnvironments = async () => {
    environments.value = await repository.listEnvironments()
  }

  const fetchState = async (environmentId: string) => {
    currentState.value = await repository.fetchState(environmentId)
  }

  return {
    environments,
    currentState,
    fetchEnvironments,
    fetchState,
  }
}
