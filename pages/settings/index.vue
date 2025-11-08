<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  title: '設定',
})

// Environment settings
const environmentSettings = ref({
  gridWidth: 8,
  gridHeight: 8,
  environmentType: 'standard' as 'standard' | 'enhanced',
  threatLevel: 'medium' as 'low' | 'medium' | 'high',
  coverageWeight: 1.5,
  explorationWeight: 3.0,
  diversityWeight: 2.0,
})

// Training settings
const trainingSettings = ref({
  algorithm: 'ppo' as 'ppo' | 'a3c',
  totalTimesteps: 10000,
  learningRate: 0.0003,
  gamma: 0.99,
  batchSize: 64,
  epochs: 10,
})

// Load settings from localStorage
const loadSettings = () => {
  const envSettings = localStorage.getItem('environmentSettings')
  if (envSettings) {
    try {
      environmentSettings.value = JSON.parse(envSettings)
    } catch (error) {
      console.error('Failed to load environment settings:', error)
    }
  }

  const trainSettings = localStorage.getItem('trainingSettings')
  if (trainSettings) {
    try {
      trainingSettings.value = JSON.parse(trainSettings)
    } catch (error) {
      console.error('Failed to load training settings:', error)
    }
  }
}

// Helper functions for display
const getEnvironmentTypeLabel = (type: string) => {
  return type === 'standard' ? '標準' : '拡張'
}

const getThreatLevelLabel = (level: string) => {
  const labels = { low: '低', medium: '中', high: '高' }
  return labels[level as keyof typeof labels] || level
}

const getAlgorithmLabel = (algo: string) => {
  return algo === 'ppo' ? 'PPO' : 'A3C'
}

const goToEnvironmentSettings = () => {
  return navigateTo('/settings/environment')
}

const goToTrainingSettings = () => {
  return navigateTo('/settings/training')
}

onMounted(() => {
  loadSettings()
})
</script>

<template>
  <div class="settings-index">
    <el-card class="settings-index__header">
      <template #header>
        <h2 class="settings-index__title">設定</h2>
      </template>
      <p class="settings-index__description">
        学習と環境シミュレーションのシステムパラメータを設定します。サイドバーからカテゴリを選択してください。
      </p>
    </el-card>

    <el-row :gutter="20" class="settings-index__cards">
      <el-col :span="12">
        <el-card class="settings-index__card" shadow="hover" @click="goToEnvironmentSettings">
          <template #header>
            <div class="settings-index__card-header">
              <span>環境設定</span>
            </div>
          </template>
          <p class="settings-index__card-description">
            グリッドサイズ、脅威レベル、カバレッジパラメータなどのシミュレーション環境を設定します。
          </p>

          <el-divider content-position="left">現在の設定</el-divider>

          <el-descriptions :column="1" size="small" class="settings-index__descriptions">
            <el-descriptions-item label="グリッドサイズ">
              {{ environmentSettings.gridWidth }} × {{ environmentSettings.gridHeight }}
            </el-descriptions-item>
            <el-descriptions-item label="環境タイプ">
              {{ getEnvironmentTypeLabel(environmentSettings.environmentType) }}
            </el-descriptions-item>
            <el-descriptions-item label="脅威レベル">
              <el-tag
                :type="
                  environmentSettings.threatLevel === 'high'
                    ? 'danger'
                    : environmentSettings.threatLevel === 'medium'
                      ? 'warning'
                      : 'success'
                "
                size="small"
              >
                {{ getThreatLevelLabel(environmentSettings.threatLevel) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="報酬重み">
              カバレッジ: {{ environmentSettings.coverageWeight }} / 探索: {{ environmentSettings.explorationWeight }} /
              多様性: {{ environmentSettings.diversityWeight }}
            </el-descriptions-item>
          </el-descriptions>

          <el-button type="primary" text class="settings-index__action-button">設定する →</el-button>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="settings-index__card" shadow="hover" @click="goToTrainingSettings">
          <template #header>
            <div class="settings-index__card-header">
              <span>学習設定</span>
            </div>
          </template>
          <p class="settings-index__card-description">
            アルゴリズム、タイムステップ、報酬重みなどの強化学習パラメータのデフォルト値を調整します。
          </p>

          <el-divider content-position="left">現在の設定</el-divider>

          <el-descriptions :column="1" size="small" class="settings-index__descriptions">
            <el-descriptions-item label="アルゴリズム">
              <el-tag type="primary" size="small">{{ getAlgorithmLabel(trainingSettings.algorithm) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="総タイムステップ">
              {{ trainingSettings.totalTimesteps.toLocaleString() }}
            </el-descriptions-item>
            <el-descriptions-item label="学習率">
              {{ trainingSettings.learningRate }}
            </el-descriptions-item>
            <el-descriptions-item label="ガンマ (γ)">
              {{ trainingSettings.gamma }}
            </el-descriptions-item>
            <el-descriptions-item label="バッチサイズ / エポック">
              {{ trainingSettings.batchSize }} / {{ trainingSettings.epochs }}
            </el-descriptions-item>
          </el-descriptions>

          <el-button type="primary" text class="settings-index__action-button">設定する →</el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.settings-index {
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

  &__cards {
    margin-top: 20px;
  }

  &__card {
    background-color: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
    cursor: pointer;
    min-height: 400px;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
    }
  }

  &__card-header {
    color: var(--md-on-surface);
    font-size: 18px;
    font-weight: 600;
  }

  &__card-description {
    color: var(--md-on-surface-variant);
    line-height: 1.6;
    margin: 10px 0 20px;
  }

  &__descriptions {
    margin-bottom: 20px;

    :deep(.el-descriptions__label) {
      color: #000;
      font-weight: 500;
      width: 150px;
    }

    :deep(.el-descriptions__content) {
      color: var(--md-on-surface);
    }
  }

  &__action-button {
    margin-top: 10px;
  }

  :deep(.el-divider) {
    margin: 15px 0;
  }
}
</style>
