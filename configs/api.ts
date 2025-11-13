/**
 * APIエンドポイント定義
 *
 * すべてのエンドポイントURLを一元管理するための関数です。
 * Nuxt の公開環境変数 (NUXT_PUBLIC_*) を利用してベースURLを切り替えます。
 *
 * バックエンドAPI実装に基づいて定義
 * Backend repository: ../security-robot-be/
 */

/**
 * API_ENDPOINTSを取得する関数
 * Nuxt 3のSPAモードでは、process.envはビルド時にのみ評価されるため、
 * 実行時に環境変数を読み込むにはuseRuntimeConfig()を使用する必要があります。
 */
export const useApiEndpoints = () => {
  const runtimeConfig = useRuntimeConfig()
  const API_BASE_URL = runtimeConfig.public.apiBaseUrl

  return {
    // Health check
    health: `${API_BASE_URL}/api/v1/health/`,

    // Training API
    training: {
      list: `${API_BASE_URL}/api/v1/training/list`, // GET with pagination (page, page_size)
      start: `${API_BASE_URL}/api/v1/training/start`, // POST
      stop: (sessionId: number) => `${API_BASE_URL}/api/v1/training/${sessionId}/stop`, // POST
      pause: (sessionId: number) => `${API_BASE_URL}/api/v1/training/${sessionId}/pause`, // POST
      resume: (sessionId: number) => `${API_BASE_URL}/api/v1/training/${sessionId}/resume`, // POST
      status: (sessionId: number) => `${API_BASE_URL}/api/v1/training/${sessionId}/status`, // GET
      delete: (sessionId: number) => `${API_BASE_URL}/api/v1/training/${sessionId}`, // DELETE
      metrics: (sessionId: number) => `${API_BASE_URL}/api/v1/training/sessions/${sessionId}/metrics`, // GET with pagination
    },

    // Environment API
    environment: {
      definitions: `${API_BASE_URL}/api/v1/environment/definitions`, // GET - list all environments
      state: (environmentId: string) => `${API_BASE_URL}/api/v1/environment/definitions/${environmentId}/state`, // GET
    },

    // Files API (used for models/logs/config files)
    files: {
      list: `${API_BASE_URL}/api/v1/files/list`, // GET with pagination
      upload: `${API_BASE_URL}/api/v1/files/`, // POST (multipart/form-data)
      metadata: (fileId: number) => `${API_BASE_URL}/api/v1/files/${fileId}`, // GET
      download: (fileId: number) => `${API_BASE_URL}/api/v1/files/${fileId}/download`, // GET
      delete: (fileId: number) => `${API_BASE_URL}/api/v1/files/${fileId}`, // DELETE
    },

    // Playback API
    playback: {
      sessions: `${API_BASE_URL}/api/v1/playback/sessions`, // GET with pagination (page, page_size)
      frames: (sessionId: number) => `${API_BASE_URL}/api/v1/playback/${sessionId}/frames`, // GET with pagination
    },
  } as const
}

/**
 * WebSocketエンドポイントを取得する関数
 */
export const useWsEndpoints = () => {
  const runtimeConfig = useRuntimeConfig()
  const WS_URL = runtimeConfig.public.wsUrl

  return {
    training: `${WS_URL}/api/v1/ws/training`, // WebSocket for training updates
  } as const
}

/**
 * 後方互換性のための定数エクスポート（非推奨）
 * 新しいコードでは useApiEndpoints() と useWsEndpoints() を使用してください
 * @deprecated Use useApiEndpoints() instead
 */
export const API_ENDPOINTS = {
  get health() {
    return useApiEndpoints().health
  },
  get training() {
    return useApiEndpoints().training
  },
  get environment() {
    return useApiEndpoints().environment
  },
  get files() {
    return useApiEndpoints().files
  },
  get playback() {
    return useApiEndpoints().playback
  },
}

/**
 * @deprecated Use useWsEndpoints() instead
 */
export const WS_ENDPOINTS = {
  get training() {
    return useWsEndpoints().training
  },
}
