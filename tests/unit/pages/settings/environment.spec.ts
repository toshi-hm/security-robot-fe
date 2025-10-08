import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EnvironmentSettingsPage from '~/pages/settings/environment.vue'

describe('Environment Settings Page', () => {
  it('renders the page', () => {
    const wrapper = mount(EnvironmentSettingsPage)

    expect(wrapper.find('h2').exists()).toBe(true)
  })

  it('displays the page title', () => {
    const wrapper = mount(EnvironmentSettingsPage)

    expect(wrapper.find('h2').text()).toBe('Environment Settings')
  })

  it('displays configuration instructions', () => {
    const wrapper = mount(EnvironmentSettingsPage)
    const text = wrapper.text()

    expect(text).toContain('Configure simulation environments')
  })

  it('has correct structure', () => {
    const wrapper = mount(EnvironmentSettingsPage)

    expect(wrapper.find('div').exists()).toBe(true)
    expect(wrapper.find('p').exists()).toBe(true)
  })
})
