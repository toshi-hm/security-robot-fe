import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import TrainingControl from '~/components/training/TrainingControl.vue'

const mountComponent = (options = {}) => {
  return mount(TrainingControl, {
    global: {
      stubs: {
        'el-card': {
          name: 'ElCard',
          template: '<div class="el-card"><slot /></div>',
        },
        'el-button': {
          name: 'ElButton',
          template: '<button class="el-button" :type="type" @click="$emit(\'click\')"><slot /></button>',
          props: ['type'],
        },
      },
    },
    ...options,
  })
}

describe('TrainingControl.vue', () => {
  it('renders el-card container', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.el-card').exists()).toBe(true)
  })

  it('renders Start Training button', () => {
    const wrapper = mountComponent()
    const button = wrapper.find('.el-button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Start Training')
  })

  it('button has primary type', () => {
    const wrapper = mountComponent()
    const button = wrapper.findComponent({ name: 'ElButton' })
    expect(button.props('type')).toBe('primary')
  })

  it('emits start event when button is clicked', async () => {
    const wrapper = mountComponent()
    const button = wrapper.find('.el-button')
    await button.trigger('click')
    expect(wrapper.emitted('start')).toBeTruthy()
    expect(wrapper.emitted('start')?.length).toBeGreaterThanOrEqual(1)
  })

  it('renders form slot content', () => {
    const wrapper = mountComponent({
      slots: {
        form: '<div class="test-form">Test Form Content</div>',
      },
    })
    expect(wrapper.find('.test-form').exists()).toBe(true)
    expect(wrapper.find('.test-form').text()).toBe('Test Form Content')
  })
})
