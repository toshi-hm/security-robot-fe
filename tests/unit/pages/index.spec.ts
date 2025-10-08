import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import IndexPage from '~/pages/index.vue'

describe('Index Page', () => {
  it('renders the page', () => {
    const wrapper = mount(IndexPage)

    expect(wrapper.find('h2').exists()).toBe(true)
  })

  it('displays the dashboard title', () => {
    const wrapper = mount(IndexPage)

    expect(wrapper.find('h2').text()).toBe('Security Robot RL Dashboard')
  })

  it('displays navigation instructions', () => {
    const wrapper = mount(IndexPage)
    const text = wrapper.text()

    expect(text).toContain('Use the navigation menu')
    expect(text).toContain('training sessions')
    expect(text).toContain('playback runs')
    expect(text).toContain('models')
  })

  it('has correct structure', () => {
    const wrapper = mount(IndexPage)

    expect(wrapper.find('div').exists()).toBe(true)
    expect(wrapper.find('p').exists()).toBe(true)
  })
})
