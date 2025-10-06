/**
 * APIエンドポイント定義
 *
 * すべてのエンドポイントURLを一元管理するための定数です。
 * Nuxt の公開環境変数 (NUXT_PUBLIC_*) を利用してベースURLを切り替えます。
 */
const API_BASE_URL = process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  training: {
    sessions: `${API_BASE_URL}/api/v1/training/sessions`,
    start: `${API_BASE_URL}/api/v1/training/start`,
    stop: (id: number) => `${API_BASE_URL}/api/v1/training/${id}/stop`,
    status: (id: number) => `${API_BASE_URL}/api/v1/training/${id}/status`,
    metrics: (id: number) => `${API_BASE_URL}/api/v1/training/${id}/metrics`,
    configure: (id: number) => `${API_BASE_URL}/api/v1/training/${id}/configure`,
  },
  environment: {
    state: `${API_BASE_URL}/api/v1/environment/state`,
    config: `${API_BASE_URL}/api/v1/environment/config`,
    reset: `${API_BASE_URL}/api/v1/environment/reset`,
    action: `${API_BASE_URL}/api/v1/environment/action`,
  },
  playback: {
    sessions: `${API_BASE_URL}/api/v1/playback/sessions`,
    data: (id: number) => `${API_BASE_URL}/api/v1/playback/${id}/data`,
  },
  models: {
    list: `${API_BASE_URL}/api/v1/models`,
    upload: `${API_BASE_URL}/api/v1/models/upload`,
    download: (filename: string) => `${API_BASE_URL}/api/v1/models/${filename}`,
  },
} as const

export const WS_URL = process.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:8000'
