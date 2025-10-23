import { createPinia, setActivePinia } from 'pinia'

import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import ModelsIndexPage from '~/pages/models/index.vue'
import { useModelsStore } from '~/stores/models'
import { ElMessage, ElMessageBox } from '~/tests/mocks/element-plus'

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

const ElProgressStub = {
  name: 'ElProgress',
  template: '<div class="el-progress" :data-percentage="percentage"></div>',
  props: ['percentage', 'status'],
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
    ElProgress: ElProgressStub,
    UploadFilled: { template: '<span>upload</span>' },
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    const modelsStore = useModelsStore()
    modelsStore.models = []
    modelsStore.isLoading = false
    modelsStore.error = null
    modelsStore.uploadProgress = 0

    // Mock fetchModels to prevent $fetch calls
    vi.spyOn(modelsStore, 'fetchModels').mockResolvedValue()

    // Stub global Element Plus components
    vi.stubGlobal('ElMessage', ElMessage)
    vi.stubGlobal('ElMessageBox', ElMessageBox)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
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

  describe('functions', () => {
    it('formatFileSize formats bytes correctly', () => {
      const wrapper = mount(ModelsIndexPage, {
        global: { stubs: globalStubs },
      })

      const vm = wrapper.vm as any

      expect(vm.formatFileSize(0)).toBe('0 B')
      expect(vm.formatFileSize(100)).toBe('100 B')
      expect(vm.formatFileSize(1024)).toBe('1 KB')
      expect(vm.formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(vm.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
      expect(vm.formatFileSize(1536)).toBe('1.5 KB')
    })

    it('formatDate formats date correctly', () => {
      const wrapper = mount(ModelsIndexPage, {
        global: { stubs: globalStubs },
      })

      const vm = wrapper.vm as any
      const testDate = new Date('2025-10-14T12:00:00Z')
      const formatted = vm.formatDate(testDate)

      expect(formatted).toBeTruthy()
      expect(typeof formatted).toBe('string')
    })

    it('handleUploadChange sets upload file', () => {
      const wrapper = mount(ModelsIndexPage, {
        global: { stubs: globalStubs },
      })

      const vm = wrapper.vm as any
      const mockFile = new File(['content'], 'test.zip', { type: 'application/zip' })

      vm.handleUploadChange({ raw: mockFile })

      expect(vm.uploadFile).toEqual(mockFile)
    })

    it('handleUpload shows warning when no file selected', async () => {
      const wrapper = mount(ModelsIndexPage, {
        global: { stubs: globalStubs },
      })

      const vm = wrapper.vm as any
      vm.uploadFile = null

      await vm.handleUpload()

      expect(ElMessage.warning).toHaveBeenCalledWith('ファイルを選択してください')
    })

    it('handleUpload uploads file successfully', async () => {
      const modelsStore = useModelsStore()
      vi.spyOn(modelsStore, 'uploadModel').mockResolvedValue(undefined)

      const wrapper = mount(ModelsIndexPage, {
        global: { stubs: globalStubs },
      })

      const vm = wrapper.vm as any
      const mockFile = new File(['content'], 'test.zip', { type: 'application/zip' })
      vm.uploadFile = mockFile
      vm.uploadDialogVisible = true

      await vm.handleUpload()

      expect(modelsStore.uploadModel).toHaveBeenCalledWith(mockFile)
      expect(ElMessage.success).toHaveBeenCalledWith('モデルのアップロードに成功しました')
      expect(vm.uploadDialogVisible).toBe(false)
      expect(vm.uploadFile).toBeNull()
    })

    it('handleUpload shows error on failure', async () => {
      const modelsStore = useModelsStore()
      vi.spyOn(modelsStore, 'uploadModel').mockRejectedValue(new Error('Upload failed'))

      const wrapper = mount(ModelsIndexPage, {
        global: { stubs: globalStubs },
      })

      const vm = wrapper.vm as any
      const mockFile = new File(['content'], 'test.zip', { type: 'application/zip' })
      vm.uploadFile = mockFile

      await vm.handleUpload()

      expect(ElMessage.error).toHaveBeenCalledWith('モデルのアップロードに失敗しました')
    })

    it('handleDownload downloads model successfully', async () => {
      const modelsStore = useModelsStore()
      vi.spyOn(modelsStore, 'downloadModel').mockResolvedValue(undefined)

      const wrapper = mount(ModelsIndexPage, {
        global: { stubs: globalStubs },
      })

      const vm = wrapper.vm as any
      const mockModel = { id: 'model-1', filename: 'test.zip' }

      await vm.handleDownload(mockModel)

      expect(modelsStore.downloadModel).toHaveBeenCalledWith('model-1', 'test.zip')
      expect(ElMessage.success).toHaveBeenCalledWith('モデルのダウンロードを開始しました')
    })

    it('handleDownload uses default filename when not provided', async () => {
      const modelsStore = useModelsStore()
      vi.spyOn(modelsStore, 'downloadModel').mockResolvedValue(undefined)

      const wrapper = mount(ModelsIndexPage, {
        global: { stubs: globalStubs },
      })

      const vm = wrapper.vm as any
      const mockModel = { id: 'model-2' }

      await vm.handleDownload(mockModel)

      expect(modelsStore.downloadModel).toHaveBeenCalledWith('model-2', 'model_model-2.zip')
      expect(ElMessage.success).toHaveBeenCalledWith('モデルのダウンロードを開始しました')
    })

    it('handleDownload shows error on failure', async () => {
      const modelsStore = useModelsStore()
      vi.spyOn(modelsStore, 'downloadModel').mockRejectedValue(new Error('Download failed'))

      const wrapper = mount(ModelsIndexPage, {
        global: { stubs: globalStubs },
      })

      const vm = wrapper.vm as any
      const mockModel = { id: 'model-1', filename: 'test.zip' }

      await vm.handleDownload(mockModel)

      expect(ElMessage.error).toHaveBeenCalledWith('モデルのダウンロードに失敗しました')
    })

    it('handleDelete deletes model after confirmation', async () => {
      ;(ElMessageBox.confirm as any).mockResolvedValue('confirm')

      const modelsStore = useModelsStore()
      vi.spyOn(modelsStore, 'deleteModel').mockResolvedValue(true)

      const wrapper = mount(ModelsIndexPage, {
        global: { stubs: globalStubs },
      })

      const vm = wrapper.vm as any
      const mockModel = { id: 'model-1', filename: 'test.zip' }

      await vm.handleDelete(mockModel)

      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(modelsStore.deleteModel).toHaveBeenCalledWith('model-1')
      expect(ElMessage.success).toHaveBeenCalledWith('モデルを削除しました')
    })

    it('handleDelete shows error when deletion fails', async () => {
      ;(ElMessageBox.confirm as any).mockResolvedValue('confirm')

      const modelsStore = useModelsStore()
      vi.spyOn(modelsStore, 'deleteModel').mockResolvedValue(false)

      const wrapper = mount(ModelsIndexPage, {
        global: { stubs: globalStubs },
      })

      const vm = wrapper.vm as any
      const mockModel = { id: 'model-1', filename: 'test.zip' }

      await vm.handleDelete(mockModel)

      expect(modelsStore.deleteModel).toHaveBeenCalledWith('model-1')
      expect(ElMessage.error).toHaveBeenCalledWith('モデルの削除に失敗しました')
    })

    it('handleDelete does nothing when user cancels', async () => {
      ;(ElMessageBox.confirm as any).mockRejectedValue('cancel')

      const modelsStore = useModelsStore()
      const deleteSpy = vi.spyOn(modelsStore, 'deleteModel')

      const wrapper = mount(ModelsIndexPage, {
        global: { stubs: globalStubs },
      })

      const vm = wrapper.vm as any
      const mockModel = { id: 'model-1', filename: 'test.zip' }

      await vm.handleDelete(mockModel)

      expect(deleteSpy).not.toHaveBeenCalled()
      expect(ElMessage.success).not.toHaveBeenCalled()
      expect(ElMessage.error).not.toHaveBeenCalled()
    })
  })

  describe('Upload Progress', () => {
    it('should display progress bar when uploadProgress > 0 and dialog is open', async () => {
      const modelsStore = useModelsStore()

      const wrapper = mount(ModelsIndexPage, {
        global: { stubs: globalStubs },
      })

      const vm = wrapper.vm as any
      vm.uploadDialogVisible = true
      await wrapper.vm.$nextTick()

      modelsStore.uploadProgress = 50
      await wrapper.vm.$nextTick()

      const progressBar = wrapper.find('.el-progress')
      expect(progressBar.exists()).toBe(true)
      expect(progressBar.attributes('data-percentage')).toBe('50')
    })

    it('should not display progress bar when uploadProgress is 0', async () => {
      const wrapper = mount(ModelsIndexPage, {
        global: { stubs: globalStubs },
      })

      const vm = wrapper.vm as any
      vm.uploadDialogVisible = true
      await wrapper.vm.$nextTick()

      const progressBar = wrapper.find('.el-progress')
      expect(progressBar.exists()).toBe(false)
    })

    it('should display progress bar when uploadProgress is 100 and dialog is open', async () => {
      const modelsStore = useModelsStore()

      const wrapper = mount(ModelsIndexPage, {
        global: { stubs: globalStubs },
      })

      const vm = wrapper.vm as any
      vm.uploadDialogVisible = true
      await wrapper.vm.$nextTick()

      modelsStore.uploadProgress = 100
      await wrapper.vm.$nextTick()

      const progressBar = wrapper.find('.el-progress')
      expect(progressBar.exists()).toBe(true)
      expect(progressBar.attributes('data-percentage')).toBe('100')
    })
  })
})
