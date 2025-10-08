import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import AppSidebar from '~/components/common/AppSidebar.vue'

const mountComponent = (slots = {}) => {
  return mount(AppSidebar, {
    slots,
  })
}

describe('AppSidebar', () => {
  it('renders the sidebar element', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.app-sidebar').exists()).toBe(true)
  })

  it('uses semantic HTML aside element', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('aside').exists()).toBe(true)
  })

  it('contains a nav element', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('nav').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const slotContent = '<div class="test-slot">Test Navigation</div>'
    const wrapper = mountComponent({
      default: slotContent,
    })
    expect(wrapper.find('.test-slot').exists()).toBe(true)
    expect(wrapper.find('.test-slot').text()).toBe('Test Navigation')
  })

  it('has correct styling classes', () => {
    const wrapper = mountComponent()
    const sidebar = wrapper.find('.app-sidebar')
    expect(sidebar.exists()).toBe(true)
  })
})
