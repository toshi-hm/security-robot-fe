import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'

import TrainingControl from '~/components/training/TrainingControl.vue'

const mountComponent = (options = {}) => {
  return mount(TrainingControl, {
    global: {
      stubs: {
        'el-card': {
          name: 'ElCard',
          template: '<div class="el-card"><slot name="header" /><slot /></div>',
        },
        'el-button': {
          name: 'ElButton',
          template:
            '<button class="el-button" :type="type" :loading="loading" @click="$emit(\'click\')"><slot /></button>',
          props: ['type', 'loading', 'size', 'icon'],
        },
        'el-form': {
          name: 'ElForm',
          template: '<form class="el-form"><slot /></form>',
        },
        'el-form-item': {
          name: 'ElFormItem',
          template: '<div class="el-form-item"><slot /></div>',
        },
        'el-input': {
          name: 'ElInput',
          template: '<input class="el-input" />',
        },
        'el-input-number': {
          name: 'ElInputNumber',
          template: '<input type="number" class="el-input-number" />',
        },
        'el-select': {
          name: 'ElSelect',
          template: '<select class="el-select"><slot /></select>',
        },
        'el-option': {
          name: 'ElOption',
          template: '<option class="el-option"><slot /></option>',
        },
        'el-row': {
          name: 'ElRow',
          template: '<div class="el-row"><slot /></div>',
        },
        'el-col': {
          name: 'ElCol',
          template: '<div class="el-col"><slot /></div>',
        },
        'el-divider': {
          name: 'ElDivider',
          template: '<div class="el-divider"><slot /></div>',
        },
      },
      mocks: {
        useTraining: () => ({
          createSession: vi.fn(),
          isLoading: ref(false),
        }),
        useRouter: () => ({
          push: vi.fn(),
        }),
        ElMessage: {
          success: vi.fn(),
          error: vi.fn(),
        },
      },
    },
    ...options,
  })
}

describe('TrainingControl.vue', () => {
  it('renders start button initially', () => {
    const wrapper = mountComponent()
    const button = wrapper.find('.el-button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('Start New Training Session')
  })

  it('shows form when start button is clicked', async () => {
    const wrapper = mountComponent()
    const button = wrapper.find('.el-button')
    await button.trigger('click')
    expect(wrapper.find('.el-card').exists()).toBe(true)
    expect(wrapper.find('.el-form').exists()).toBe(true)
  })

  it('renders all form fields', async () => {
    const wrapper = mountComponent()
    await wrapper.find('.el-button').trigger('click')

    expect(wrapper.findAll('.el-form-item').length).toBeGreaterThan(0)
    expect(wrapper.find('.el-input').exists()).toBe(true)
    expect(wrapper.find('.el-select').exists()).toBe(true)
  })

  it('has start training and cancel buttons in form', async () => {
    const wrapper = mountComponent()
    await wrapper.find('.el-button').trigger('click')

    const buttons = wrapper.findAllComponents({ name: 'ElButton' })
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('renders el-card when form is shown', async () => {
    const wrapper = mountComponent()
    await wrapper.find('.el-button').trigger('click')

    expect(wrapper.find('.el-card').exists()).toBe(true)
  })
})
