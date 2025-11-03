<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { ref } from 'vue'

definePageMeta({
  title: '環境設定',
})

// Environment configuration form data
const formRef = ref<FormInstance>()
const environmentForm = ref({
  gridWidth: 8,
  gridHeight: 8,
  environmentType: 'standard' as 'standard' | 'enhanced',
  threatLevel: 'medium' as 'low' | 'medium' | 'high',
  coverageWeight: 1.5,
  explorationWeight: 3.0,
  diversityWeight: 2.0,
})

// Form validation rules
const rules: FormRules = {
  gridWidth: [
    { required: true, message: 'グリッド幅は必須です', trigger: 'blur' },
    { type: 'number', min: 5, max: 50, message: 'グリッド幅は5から50の間である必要があります', trigger: 'blur' },
  ],
  gridHeight: [
    { required: true, message: 'グリッド高さは必須です', trigger: 'blur' },
    { type: 'number', min: 5, max: 50, message: 'グリッド高さは5から50の間である必要があります', trigger: 'blur' },
  ],
  coverageWeight: [
    { required: true, message: 'カバレッジ重みは必須です', trigger: 'blur' },
    { type: 'number', min: 0, max: 10, message: 'カバレッジ重みは0から10の間である必要があります', trigger: 'blur' },
  ],
  explorationWeight: [
    { required: true, message: '探索重みは必須です', trigger: 'blur' },
    { type: 'number', min: 0, max: 10, message: '探索重みは0から10の間である必要があります', trigger: 'blur' },
  ],
  diversityWeight: [
    { required: true, message: '多様性重みは必須です', trigger: 'blur' },
    { type: 'number', min: 0, max: 10, message: '多様性重みは0から10の間である必要があります', trigger: 'blur' },
  ],
}

// Navigation
const goBack = () => {
  return navigateTo('/settings')
}

// Form actions
const saveSettings = async () => {
  if (!formRef.value) return

  try {
    const isValid = await formRef.value.validate()
    if (!isValid) return

    // In a real implementation, this would save to localStorage or backend
    localStorage.setItem('environmentSettings', JSON.stringify(environmentForm.value))

    ElMessage.success('環境設定を保存しました')
  } catch {
    ElMessage.error('環境設定の保存に失敗しました')
  }
}

const resetSettings = () => {
  formRef.value?.resetFields()
  ElMessage.info('環境設定をデフォルトにリセットしました')
}

// Load saved settings on mount
const loadSettings = () => {
  const saved = localStorage.getItem('environmentSettings')
  if (saved) {
    try {
      environmentForm.value = JSON.parse(saved)
    } catch (error) {
      console.error('Failed to load saved settings:', error)
    }
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<template>
  <div class="environment-settings">
    <el-card class="environment-settings__header">
      <template #header>
        <h2 class="environment-settings__title">環境設定</h2>
      </template>
      <p class="environment-settings__description">シミュレーション環境を設定します。</p>
    </el-card>

    <el-card class="environment-settings__form-card">
      <el-form ref="formRef" :model="environmentForm" :rules="rules" label-width="180px" label-position="left">
        <el-divider content-position="left">グリッドサイズ</el-divider>

        <el-form-item label="グリッド幅" prop="gridWidth">
          <el-input-number v-model="environmentForm.gridWidth" :min="5" :max="50" :step="1" />
          <span class="environment-settings__hint">列数 (5-50)</span>
        </el-form-item>

        <el-form-item label="グリッド高さ" prop="gridHeight">
          <el-input-number v-model="environmentForm.gridHeight" :min="5" :max="50" :step="1" />
          <span class="environment-settings__hint">行数 (5-50)</span>
        </el-form-item>

        <el-divider content-position="left">環境タイプ</el-divider>

        <el-form-item label="環境タイプ" prop="environmentType">
          <el-radio-group v-model="environmentForm.environmentType">
            <el-radio value="standard">標準</el-radio>
            <el-radio value="enhanced">拡張</el-radio>
          </el-radio-group>
          <div class="environment-settings__hint">
            標準: シンプルなルールの基本環境<br />
            拡張: 複雑な脅威パターンを持つ高度な環境
          </div>
        </el-form-item>

        <el-form-item label="脅威レベル" prop="threatLevel">
          <el-select v-model="environmentForm.threatLevel" placeholder="脅威レベルを選択">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
          <span class="environment-settings__hint">デフォルトの脅威分布レベル</span>
        </el-form-item>

        <el-divider content-position="left">報酬重み</el-divider>

        <el-form-item label="カバレッジ重み" prop="coverageWeight">
          <el-slider v-model="environmentForm.coverageWeight" :min="0" :max="10" :step="0.1" show-input />
          <span class="environment-settings__hint">報酬計算におけるエリアカバレッジの重み (0-10)</span>
        </el-form-item>

        <el-form-item label="探索重み" prop="explorationWeight">
          <el-slider v-model="environmentForm.explorationWeight" :min="0" :max="10" :step="0.1" show-input />
          <span class="environment-settings__hint">報酬計算における探索行動の重み (0-10)</span>
        </el-form-item>

        <el-form-item label="多様性重み" prop="diversityWeight">
          <el-slider v-model="environmentForm.diversityWeight" :min="0" :max="10" :step="0.1" show-input />
          <span class="environment-settings__hint">報酬計算における経路多様性の重み (0-10)</span>
        </el-form-item>

        <el-form-item>
          <el-space>
            <el-button type="primary" @click="saveSettings">設定を保存</el-button>
            <el-button @click="resetSettings">デフォルトにリセット</el-button>
            <el-button @click="goBack">設定一覧に戻る</el-button>
          </el-space>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.environment-settings {
  padding: 20px;

  &__header {
    background-color: var(--md-surface-1);
    border: 1px solid var(--md-outline-variant);
    margin-bottom: 20px;
  }

  &__title {
    color: var(--md-on-surface);
    font-size: 24px;
    font-weight: 600;
    margin: 0;
  }

  &__description {
    color: var(--md-on-surface-variant);
    margin: 0;
  }

  &__form-card {
    background-color: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
    max-width: 800px;
  }

  &__hint {
    color: var(--md-on-surface-variant);
    display: block;
    font-size: 12px;
    line-height: 1.4;
    margin-top: 5px;
  }

  :deep(.el-form-item) {
    margin-bottom: 24px;
  }

  :deep(.el-divider) {
    margin: 30px 0 20px;
  }

  :deep(.el-input-number) {
    width: 150px;
  }

  :deep(.el-slider) {
    margin-right: 20px;
    width: 300px;
  }
}
</style>
