export const APP_TITLE = 'Security Robot RL Console'
export const DEFAULT_REFRESH_INTERVAL_MS = 1000

// Session Status Mapping
export interface SessionStatusConfig {
  text: string
  type: 'success' | 'warning' | 'info' | 'danger' | 'primary'
  color?: string
  textColor?: string
}

export const SESSION_STATUS_MAP: Record<string, SessionStatusConfig> = {
  running: { text: '実行中', type: 'success' },
  paused: { text: '一時停止', type: 'warning' },
  completed: { text: '完了', type: 'info' },
  failed: { text: '失敗', type: 'danger' },
  created: { text: '作成済み', type: 'info', color: '#cbd5e1', textColor: '#1f2937' },
  queued: { text: 'キュー中', type: 'primary' },
} as const

export type SessionStatus = keyof typeof SESSION_STATUS_MAP

// Patrol radius used for visualization (instructions Section 3.2: radius=2)
export const DEFAULT_PATROL_RADIUS = 2

// Template Agents input制約
export const TEMPLATE_AGENT_GRID_MIN = 3
export const TEMPLATE_AGENT_GRID_MAX = 100
export const TEMPLATE_AGENT_SEED_MIN = 0
export const TEMPLATE_AGENT_SEED_MAX = 999999
export const ROUTE_PREVIEW_LIMIT = 30
