import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TrainingProgress from '~/components/training/TrainingProgress.vue'

const mountComponent = (props = {}) => {
  return mount(TrainingProgress, {
    props: {
      progress: 0.5,
      ...props,
    },
    global: {
      stubs: {
        'el-progress': {
          name: 'ElProgress',
          template: '<div class="el-progress" :data-percentage="percentage" :data-status="status"></div>',
          props: ['percentage', 'status'],
        },
      },
    },
  })
}

describe('TrainingProgress.vue', () => {
  it('renders el-progress component', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.el-progress').exists()).toBe(true)
  })

  it('converts decimal progress to percentage', () => {
    const wrapper = mountComponent({ progress: 0.75 })
    const progress = wrapper.findComponent({ name: 'ElProgress' })
    expect(progress.props('percentage')).toBe(75)
  })

  it('rounds percentage to nearest integer', () => {
    const wrapper = mountComponent({ progress: 0.567 })
    const progress = wrapper.findComponent({ name: 'ElProgress' })
    expect(progress.props('percentage')).toBe(57)
  })

  it('passes status prop to el-progress', () => {
    const wrapper = mountComponent({ progress: 0.8, status: 'success' })
    const progress = wrapper.findComponent({ name: 'ElProgress' })
    expect(progress.props('status')).toBe('success')
  })

  it('handles zero progress', () => {
    const wrapper = mountComponent({ progress: 0 })
    const progress = wrapper.findComponent({ name: 'ElProgress' })
    expect(progress.props('percentage')).toBe(0)
  })

  it('handles complete progress', () => {
    const wrapper = mountComponent({ progress: 1.0 })
    const progress = wrapper.findComponent({ name: 'ElProgress' })
    expect(progress.props('percentage')).toBe(100)
  })
})
