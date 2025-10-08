import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import SettingsIndexPage from '~/pages/settings/index.vue'

describe('Settings Index Page', () => {
  it('renders the page', () => {
    const wrapper = mount(SettingsIndexPage)

    expect(wrapper.find('h2').exists()).toBe(true)
  })

  it('displays the page title', () => {
    const wrapper = mount(SettingsIndexPage)

    expect(wrapper.find('h2').text()).toBe('Settings')
  })

  it('displays instructions', () => {
    const wrapper = mount(SettingsIndexPage)
    const text = wrapper.text()

    expect(text).toContain('Select a category')
    expect(text).toContain('sidebar')
  })

  it('has correct structure', () => {
    const wrapper = mount(SettingsIndexPage)

    expect(wrapper.find('div').exists()).toBe(true)
    expect(wrapper.find('p').exists()).toBe(true)
  })
})
