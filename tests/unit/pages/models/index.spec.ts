import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModelsIndexPage from '~/pages/models/index.vue'

describe('Models Index Page', () => {
  it('renders the page', () => {
    const wrapper = mount(ModelsIndexPage)

    expect(wrapper.find('section.models').exists()).toBe(true)
  })

  it('displays the page title', () => {
    const wrapper = mount(ModelsIndexPage)

    expect(wrapper.find('.models__title').text()).toBe('モデル管理')
  })

  it('displays description text', () => {
    const wrapper = mount(ModelsIndexPage)
    const description = wrapper.find('.models__description')

    expect(description.exists()).toBe(true)
    expect(description.text()).toContain('訓練済みモデル')
    expect(description.text()).toContain('今後の実装')
  })

  it('has correct BEM structure', () => {
    const wrapper = mount(ModelsIndexPage)

    expect(wrapper.find('.models').exists()).toBe(true)
    expect(wrapper.find('.models__title').exists()).toBe(true)
    expect(wrapper.find('.models__description').exists()).toBe(true)
  })
})
