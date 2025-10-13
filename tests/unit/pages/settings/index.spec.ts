import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'

import SettingsIndexPage from '~/pages/settings/index.vue'

// Mock Nuxt auto-imports
vi.stubGlobal('definePageMeta', vi.fn())
vi.stubGlobal('navigateTo', vi.fn())
vi.stubGlobal('onMounted', vi.fn())

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

describe('Settings Index Page', () => {
  const createWrapper = () => {
    return mount(SettingsIndexPage, {
      global: {
        stubs: {
          'el-card': {
            template: '<div><slot name="header"></slot><slot></slot></div>',
          },
          'el-row': {
            template: '<div><slot></slot></div>',
          },
          'el-col': {
            template: '<div><slot></slot></div>',
          },
          'el-button': {
            template: '<button><slot></slot></button>',
          },
          'el-divider': {
            template: '<hr />',
          },
          'el-descriptions': {
            template: '<div><slot></slot></div>',
          },
          'el-descriptions-item': {
            template: '<div><slot></slot></div>',
          },
          'el-tag': {
            template: '<span><slot></slot></span>',
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

    expect(wrapper.find('h2').text()).toBe('設定')
  })

  it('displays instructions', () => {
    const wrapper = createWrapper()
    const text = wrapper.text()

    expect(text).toContain('サイドバーからカテゴリを選択')
    expect(text).toContain('学習と環境シミュレーション')
  })

  it('has correct structure', () => {
    const wrapper = createWrapper()

    expect(wrapper.find('div').exists()).toBe(true)
    expect(wrapper.find('p').exists()).toBe(true)
  })
})
