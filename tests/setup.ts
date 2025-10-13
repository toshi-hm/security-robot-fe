import { vi } from 'vitest'
import { ref } from 'vue'

// Global mocks for Nuxt auto-imports
;(global as any).useTraining = vi.fn(() => ({
  sessions: ref([]),
  fetchSessions: vi.fn(),
  isLoading: ref(false),
  currentSession: ref(null),
  createSession: vi.fn(),
  stopSession: vi.fn(),
  pauseSession: vi.fn(),
  resumeSession: vi.fn(),
}))
;(global as any).useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
}))
;(global as any).useRoute = vi.fn(() => ({
  params: {},
  query: {},
  path: '/',
}))
;(global as any).useRuntimeConfig = vi.fn(() => ({
  public: {
    apiBaseUrl: 'http://localhost:8000',
    wsUrl: 'ws://localhost:8000',
  },
}))
;(global as any).ElMessage = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
}
;(global as any).navigateTo = vi.fn()
;(global as any).useChart = vi.fn(() => ({
  canvas: ref(null),
  render: vi.fn(),
  destroy: vi.fn(),
  updateData: vi.fn(),
  replaceData: vi.fn(),
  clearData: vi.fn(),
  getChart: vi.fn(),
}))
