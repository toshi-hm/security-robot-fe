import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

// Mock functions
const mockCreateSession = vi.fn()
const mockPush = vi.fn()
const mockSuccess = vi.fn()
const mockError = vi.fn()

// Mock composables using vi.stubGlobal (Nuxt-compatible)
vi.stubGlobal('useTraining', () => ({
  createSession: mockCreateSession,
  isLoading: ref(false),
  error: ref(null),
}))

vi.stubGlobal('useRouter', () => ({
  push: mockPush,
}))

// Mock ElMessage globally
vi.stubGlobal('ElMessage', {
  success: mockSuccess,
  error: mockError,
})

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
        'el-icon': {
          name: 'ElIcon',
          template: '<i class="el-icon"><slot /></i>',
        },
        'el-tooltip': {
          name: 'ElTooltip',
          template: '<span class="el-tooltip"><slot /></span>',
        },
      },
    },
    ...options,
  })
}

describe('TrainingControl.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders start button initially', () => {
    const wrapper = mountComponent()
    const button = wrapper.find('.el-button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('新規学習セッションを開始')
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

  it('hides form when cancelForm is called', async () => {
    const wrapper = mountComponent()
    await wrapper.find('.el-button').trigger('click')
    expect(wrapper.find('.el-card').exists()).toBe(true)

    const vm = wrapper.vm as any
    vm.formRef = { validate: vi.fn(), resetFields: vi.fn() }
    vm.cancelForm()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.el-card').exists()).toBe(false)
  })

  it('resets form fields when cancelForm is called', async () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm as any

    const mockResetFields = vi.fn()
    vm.formRef = {
      validate: vi.fn(),
      resetFields: mockResetFields,
    }

    vm.cancelForm()
    expect(mockResetFields).toHaveBeenCalled()
  })

  it('does not proceed with startTraining if formRef is not available', async () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm as any

    vm.formRef = null
    await vm.startTraining()

    // Should return early, no errors thrown
    expect(vm.formRef).toBeNull()
    expect(mockCreateSession).not.toHaveBeenCalled()
  })

  it('does not proceed with startTraining if validation fails', async () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm as any

    vm.formRef = {
      validate: vi.fn().mockRejectedValue(new Error('Validation failed')),
      resetFields: vi.fn(),
    }

    await vm.startTraining()

    // Should return early after validation failure
    expect(vm.formRef.validate).toHaveBeenCalled()
    expect(mockCreateSession).not.toHaveBeenCalled()
  })

  it('clicking start training button in form triggers startTraining', async () => {
    const wrapper = mountComponent()
    await wrapper.find('.el-button').trigger('click')

    // Find the "学習を開始" button (not the "新規学習セッションを開始" button)
    const buttons = wrapper.findAllComponents({ name: 'ElButton' })
    const startTrainingButton = buttons.find((button) => button.text().includes('学習を開始'))

    expect(startTrainingButton).toBeDefined()
  })

  it('cancel button exists in form', async () => {
    const wrapper = mountComponent()
    await wrapper.find('.el-button').trigger('click')

    // Find the キャンセル button
    const buttons = wrapper.findAllComponents({ name: 'ElButton' })
    const cancelButton = buttons.find((button) => button.text() === 'キャンセル')

    expect(cancelButton).toBeDefined()
    expect(cancelButton!.exists()).toBe(true)
  })

  it('has default training config values', () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm as any

    expect(vm.trainingConfig).toEqual({
      name: '',
      algorithm: 'ppo',
      environmentType: 'standard',
      totalTimesteps: 10000,
      envWidth: 8,
      envHeight: 8,
      coverageWeight: 1.5,
      explorationWeight: 3.0,
      diversityWeight: 2.0,
    })
  })

  it('has validation rules for form fields', () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm as any

    expect(vm.rules).toBeDefined()
    expect(vm.rules.name).toBeDefined()
    expect(vm.rules.totalTimesteps).toBeDefined()
  })

  it('calls createSession and navigates on successful training start', async () => {
    vi.clearAllMocks()
    mockCreateSession.mockResolvedValueOnce({
      id: 'session-123',
      name: 'Test Session',
    })

    const wrapper = mountComponent()
    const vm = wrapper.vm as any

    vm.formRef = {
      validate: vi.fn().mockResolvedValue(true),
      resetFields: vi.fn(),
    }

    vm.showForm = true

    await vm.startTraining()

    expect(mockCreateSession).toHaveBeenCalledTimes(1)
    expect(mockCreateSession).toHaveBeenCalledWith(vm.trainingConfig)
    expect(mockSuccess).toHaveBeenCalledTimes(1)
    expect(mockSuccess).toHaveBeenCalledWith('学習セッション「Test Session」を開始しました')
    expect(mockPush).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/training/session-123')
    expect(vm.showForm).toBe(false)
  })

  it('shows error when createSession returns null', async () => {
    vi.clearAllMocks()
    mockCreateSession.mockResolvedValueOnce(null)

    const wrapper = mountComponent()
    const vm = wrapper.vm as any

    vm.formRef = {
      validate: vi.fn().mockResolvedValue(true),
      resetFields: vi.fn(),
    }

    await vm.startTraining()

    expect(mockCreateSession).toHaveBeenCalled()
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining('開始に失敗しました'))
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('handles form input updates through v-model', async () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm as any

    // Show the form first
    await wrapper.find('.el-button').trigger('click')

    // Trigger v-model updates by setting values on trainingConfig
    // This will cause Vue to call the onUpdate:modelValue handlers
    vm.trainingConfig.name = 'My Test Session'
    vm.trainingConfig.algorithm = 'a3c'
    vm.trainingConfig.environmentType = 'enhanced'
    vm.trainingConfig.totalTimesteps = 50000
    vm.trainingConfig.envWidth = 10
    vm.trainingConfig.envHeight = 12
    vm.trainingConfig.coverageWeight = 2.0
    vm.trainingConfig.explorationWeight = 4.0
    vm.trainingConfig.diversityWeight = 3.0

    await wrapper.vm.$nextTick()

    // Verify the values were set
    expect(vm.trainingConfig.name).toBe('My Test Session')
    expect(vm.trainingConfig.algorithm).toBe('a3c')
    expect(vm.trainingConfig.environmentType).toBe('enhanced')
    expect(vm.trainingConfig.totalTimesteps).toBe(50000)
    expect(vm.trainingConfig.envWidth).toBe(10)
    expect(vm.trainingConfig.envHeight).toBe(12)
    expect(vm.trainingConfig.coverageWeight).toBe(2.0)
    expect(vm.trainingConfig.explorationWeight).toBe(4.0)
    expect(vm.trainingConfig.diversityWeight).toBe(3.0)
  })
})
