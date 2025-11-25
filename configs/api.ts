/**
 * APIエンドポイント定義
 *
 * すべてのエンドポイントURLを一元管理するための関数です。
 * Nuxt の公開環境変数 (NUXT_PUBLIC_*) を利用してベースURLを切り替えます。
 *
 * バックエンドAPI実装に基づいて定義
 * Backend repository: ../security-robot-be/
 */

// ========================================
// キャッシュ機構
// ========================================
/**
 * エンドポイントのキャッシュ
 * プラグインで初期化時に1回だけ設定され、以降は再利用される
 */
let cachedApiEndpoints: ReturnType<typeof useApiEndpoints> | null = null
let cachedWsEndpoints: ReturnType<typeof useWsEndpoints> | null = null

/**
 * キャッシュを設定（プラグインから呼び出される）
 */
export const setApiEndpointsCache = (endpoints: ReturnType<typeof useApiEndpoints>) => {
  cachedApiEndpoints = endpoints
}

export const setWsEndpointsCache = (endpoints: ReturnType<typeof useWsEndpoints>) => {
  cachedWsEndpoints = endpoints
}

/**
 * キャッシュを取得（後方互換性のためのAPI_ENDPOINTS等から呼び出される）
 *
 * Lazy initialization: キャッシュが未初期化の場合は自動的に初期化します。
 * これにより、以下の問題を解決します：
 * 1. プラグイン読み込み順序に依存しない
 * 2. テスト環境でも自動的に動作
 * 3. SSRモードへの移行時も動作
 */
export const getApiEndpointsCache = () => {
  if (!cachedApiEndpoints) {
    // プラグインで初期化されていない場合は自動的に初期化
    // 通常はプラグインで初期化されるため、この分岐は稀
    cachedApiEndpoints = useApiEndpoints()
  }
  return cachedApiEndpoints
}

export const getWsEndpointsCache = () => {
  if (!cachedWsEndpoints) {
    // プラグインで初期化されていない場合は自動的に初期化
    cachedWsEndpoints = useWsEndpoints()
  }
  return cachedWsEndpoints
}

// ========================================
// エンドポイント生成関数
// ========================================
/**
 * API_ENDPOINTSを取得する関数
 * Nuxt 3のSPAモードでは、process.envはビルド時にのみ評価されるため、
 * 実行時に環境変数を読み込むにはuseRuntimeConfig()を使用する必要があります。
 *
 * 注意: この関数は通常、プラグインから1回だけ呼び出されます。
 * アプリケーションコードからは getApiEndpointsCache() またはAPI_ENDPOINTSを使用してください。
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
      sessions: `${API_BASE_URL}/api/v1/environment/sessions`, // POST - create new session
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

    // Template Agents API (Session 056)
    templateAgents: {
      types: `${API_BASE_URL}/api/v1/template-agents/types`, // GET - list all agent types
      execute: `${API_BASE_URL}/api/v1/template-agents/execute`, // POST - execute single agent
      compare: `${API_BASE_URL}/api/v1/template-agents/compare`, // POST - compare multiple agents
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

// ========================================
// 後方互換性エクスポート
// ========================================
/**
 * 後方互換性のための定数エクスポート
 * キャッシュから取得するため、パフォーマンス問題なし
 *
 * 新しいコードでは getApiEndpointsCache() の直接使用を推奨
 * @deprecated Use getApiEndpointsCache() instead
 */
export const API_ENDPOINTS = {
  get health() {
    return getApiEndpointsCache().health
  },
  get training() {
    return getApiEndpointsCache().training
  },
  get environment() {
    return getApiEndpointsCache().environment
  },
  get files() {
    return getApiEndpointsCache().files
  },
  get playback() {
    return getApiEndpointsCache().playback
  },
  get templateAgents() {
    return getApiEndpointsCache().templateAgents
  },
}

/**
 * @deprecated Use getWsEndpointsCache() instead
 */
export const WS_ENDPOINTS = {
  get training() {
    return getWsEndpointsCache().training
  },
}
