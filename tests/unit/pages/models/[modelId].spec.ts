import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModelDetailPage from '~/pages/models/[modelId].vue'

// Mock useRoute globally
const mockRoute = {
  params: {
    modelId: 'test-model-123'
  }
}

vi.stubGlobal('useRoute', () => mockRoute)

describe('Model Detail Page', () => {
  it('renders the page', () => {
    const wrapper = mount(ModelDetailPage)

    expect(wrapper.find('.model-detail').exists()).toBe(true)
  })

  it('displays the model ID in title', () => {
    const wrapper = mount(ModelDetailPage)
    const title = wrapper.find('.model-detail__title')

    expect(title.text()).toContain('test-model-123')
    expect(title.text()).toContain('モデル詳細')
  })

  it('displays the description text', () => {
    const wrapper = mount(ModelDetailPage)
    const description = wrapper.find('.model-detail__description')

    expect(description.exists()).toBe(true)
    expect(description.text()).toContain('個別モデルの評価メトリクス')
  })

  it('has correct BEM structure', () => {
    const wrapper = mount(ModelDetailPage)

    expect(wrapper.find('.model-detail').exists()).toBe(true)
    expect(wrapper.find('.model-detail__title').exists()).toBe(true)
    expect(wrapper.find('.model-detail__description').exists()).toBe(true)
  })
})
