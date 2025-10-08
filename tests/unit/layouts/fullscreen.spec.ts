import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FullscreenLayout from '~/layouts/fullscreen.vue'

describe('Fullscreen Layout', () => {
  it('renders the layout', () => {
    const wrapper = mount(FullscreenLayout)

    expect(wrapper.find('.layout-fullscreen').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mount(FullscreenLayout, {
      slots: {
        default: '<div class="test-content">Test Content</div>'
      }
    })

    expect(wrapper.find('.test-content').exists()).toBe(true)
    expect(wrapper.text()).toBe('Test Content')
  })

  it('has fullscreen styling', () => {
    const wrapper = mount(FullscreenLayout)
    const layout = wrapper.find('.layout-fullscreen')

    expect(layout.exists()).toBe(true)
  })

  it('is a simple container without navigation', () => {
    const wrapper = mount(FullscreenLayout)

    // Should not have sidebar or header
    expect(wrapper.find('.sidebar').exists()).toBe(false)
    expect(wrapper.find('header').exists()).toBe(false)
  })

  it('passes through slot content directly', () => {
    const slotContent = '<p class="custom">Custom Page Content</p>'
    const wrapper = mount(FullscreenLayout, {
      slots: {
        default: slotContent
      }
    })

    expect(wrapper.find('.custom').exists()).toBe(true)
    expect(wrapper.text()).toContain('Custom Page Content')
  })
})
