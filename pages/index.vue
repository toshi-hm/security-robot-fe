<script setup lang="ts">
import { TrendCharts, Files, VideoPlay, Plus, Upload, Setting } from '@element-plus/icons-vue'

import StatisticsCard from '~/components/common/StatisticsCard.vue'
import { useModelsStore } from '~/stores/models'
import { usePlaybackStore } from '~/stores/playback'
import { useTrainingStore } from '~/stores/training'

// Stores
const trainingStore = useTrainingStore()
const modelsStore = useModelsStore()
const playbackStore = usePlaybackStore()

// Load data on mount
onMounted(async () => {
  await Promise.all([trainingStore.fetchSessions(), modelsStore.fetchModels(), playbackStore.fetchSessions()])
})
</script>

<template>
  <div class="dashboard">
    <div class="dashboard__header">
      <h1 class="dashboard__title">セキュリティロボット強化学習システム</h1>
      <p class="dashboard__subtitle">学習セッション、再生、モデル管理を一元管理</p>
    </div>

    <el-row :gutter="20" class="dashboard__stats">
      <!-- Training Sessions Card -->
      <el-col :xs="24" :sm="12" :lg="8">
        <StatisticsCard
          title="学習セッション"
          :value="trainingStore.sessions.length"
          label="総セッション数"
          color-theme="primary"
          :icon="TrendCharts"
          :tag-text="`実行中: ${trainingStore.activeSessions.length}`"
          tag-type="success"
        >
          <template #actions>
            <el-button type="primary" @click="navigateTo('/training')"> セッション管理 </el-button>
          </template>
        </StatisticsCard>
      </el-col>

      <!-- Models Card -->
      <el-col :xs="24" :sm="12" :lg="8">
        <StatisticsCard
          title="モデル管理"
          :value="modelsStore.models.length"
          label="登録モデル数"
          color-theme="secondary"
          :icon="Files"
          tag-text="利用可能"
          tag-type="success"
        >
          <template #actions>
            <el-button type="success" @click="navigateTo('/models')"> モデル管理 </el-button>
          </template>
        </StatisticsCard>
      </el-col>

      <!-- Playback Card -->
      <el-col :xs="24" :sm="12" :lg="8">
        <StatisticsCard
          title="再生管理"
          :value="playbackStore.sessions.length"
          label="再生可能セッション数"
          color-theme="tertiary"
          :icon="VideoPlay"
          tag-text="記録済み"
          tag-type="info"
        >
          <template #actions>
            <el-button type="warning" @click="navigateTo('/playback')"> 再生管理 </el-button>
          </template>
        </StatisticsCard>
      </el-col>
    </el-row>

    <!-- Quick Actions Section -->
    <el-row :gutter="20" class="dashboard__quick-actions">
      <el-col :span="24">
        <el-card shadow="never" class="dashboard__quick-actions-card">
          <template #header>
            <h3 class="dashboard__section-title">クイックアクション</h3>
          </template>
          <div class="dashboard__action-buttons">
            <el-button type="primary" size="large" @click="navigateTo('/training')">
              <el-icon><Plus /></el-icon>
              新規学習セッション
            </el-button>
            <el-button type="success" size="large" @click="navigateTo('/models')">
              <el-icon><Upload /></el-icon>
              モデルをアップロード
            </el-button>
            <el-button type="warning" size="large" @click="navigateTo('/playback')">
              <el-icon><VideoPlay /></el-icon>
              再生を開始
            </el-button>
            <el-button type="info" size="large" @click="navigateTo('/settings')">
              <el-icon><Setting /></el-icon>
              設定
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.dashboard {
  background-color: var(--md-background);
  min-height: calc(100vh - 60px);
  padding: 20px;

  &__header {
    margin-bottom: 30px;
    text-align: center;
  }

  &__title {
    color: var(--md-on-background);
    font-size: 32px;
    font-weight: 600;
    margin: 0 0 10px;
  }

  &__subtitle {
    color: var(--md-on-surface-variant);
    font-size: 16px;
    margin: 0;
  }

  &__stats {
    margin-bottom: 30px;

    .statistics-card {
      height: 100%;
    }
  }

  &__quick-actions {
    margin-bottom: 20px;
  }

  &__quick-actions-card {
    background-color: var(--md-surface-1);
    border: 1px solid var(--md-outline-variant);
    border-radius: 8px;
  }

  &__section-title {
    color: var(--md-on-surface);
    font-size: 20px;
    font-weight: 600;
    margin: 0;
  }

  &__action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: center;
    padding: 10px 0;

    .el-button {
      min-width: 180px;
    }
  }

  // Responsive design
  @media (width <= 768px) {
    padding: 15px;

    &__title {
      font-size: 24px;
    }

    .statistics-card__value {
      font-size: 36px;
    }

    &__action-buttons {
      align-items: stretch;
      flex-direction: column;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
