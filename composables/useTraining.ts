import { computed, ref } from 'vue'

import type { TrainingConfig } from '~/libs/domains/training/TrainingConfig'
import type { TrainingMetrics } from '~/libs/domains/training/TrainingMetrics'
import type { TrainingSession } from '~/libs/domains/training/TrainingSession'
import { TrainingRepositoryImpl } from '~/libs/repositories/training/TrainingRepositoryImpl'

/**
 * 学習管理Composable
 *
 * リポジトリを使用してビジネスロジックを実装
 */
export const useTraining = () => {
  const repository = new TrainingRepositoryImpl()

  const sessions = ref<TrainingSession[]>([])
  const currentSession = ref<TrainingSession | null>(null)
  const metrics = ref<TrainingMetrics[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const activeSessions = computed(() => sessions.value.filter((session) => session.isRunning))
  const completedSessions = computed(() => sessions.value.filter((session) => session.isCompleted))

  const fetchSessions = async () => {
    isLoading.value = true
    error.value = null

    try {
      sessions.value = await repository.findAll()
    } catch (err) {
      error.value = 'Failed to fetch training sessions'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  const createSession = async (config: TrainingConfig): Promise<TrainingSession | null> => {
    isLoading.value = true
    error.value = null

    try {
      const newSession = await repository.create(config)
      sessions.value.push(newSession)
      currentSession.value = newSession
      return newSession
    } catch (err) {
      error.value = 'Failed to create training session'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const stopSession = async (id: number): Promise<boolean> => {
    try {
      const success = await repository.stop(id)
      if (success) {
        await fetchSessions()
      }
      return success
    } catch (err) {
      error.value = 'Failed to stop training session'
      console.error(err)
      return false
    }
  }

  const fetchMetrics = async (sessionId: number) => {
    try {
      metrics.value = await repository.getMetrics(sessionId)
    } catch (err) {
      error.value = 'Failed to fetch metrics'
      console.error(err)
    }
  }

  return {
    sessions,
    currentSession,
    metrics,
    isLoading,
    error,
    activeSessions,
    completedSessions,
    fetchSessions,
    createSession,
    stopSession,
    fetchMetrics,
  }
}
