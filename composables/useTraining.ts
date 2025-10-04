import { TrainingRepositoryImpl } from '~/libs/repositories/training/TrainingRepositoryImpl'
import type { TrainingConfig } from '~/libs/domains/training/TrainingConfig'
import type { TrainingMetricsEntity } from '~/libs/entities/training/TrainingMetricsEntity'
import type { TrainingSessionEntity } from '~/libs/entities/training/TrainingSessionEntity'

const repository = new TrainingRepositoryImpl()

export const useTraining = () => {
  const sessions = ref<TrainingSessionEntity[]>([])
  const metrics = ref<TrainingMetricsEntity | null>(null)
  const loading = ref(false)

  const fetchSessions = async () => {
    loading.value = true
    try {
      sessions.value = await repository.listSessions()
    } finally {
      loading.value = false
    }
  }

  const startSession = async (config: TrainingConfig) => {
    loading.value = true
    try {
      const session = await repository.startSession(config)
      sessions.value.push(session)
      return session
    } finally {
      loading.value = false
    }
  }

  const fetchMetrics = async (sessionId: string) => {
    metrics.value = await repository.fetchMetrics(sessionId)
  }

  return {
    sessions,
    metrics,
    loading,
    fetchSessions,
    startSession,
    fetchMetrics,
  }
}
