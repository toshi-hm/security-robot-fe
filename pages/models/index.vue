<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue'
import { computed, onMounted, ref } from 'vue'

import type { ModelEntity } from '~/libs/entities/model/ModelEntity'
import { useModelsStore } from '~/stores/models'

// Element Plus types (auto-imported by @element-plus/nuxt)
interface UploadFile {
  raw?: File
}

const modelsStore = useModelsStore()
const uploadDialogVisible = ref(false)
const uploadFile = ref<File | null>(null)
const searchQuery = ref('')

onMounted(async () => {
  await modelsStore.fetchModels()
})

const handleUploadChange = (file: UploadFile) => {
  if (file.raw) {
    uploadFile.value = file.raw
  }
}

const handleUpload = async () => {
  if (!uploadFile.value) {
    ElMessage.warning('ファイルを選択してください')
    return
  }

  try {
    await modelsStore.uploadModel(uploadFile.value)
    ElMessage.success('モデルのアップロードに成功しました')
    uploadDialogVisible.value = false
    uploadFile.value = null
  } catch {
    ElMessage.error('モデルのアップロードに失敗しました')
  }
}

const handleDownload = async (model: ModelEntity) => {
  try {
    await modelsStore.downloadModel(model.id, model.filename || `model_${model.id}.zip`)
    ElMessage.success('モデルのダウンロードを開始しました')
  } catch {
    ElMessage.error('モデルのダウンロードに失敗しました')
  }
}

const handleDelete = async (model: ModelEntity) => {
  try {
    await ElMessageBox.confirm(
      `モデル「${model.filename || model.id}」を削除しますか？この操作は取り消せません。`,
      '確認',
      {
        confirmButtonText: '削除',
        cancelButtonText: 'キャンセル',
        type: 'warning',
      }
    )

    const success = await modelsStore.deleteModel(model.id)
    if (success) {
      ElMessage.success('モデルを削除しました')
    } else {
      ElMessage.error('モデルの削除に失敗しました')
    }
  } catch {
    // User cancelled
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleString('ja-JP')
}

// Filter models based on search query
const filteredModels = computed(() => {
  if (!searchQuery.value) {
    return modelsStore.models
  }

  const query = searchQuery.value.toLowerCase()
  return modelsStore.models.filter(model => {
    const filename = (model.original_filename || model.filename || '').toLowerCase()
    const id = (model.id || '').toString().toLowerCase()
    return filename.includes(query) || id.includes(query)
  })
})

const handleSearch = (query: string) => {
  searchQuery.value = query
}
</script>

<template>
  <div class="models">
    <div class="models__header">
      <div>
        <h2 class="models__title">モデル管理</h2>
        <p class="models__description">訓練済みモデルのアップロード、ダウンロード、削除</p>
      </div>
      <el-button type="primary" @click="uploadDialogVisible = true"> モデルをアップロード </el-button>
    </div>

    <el-card v-loading="modelsStore.isLoading" class="models__card">
      <el-alert
        v-if="modelsStore.error"
        :title="modelsStore.error"
        type="error"
        :closable="false"
        class="models__error"
      />

      <!-- Search Filter -->
      <div v-if="modelsStore.models.length > 0" class="models__search">
        <SearchFilter v-model="searchQuery" placeholder="ファイル名またはIDで検索..." @search="handleSearch" />
      </div>

      <el-empty
        v-if="filteredModels.length === 0 && !modelsStore.isLoading"
        :description="searchQuery ? '検索結果が見つかりません' : 'モデルがありません'"
      />

      <el-table v-else :data="filteredModels" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="original_filename" label="ファイル名" min-width="200" />
        <el-table-column label="サイズ" width="120">
          <template #default="{ row }">
            {{ row.file_size ? formatFileSize(row.file_size) : 'N/A' }}
          </template>
        </el-table-column>
        <el-table-column label="アップロード日時" width="200">
          <template #default="{ row }">
            {{ row.created_at ? formatDate(row.created_at) : 'N/A' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleDownload(row)"> ダウンロード </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)"> 削除 </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Upload Dialog -->
    <el-dialog v-model="uploadDialogVisible" title="モデルをアップロード" width="500px">
      <el-upload :auto-upload="false" :limit="1" :on-change="handleUploadChange" drag class="models__upload">
        <div class="models__upload-content">
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">ファイルをドラッグ＆ドロップ、または<em>クリックして選択</em></div>
          <div class="el-upload__tip">.zip, .pth, .h5ファイルをアップロードできます</div>
        </div>
      </el-upload>

      <!-- Upload Progress Bar -->
      <el-progress
        v-if="modelsStore.uploadProgress > 0"
        :percentage="modelsStore.uploadProgress"
        class="models__progress"
      />

      <template #footer>
        <el-button @click="uploadDialogVisible = false"> キャンセル </el-button>
        <el-button type="primary" :loading="modelsStore.isLoading" @click="handleUpload"> アップロード </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.models {
  padding: 20px;

  &__header {
    align-items: flex-start;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  &__title {
    color: var(--md-on-background);
    font-size: 1.75rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  &__description {
    color: var(--md-on-surface-variant);
    font-size: 0.875rem;
  }

  &__card {
    background-color: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
    margin-top: 20px;
  }

  &__error {
    margin-bottom: 20px;
  }

  &__upload {
    margin: 20px 0;
  }

  &__upload-content {
    padding: 40px 20px;
    text-align: center;
  }

  &__progress {
    margin-top: 20px;
  }

  &__search {
    margin-bottom: 20px;
  }
}
</style>
