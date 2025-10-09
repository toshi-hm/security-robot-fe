import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import ModelsIndexPage from '~/pages/models/index.vue'
import { useModelsStore } from '~/stores/models'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
  ElMessageBox: {
    confirm: vi.fn(),
  },
}))

// Mock Element Plus components
const ElButtonStub = {
  name: 'ElButton',
  template: '<button><slot /></button>',
  props: ['type', 'loading'],
}

const ElCardStub = {
  name: 'ElCard',
  template: '<div class="el-card"><slot /></div>',
  props: ['loading'],
}

const ElTableStub = {
  name: 'ElTable',
  template: '<table><slot /></table>',
  props: ['data', 'stripe'],
}

const ElTableColumnStub = {
  name: 'ElTableColumn',
  template: '<td><slot /></td>',
  props: ['prop', 'label', 'width', 'minWidth', 'fixed'],
}

const ElDialogStub = {
  name: 'ElDialog',
  template: '<div v-if="modelValue"><slot /><slot name="footer" /></div>',
  props: ['modelValue', 'title', 'width'],
}

const ElUploadStub = {
  name: 'ElUpload',
  template: '<div><slot /></div>',
  props: ['autoUpload', 'limit', 'onChange', 'drag'],
}

const ElEmptyStub = {
  name: 'ElEmpty',
  template: '<div class="el-empty">{{ description }}</div>',
  props: ['description'],
}

const ElAlertStub = {
  name: 'ElAlert',
  template: '<div class="el-alert">{{ title }}</div>',
  props: ['title', 'type', 'closable'],
}

const ElIconStub = {
  name: 'ElIcon',
  template: '<i><slot /></i>',
}

describe('Models Index Page', () => {
  const globalStubs = {
    ElButton: ElButtonStub,
    ElCard: ElCardStub,
    ElTable: ElTableStub,
    ElTableColumn: ElTableColumnStub,
    ElDialog: ElDialogStub,
    ElUpload: ElUploadStub,
    ElEmpty: ElEmptyStub,
    ElAlert: ElAlertStub,
    ElIcon: ElIconStub,
    UploadFilled: { template: '<span>upload</span>' },
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    const modelsStore = useModelsStore()
    modelsStore.models = []
    modelsStore.isLoading = false
    modelsStore.error = null

    // Mock fetchModels to prevent $fetch calls
    vi.spyOn(modelsStore, 'fetchModels').mockResolvedValue()
  })

  it('renders the page', () => {
    const wrapper = mount(ModelsIndexPage, {
      global: { stubs: globalStubs },
    })

    expect(wrapper.find('.models').exists()).toBe(true)
  })

  it('displays the page title', () => {
    const wrapper = mount(ModelsIndexPage, {
      global: { stubs: globalStubs },
    })

    expect(wrapper.find('.models__title').text()).toBe('モデル管理')
  })

  it('displays description text', () => {
    const wrapper = mount(ModelsIndexPage, {
      global: { stubs: globalStubs },
    })
    const description = wrapper.find('.models__description')

    expect(description.exists()).toBe(true)
    expect(description.text()).toContain('訓練済みモデル')
  })

  it('has correct BEM structure', () => {
    const wrapper = mount(ModelsIndexPage, {
      global: { stubs: globalStubs },
    })

    expect(wrapper.find('.models').exists()).toBe(true)
    expect(wrapper.find('.models__title').exists()).toBe(true)
    expect(wrapper.find('.models__description').exists()).toBe(true)
  })
})
