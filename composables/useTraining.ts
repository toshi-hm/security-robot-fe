import { computed, ref } from 'vue'

import type { TrainingConfig } from '~/libs/domains/training/TrainingConfig'
import { type TrainingMetrics, TrainingMetrics as TrainingMetricsClass } from '~/libs/domains/training/TrainingMetrics'
import { type TrainingSession, TrainingSession as TrainingSessionClass } from '~/libs/domains/training/TrainingSession'
import { TrainingRepositoryImpl } from '~/libs/repositories/training/TrainingRepositoryImpl'

/**
 * 学習管理Composable
 *
 * リポジトリを使用してビジネスロジックを実装
 */
/**
 * シミュレーションモードかどうかを判定
 */
const isSimulationMode = () => {
  const config = useRuntimeConfig()
  return config.public.simulationMode === true
}

/**
 * ダミーセッションを作成
 */
const createDummySession = (config: TrainingConfig): TrainingSession => {
  const now = new Date()
  const sessionId = Date.now()

  return new TrainingSessionClass(
    sessionId,
    config.name,
    config.algorithm,
    config.environmentType,
    'running', // シミュレーションモードでは即座に running にする
    config.totalTimesteps,
    0,
    0,
    config.envWidth,
    config.envHeight,
    config.coverageWeight,
    config.explorationWeight,
    config.diversityWeight,
    null,
    null,
    now,
    now,
    null
  )
}

/**
 * ダミーメトリクスを生成
 */
let metricsSimulationInterval: NodeJS.Timeout | null = null

const startSimulatedMetrics = (session: TrainingSession) => {
  // 既存のシミュレーションをクリア
  if (metricsSimulationInterval) {
    clearInterval(metricsSimulationInterval)
  }

  let currentStep = 0
  const stepIncrement = Math.floor(session.totalTimesteps / 100) // 100回で完了

  metricsSimulationInterval = setInterval(() => {
    currentStep += stepIncrement

    if (currentStep >= session.totalTimesteps) {
      currentStep = session.totalTimesteps
      if (metricsSimulationInterval) {
        clearInterval(metricsSimulationInterval)
      }
    }

    // ランダムなメトリクスを生成
    const reward = Math.random() * 10 - 2 // -2 to 8
    const loss = Math.random() * 0.5 // 0 to 0.5
    const coverageRatio = Math.min(currentStep / session.totalTimesteps, 1)
    const explorationScore = Math.random() * 0.5 + 0.5 // 0.5 to 1.0

    const dummyMetrics = new TrainingMetricsClass(
      Date.now(),
      session.id,
      currentStep,
      Math.floor(currentStep / 1000),
      reward,
      loss,
      coverageRatio,
      explorationScore,
      new Date()
    )

    // WebSocketの代わりにログを出力（実際はWebSocketで送信する想定）
    console.log('Simulated metrics:', dummyMetrics)
  }, 2000) // 2秒ごとにメトリクスを生成
}

export const useTraining = () => {
  const repository = new TrainingRepositoryImpl()

  const sessions = ref<TrainingSession[]>([])
  const currentSession = ref<TrainingSession | null>(null)
  const metrics = ref<TrainingMetrics[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pollingIntervals = ref<Map<number, NodeJS.Timeout>>(new Map())

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

  /**
   * セッションのステータスをポーリングする
   * 'queued' 状態から 'running' または 'failed' に変わるまで監視
   */
  const startPollingSessionStatus = (sessionId: number) => {
    // 既存のポーリングがあればクリア
    stopPollingSessionStatus(sessionId)

    const pollInterval = setInterval(async () => {
      try {
        const session = await repository.findById(sessionId)

        if (session?.status === 'running') {
          // Worker が起動した!
          clearInterval(pollInterval)
          pollingIntervals.value.delete(sessionId)
          ElMessage.success('学習が開始されました')

          // セッションリストを更新
          await fetchSessions()

          // currentSessionも更新
          if (currentSession.value?.id === sessionId) {
            currentSession.value = session
          }
        } else if (session?.status === 'failed') {
          // セッション作成失敗
          clearInterval(pollInterval)
          pollingIntervals.value.delete(sessionId)
          ElMessage.error('セッション作成に失敗しました')

          // セッションリストを更新
          await fetchSessions()
        }
      } catch (err) {
        console.error('Failed to poll session status:', err)
        // エラーが発生してもポーリングは継続（一時的なネットワークエラーかもしれないため）
      }
    }, 2000) // 2秒ごとに確認

    pollingIntervals.value.set(sessionId, pollInterval)
  }

  /**
   * 特定セッションのポーリングを停止
   */
  const stopPollingSessionStatus = (sessionId: number) => {
    const interval = pollingIntervals.value.get(sessionId)
    if (interval) {
      clearInterval(interval)
      pollingIntervals.value.delete(sessionId)
    }
  }

  /**
   * すべてのポーリングを停止（クリーンアップ用）
   */
  const stopAllPolling = () => {
    pollingIntervals.value.forEach((interval) => clearInterval(interval))
    pollingIntervals.value.clear()
  }

  const createSession = async (config: TrainingConfig): Promise<TrainingSession | null> => {
    isLoading.value = true
    error.value = null

    try {
      // シミュレーションモードの場合、ダミーセッションを返す
      if (isSimulationMode()) {
        const dummySession = createDummySession(config)
        sessions.value.push(dummySession)
        currentSession.value = dummySession

        // ダミーメトリクスを生成して配信
        startSimulatedMetrics(dummySession)

        // 成功メッセージ
        ElMessage.success('シミュレーションモード: 学習セッションを開始しました')

        return dummySession
      }

      // 通常のAPI呼び出し
      const newSession = await repository.create(config)
      sessions.value.push(newSession)
      currentSession.value = newSession

      // セッションが 'queued' 状態の場合、ポーリングを開始
      if (newSession.status === 'queued') {
        startPollingSessionStatus(newSession.id)
      }

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
    startPollingSessionStatus,
    stopPollingSessionStatus,
    stopAllPolling,
  }
}
