import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'

import TrainingSettingsPage from '~/pages/settings/training.vue'

// Mock Nuxt auto-imports
vi.stubGlobal('definePageMeta', vi.fn())
vi.stubGlobal('onMounted', vi.fn())
vi.stubGlobal('navigateTo', vi.fn())

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

describe('Training Settings Page', () => {
  const createWrapper = () => {
    return mount(TrainingSettingsPage, {
      global: {
        stubs: {
          'el-card': {
            template: '<div><slot name="header"></slot><slot></slot></div>',
          },
          'el-form': {
            template: '<form><slot></slot></form>',
          },
          'el-form-item': {
            template: '<div><slot></slot></div>',
          },
          'el-input-number': {
            template: '<input type="number" />',
          },
          'el-radio-group': {
            template: '<div><slot></slot></div>',
          },
          'el-radio': {
            template: '<input type="radio" />',
          },
          'el-select': {
            template: '<select><slot></slot></select>',
          },
          'el-option': {
            template: '<option></option>',
          },
          'el-slider': {
            template: '<input type="range" />',
          },
          'el-button': {
            template: '<button><slot></slot></button>',
          },
          'el-divider': {
            template: '<hr />',
          },
          'el-space': {
            template: '<div><slot></slot></div>',
          },
        },
      },
    })
  }

  it('renders the page', () => {
    const wrapper = createWrapper()

    expect(wrapper.find('h2').exists()).toBe(true)
  })

  it('displays the page title', () => {
    const wrapper = createWrapper()

    expect(wrapper.find('h2').text()).toBe('学習設定')
  })

  it('displays configuration instructions', () => {
    const wrapper = createWrapper()
    const text = wrapper.text()

    expect(text).toContain('強化学習のデフォルトパラメータを調整')
  })

  it('has correct structure', () => {
    const wrapper = createWrapper()

    expect(wrapper.find('div').exists()).toBe(true)
    expect(wrapper.find('p').exists()).toBe(true)
  })
})
