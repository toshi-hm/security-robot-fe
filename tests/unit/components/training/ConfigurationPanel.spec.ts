import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import ConfigurationPanel from '~/components/training/ConfigurationPanel.vue'

// Element Plus form component stub
const ElFormStub = {
  name: 'ElForm',
  template: '<form class="el-form"><slot /></form>',
  props: ['labelPosition'],
}

describe('ConfigurationPanel', () => {
  it('renders the form element', () => {
    const wrapper = mount(ConfigurationPanel, {
      global: {
        stubs: {
          ElForm: ElFormStub,
        },
      },
    })

    expect(wrapper.find('.el-form').exists()).toBe(true)
  })

  it('uses top label position', () => {
    const wrapper = mount(ConfigurationPanel, {
      global: {
        stubs: {
          ElForm: ElFormStub,
        },
      },
    })

    const form = wrapper.findComponent(ElFormStub)
    expect(form.props('labelPosition')).toBe('top')
  })

  it('has correct styling class', () => {
    const wrapper = mount(ConfigurationPanel, {
      global: {
        stubs: {
          ElForm: ElFormStub,
        },
      },
    })

    expect(wrapper.find('.configuration-panel').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mount(ConfigurationPanel, {
      global: {
        stubs: {
          ElForm: ElFormStub,
        },
      },
      slots: {
        default: '<div class="test-content">Test Content</div>',
      },
    })

    expect(wrapper.find('.test-content').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Content')
  })

  it('passes through slot content to ElForm', () => {
    const slotContent = '<p class="custom-field">Custom Field</p>'
    const wrapper = mount(ConfigurationPanel, {
      global: {
        stubs: {
          ElForm: ElFormStub,
        },
      },
      slots: {
        default: slotContent,
      },
    })

    const form = wrapper.findComponent(ElFormStub)
    expect(form.find('.custom-field').exists()).toBe(true)
  })
})
