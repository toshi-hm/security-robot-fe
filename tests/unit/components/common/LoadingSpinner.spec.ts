import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import LoadingSpinner from '~/components/common/LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  const mountComponent = () => {
    return mount(LoadingSpinner, {
      global: {
        stubs: {
          'el-icon': {
            name: 'ElIcon',
            template: '<i class="el-icon"><slot /></i>',
          },
        },
      },
    })
  }
  describe('rendering', () => {
    it('renders loading spinner container', () => {
      const wrapper = mountComponent()

      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    })

    it('has proper accessibility attributes', () => {
      const wrapper = mountComponent()

      const container = wrapper.find('.loading-spinner')
      expect(container.attributes('role')).toBe('status')
      expect(container.attributes('aria-live')).toBe('polite')
    })

    it('contains spinner icon', () => {
      const wrapper = mountComponent()

      expect(wrapper.find('.spinner').exists()).toBe(true)
      expect(wrapper.find('.el-icon').exists()).toBe(true)
    })

    it('contains screen reader text', () => {
      const wrapper = mountComponent()

      const srText = wrapper.find('.sr-only')
      expect(srText.exists()).toBe(true)
      expect(srText.text()).toBe('Loading...')
    })
  })

  describe('styling', () => {
    it('has spinner animation class', () => {
      const wrapper = mountComponent()

      expect(wrapper.find('.spinner').classes()).toContain('spinner')
    })
  })
})
