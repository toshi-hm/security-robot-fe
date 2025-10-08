import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import TrainingSettingsPage from '~/pages/settings/training.vue'

describe('Training Settings Page', () => {
  it('renders the page', () => {
    const wrapper = mount(TrainingSettingsPage)

    expect(wrapper.find('h2').exists()).toBe(true)
  })

  it('displays the page title', () => {
    const wrapper = mount(TrainingSettingsPage)

    expect(wrapper.find('h2').text()).toBe('Training Settings')
  })

  it('displays configuration instructions', () => {
    const wrapper = mount(TrainingSettingsPage)
    const text = wrapper.text()

    expect(text).toContain('Adjust default reinforcement learning parameters')
  })

  it('has correct structure', () => {
    const wrapper = mount(TrainingSettingsPage)

    expect(wrapper.find('div').exists()).toBe(true)
    expect(wrapper.find('p').exists()).toBe(true)
  })
})
