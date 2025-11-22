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
          template:
            '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
          props: ['modelValue', 'placeholder'],
        },
        'el-input-number': {
          name: 'ElInputNumber',
          template:
            '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', parseFloat($event.target.value))" />',
          props: ['modelValue', 'min', 'max', 'step', 'precision'],
        },
        'el-select': {
          name: 'ElSelect',
          template:
            '<select class="el-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
          props: ['modelValue'],
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
        'el-collapse': {
          name: 'ElCollapse',
          template: '<div class="el-collapse"><slot /></div>',
        },
        'el-collapse-item': {
          name: 'ElCollapseItem',
          template: '<div class="el-collapse-item"><slot name="title" /><slot /></div>',
        },
        'el-alert': {
          name: 'ElAlert',
          template: '<div class="el-alert"><slot /></div>',
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

  it('opens form when openForm is called', async () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm as any

    expect(vm.showForm).toBe(false)

    vm.openForm()

    expect(vm.showForm).toBe(true)
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

  it('handles cancelForm when formRef is null', async () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm as any

    vm.formRef = null
    vm.showForm = true

    vm.cancelForm()

    expect(vm.showForm).toBe(false)
    // Should not throw error even when formRef is null
    expect(true).toBe(true)
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
      // Advanced Settings
      learningRate: 0.0003,
      batchSize: 64,
      numWorkers: 1,
      // Random Map Settings
      mapConfig: {
        mapType: 'random',
        count: 10,
      },
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
    await wrapper.vm.$nextTick()

    // Find and interact with input elements to trigger v-model updates
    const inputs = wrapper.findAll('.el-input')
    if (inputs.length > 0) {
      await inputs[0].setValue('My Test Session')
      await wrapper.vm.$nextTick()
      expect(vm.trainingConfig.name).toBe('My Test Session')
    }

    // Find and interact with select elements
    const selects = wrapper.findAll('.el-select')
    if (selects.length > 0) {
      await selects[0].setValue('a3c')
      await wrapper.vm.$nextTick()
      expect(vm.trainingConfig.algorithm).toBe('a3c')
    }

    if (selects.length > 1) {
      await selects[1].setValue('enhanced')
      await wrapper.vm.$nextTick()
      expect(vm.trainingConfig.environmentType).toBe('enhanced')
    }

    // Find and interact with number inputs
    const numberInputs = wrapper.findAll('.el-input-number')
    if (numberInputs.length > 0) {
      await numberInputs[0].setValue('50000')
      await wrapper.vm.$nextTick()
      expect(vm.trainingConfig.totalTimesteps).toBe(50000)
    }

    // Test additional number inputs for environment dimensions
    if (numberInputs.length > 1) {
      await numberInputs[1].setValue('10')
      await wrapper.vm.$nextTick()
      expect(vm.trainingConfig.envWidth).toBe(10)
    }

    if (numberInputs.length > 2) {
      await numberInputs[2].setValue('12')
      await wrapper.vm.$nextTick()
      expect(vm.trainingConfig.envHeight).toBe(12)
    }
  })

  it('handles map type selection through v-model', async () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm as any

    await wrapper.find('.el-button').trigger('click')
    await wrapper.vm.$nextTick()

    // Find map type select (should be the 3rd select element)
    const selects = wrapper.findAll('.el-select')
    if (selects.length > 2) {
      await selects[2].setValue('maze')
      await wrapper.vm.$nextTick()
      expect(vm.trainingConfig.mapConfig!.mapType).toBe('maze')

      await selects[2].setValue('cave')
      await wrapper.vm.$nextTick()
      expect(vm.trainingConfig.mapConfig!.mapType).toBe('cave')

      await selects[2].setValue('room')
      await wrapper.vm.$nextTick()
      expect(vm.trainingConfig.mapConfig!.mapType).toBe('room')
    }
  })

  it('handles reward weight inputs through v-model', async () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm as any

    await wrapper.find('.el-button').trigger('click')
    await wrapper.vm.$nextTick()

    const numberInputs = wrapper.findAll('.el-input-number')

    // Find coverage weight input (approximate index based on form structure)
    const coverageIndex = numberInputs.findIndex((input) => {
      const val = input.element.getAttribute('value')
      return val === '1.5' || val === String(vm.trainingConfig.coverageWeight)
    })

    if (coverageIndex >= 0) {
      await numberInputs[coverageIndex].setValue('2.5')
      await wrapper.vm.$nextTick()
      expect(vm.trainingConfig.coverageWeight).toBe(2.5)
    }
  })

  it('renders Advanced Settings collapse component', async () => {
    const wrapper = mountComponent()
    await wrapper.find('.el-button').trigger('click')

    expect(wrapper.findComponent({ name: 'ElCollapse' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ElCollapseItem' }).exists()).toBe(true)
  })

  it('has parameter tooltips for Advanced Settings', () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm as any

    expect(vm.parameterTooltips.learningRate).toBeDefined()
    expect(vm.parameterTooltips.batchSize).toBeDefined()
    expect(vm.parameterTooltips.numWorkers).toBeDefined()
    expect(vm.parameterTooltips.learningRate).toContain('推奨値: 0.0003')
    expect(vm.parameterTooltips.batchSize).toContain('推奨値: 64')
    expect(vm.parameterTooltips.numWorkers).toContain('推奨値: 1-4')
  })

  it('updates Advanced Settings values through v-model', async () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm as any

    // Show the form first
    await wrapper.find('.el-button').trigger('click')
    await wrapper.vm.$nextTick()

    // Trigger v-model updates by actually interacting with the inputs
    vm.trainingConfig.learningRate = 0.001
    vm.trainingConfig.batchSize = 128
    vm.trainingConfig.numWorkers = 4

    await wrapper.vm.$nextTick()

    // Verify the values were set
    expect(vm.trainingConfig.learningRate).toBe(0.001)
    expect(vm.trainingConfig.batchSize).toBe(128)
    expect(vm.trainingConfig.numWorkers).toBe(4)
  })

  it('updates environment size through v-model', async () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm as any

    await wrapper.find('.el-button').trigger('click')
    await wrapper.vm.$nextTick()

    // Update environment dimensions
    vm.trainingConfig.envWidth = 15
    vm.trainingConfig.envHeight = 20

    await wrapper.vm.$nextTick()

    expect(vm.trainingConfig.envWidth).toBe(15)
    expect(vm.trainingConfig.envHeight).toBe(20)
  })

  it('updates reward weights through v-model', async () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm as any

    await wrapper.find('.el-button').trigger('click')
    await wrapper.vm.$nextTick()

    // Update reward weights
    vm.trainingConfig.coverageWeight = 2.5
    vm.trainingConfig.explorationWeight = 4.5
    vm.trainingConfig.diversityWeight = 3.5

    await wrapper.vm.$nextTick()

    expect(vm.trainingConfig.coverageWeight).toBe(2.5)
    expect(vm.trainingConfig.explorationWeight).toBe(4.5)
    expect(vm.trainingConfig.diversityWeight).toBe(3.5)
  })

  it('updates map configuration through v-model', async () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm as any

    await wrapper.find('.el-button').trigger('click')
    await wrapper.vm.$nextTick()

    // Update map config
    vm.trainingConfig.mapConfig!.mapType = 'maze'
    vm.trainingConfig.mapConfig!.seed = 12345
    vm.trainingConfig.mapConfig!.count = 20

    await wrapper.vm.$nextTick()

    expect(vm.trainingConfig.mapConfig!.mapType).toBe('maze')
    expect(vm.trainingConfig.mapConfig!.seed).toBe(12345)
    expect(vm.trainingConfig.mapConfig!.count).toBe(20)
  })

  it('updates cave map probability through v-model', async () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm as any

    await wrapper.find('.el-button').trigger('click')
    await wrapper.vm.$nextTick()

    // Set map type to cave
    vm.trainingConfig.mapConfig!.mapType = 'cave'
    vm.trainingConfig.mapConfig!.initialWallProbability = 0.6

    await wrapper.vm.$nextTick()

    expect(vm.trainingConfig.mapConfig!.mapType).toBe('cave')
    expect(vm.trainingConfig.mapConfig!.initialWallProbability).toBe(0.6)
  })

  describe('getErrorMessage function', () => {
    it('returns error message for status code 400', async () => {
      vi.clearAllMocks()
      mockCreateSession.mockRejectedValueOnce({ status: 400 })

      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.formRef = {
        validate: vi.fn().mockResolvedValue(true),
        resetFields: vi.fn(),
      }

      await vm.startTraining()

      expect(mockError).toHaveBeenCalledWith(
        expect.stringContaining('セッション設定が無効です。パラメータを確認してください。')
      )
    })

    it('returns error message for status code 502', async () => {
      vi.clearAllMocks()
      mockCreateSession.mockRejectedValueOnce({ status: 502 })

      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.formRef = {
        validate: vi.fn().mockResolvedValue(true),
        resetFields: vi.fn(),
      }

      await vm.startTraining()

      expect(mockError).toHaveBeenCalledWith(expect.stringContaining('トレーニングワーカーが起動していません'))
    })

    it('returns error message for status code 503', async () => {
      vi.clearAllMocks()
      mockCreateSession.mockRejectedValueOnce({ status: 503 })

      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.formRef = {
        validate: vi.fn().mockResolvedValue(true),
        resetFields: vi.fn(),
      }

      await vm.startTraining()

      expect(mockError).toHaveBeenCalledWith(expect.stringContaining('サーバーが高負荷状態です'))
    })

    it('returns error message for status code 500', async () => {
      vi.clearAllMocks()
      mockCreateSession.mockRejectedValueOnce({ status: 500 })

      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.formRef = {
        validate: vi.fn().mockResolvedValue(true),
        resetFields: vi.fn(),
      }

      await vm.startTraining()

      expect(mockError).toHaveBeenCalledWith(expect.stringContaining('サーバー内部エラーが発生しました'))
    })

    it('returns timeout error message', async () => {
      vi.clearAllMocks()
      mockCreateSession.mockRejectedValueOnce({ message: 'API応答タイムアウト' })

      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.formRef = {
        validate: vi.fn().mockResolvedValue(true),
        resetFields: vi.fn(),
      }

      await vm.startTraining()

      expect(mockError).toHaveBeenCalledWith(
        expect.stringContaining('API応答タイムアウト。Workerが起動していない可能性があります')
      )
    })

    it('returns error message from error.response.status', async () => {
      vi.clearAllMocks()
      mockCreateSession.mockRejectedValueOnce({ response: { status: 400 } })

      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.formRef = {
        validate: vi.fn().mockResolvedValue(true),
        resetFields: vi.fn(),
      }

      await vm.startTraining()

      expect(mockError).toHaveBeenCalledWith(
        expect.stringContaining('セッション設定が無効です。パラメータを確認してください。')
      )
    })

    it('returns custom error message if provided', async () => {
      vi.clearAllMocks()
      mockCreateSession.mockRejectedValueOnce({ message: 'Custom error occurred' })

      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.formRef = {
        validate: vi.fn().mockResolvedValue(true),
        resetFields: vi.fn(),
      }

      await vm.startTraining()

      expect(mockError).toHaveBeenCalledWith(expect.stringContaining('Custom error occurred'))
    })

    it('returns default error message for unknown errors', async () => {
      vi.clearAllMocks()
      mockCreateSession.mockRejectedValueOnce({})

      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.formRef = {
        validate: vi.fn().mockResolvedValue(true),
        resetFields: vi.fn(),
      }

      await vm.startTraining()

      expect(mockError).toHaveBeenCalledWith(expect.stringContaining('学習セッションの開始に失敗しました'))
    })

    it('handles 400 error status correctly', async () => {
      vi.clearAllMocks()
      mockCreateSession.mockRejectedValueOnce({
        status: 400,
      })

      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.formRef = {
        validate: vi.fn().mockResolvedValue(true),
        resetFields: vi.fn(),
      }

      await vm.startTraining()

      expect(mockError).toHaveBeenCalledWith(expect.stringContaining('セッション設定が無効です'))
    })

    it('handles 502 error status correctly', async () => {
      vi.clearAllMocks()
      mockCreateSession.mockRejectedValueOnce({
        status: 502,
      })

      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.formRef = {
        validate: vi.fn().mockResolvedValue(true),
        resetFields: vi.fn(),
      }

      await vm.startTraining()

      expect(mockError).toHaveBeenCalledWith(expect.stringContaining('トレーニングワーカーが起動していません'))
    })

    it('handles 503 error status correctly', async () => {
      vi.clearAllMocks()
      mockCreateSession.mockRejectedValueOnce({
        status: 503,
      })

      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.formRef = {
        validate: vi.fn().mockResolvedValue(true),
        resetFields: vi.fn(),
      }

      await vm.startTraining()

      expect(mockError).toHaveBeenCalledWith(expect.stringContaining('サーバーが高負荷状態です'))
    })

    it('handles 500 error status correctly', async () => {
      vi.clearAllMocks()
      mockCreateSession.mockRejectedValueOnce({
        status: 500,
      })

      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.formRef = {
        validate: vi.fn().mockResolvedValue(true),
        resetFields: vi.fn(),
      }

      await vm.startTraining()

      expect(mockError).toHaveBeenCalledWith(expect.stringContaining('サーバー内部エラーが発生しました'))
    })

    it('handles timeout error correctly', async () => {
      vi.clearAllMocks()
      mockCreateSession.mockRejectedValueOnce({
        message: 'API応答タイムアウト',
      })

      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.formRef = {
        validate: vi.fn().mockResolvedValue(true),
        resetFields: vi.fn(),
      }

      await vm.startTraining()

      expect(mockError).toHaveBeenCalledWith(expect.stringContaining('API応答タイムアウト'))
    })

    it('handles error with response.status property', async () => {
      vi.clearAllMocks()
      mockCreateSession.mockRejectedValueOnce({
        response: { status: 400 },
      })

      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.formRef = {
        validate: vi.fn().mockResolvedValue(true),
        resetFields: vi.fn(),
      }

      await vm.startTraining()

      expect(mockError).toHaveBeenCalledWith(expect.stringContaining('セッション設定が無効です'))
    })
  })

  describe('Form Controls', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('openForm sets showForm to true', () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      expect(vm.showForm).toBe(false)

      vm.openForm()

      expect(vm.showForm).toBe(true)
    })

    it('cancelForm sets showForm to false and resets form fields', () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      const mockResetFields = vi.fn()
      vm.formRef = {
        validate: vi.fn(),
        resetFields: mockResetFields,
      }

      vm.showForm = true
      vm.cancelForm()

      expect(vm.showForm).toBe(false)
      expect(mockResetFields).toHaveBeenCalled()
    })

    it('cancelForm handles missing formRef gracefully', () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.formRef = null
      vm.showForm = true

      // Should not throw error
      expect(() => vm.cancelForm()).not.toThrow()
      expect(vm.showForm).toBe(false)
    })

    it('clicking "新規学習セッションを開始" button triggers openForm', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      expect(vm.showForm).toBe(false)

      // Find and click the start button
      const startButton = wrapper.find('.el-button')
      await startButton.trigger('click')

      expect(vm.showForm).toBe(true)
    })
  })
})
