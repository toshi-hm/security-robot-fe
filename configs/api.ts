/**
 * APIエンドポイント定義
 *
 * すべてのエンドポイントURLを一元管理するための定数です。
 * Nuxt の公開環境変数 (NUXT_PUBLIC_*) を利用してベースURLを切り替えます。
 *
 * バックエンドAPI実装に基づいて定義
 * Backend repository: ../security-robot-be/
 */
const API_BASE_URL = process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
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
    state: (environmentId: string) =>
      `${API_BASE_URL}/api/v1/environment/definitions/${environmentId}/state`, // GET
  },

  // Files API (used for models/logs/config files)
  files: {
    list: `${API_BASE_URL}/api/v1/files/list`, // GET with pagination
    upload: `${API_BASE_URL}/api/v1/files/`, // POST (multipart/form-data)
    metadata: (fileId: number) => `${API_BASE_URL}/api/v1/files/${fileId}`, // GET
    download: (fileId: number) => `${API_BASE_URL}/api/v1/files/${fileId}/download`, // GET
    delete: (fileId: number) => `${API_BASE_URL}/api/v1/files/${fileId}`, // DELETE
  },
} as const

// WebSocket endpoints
export const WS_URL = process.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:8000'

export const WS_ENDPOINTS = {
  training: `${WS_URL}/api/v1/ws/training`, // WebSocket for training updates
} as const
