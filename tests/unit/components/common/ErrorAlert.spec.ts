import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorAlert from '~/components/common/ErrorAlert.vue'

describe('ErrorAlert', () => {
  const mountComponent = (props = {}) => {
    return mount(ErrorAlert, {
      props,
      global: {
        stubs: {
          'el-alert': {
            name: 'ElAlert',
            template: '<div class="el-alert el-alert--error"><div class="el-alert__content">{{ title }}<div class="el-alert__icon"></div></div></div>',
            props: ['title', 'type', 'showIcon'],
          },
        },
      },
    })
  }
  describe('with message prop', () => {
    it('renders alert when message is provided', () => {
      const wrapper = mountComponent({
        message: 'Test error message',
      })

      expect(wrapper.find('.el-alert').exists()).toBe(true)
      expect(wrapper.text()).toContain('Test error message')
    })

    it('displays error type alert', () => {
      const wrapper = mountComponent({
        message: 'Error occurred',
      })

      const alert = wrapper.find('.el-alert')
      expect(alert.classes()).toContain('el-alert--error')
    })

    it('shows icon in alert', () => {
      const wrapper = mountComponent({
        message: 'Error',
      })

      expect(wrapper.find('.el-alert__icon').exists()).toBe(true)
    })
  })

  describe('without message prop', () => {
    it('does not render alert when message is undefined', () => {
      const wrapper = mountComponent()

      expect(wrapper.find('.el-alert').exists()).toBe(false)
    })

    it('does not render alert when message is empty string', () => {
      const wrapper = mountComponent({
        message: '',
      })

      expect(wrapper.find('.el-alert').exists()).toBe(false)
    })
  })
})
