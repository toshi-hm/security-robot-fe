export const APP_TITLE = 'Security Robot RL Console'
export const DEFAULT_REFRESH_INTERVAL_MS = 1000

// Session Status Mapping
export const SESSION_STATUS_MAP = {
  running: { text: '実行中', type: 'success' },
  paused: { text: '一時停止', type: 'warning' },
  completed: { text: '完了', type: 'info' },
  failed: { text: '失敗', type: 'danger' },
  created: { text: '作成済み', type: 'info' },
  queued: { text: 'キュー中', type: 'info' },
} as const

export type SessionStatus = keyof typeof SESSION_STATUS_MAP

// Patrol radius used for visualization (instructions Section 3.2: radius=2)
export const DEFAULT_PATROL_RADIUS = 2
