import { vi } from 'vitest'

export const ElMessage = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  closeAll: vi.fn(),
}

export const ElMessageBox = {
  alert: vi.fn(),
  confirm: vi.fn(),
  prompt: vi.fn(),
}

export const ElNotification = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
}

// Mock all Element Plus components
export default {
  ElMessage,
  ElMessageBox,
  ElNotification,
}
