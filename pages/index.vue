<script setup lang="ts">
import { TrendCharts, Files, VideoPlay, Plus, Upload, Setting } from '@element-plus/icons-vue'

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
        <el-card class="dashboard__card dashboard__card--training" shadow="hover">
          <template #header>
            <div class="dashboard__card-header">
              <el-icon :size="24" class="dashboard__card-icon">
                <TrendCharts />
              </el-icon>
              <span class="dashboard__card-title">学習セッション</span>
            </div>
          </template>
          <div class="dashboard__card-content">
            <div class="dashboard__stat-number">{{ trainingStore.sessions.length }}</div>
            <div class="dashboard__stat-label">総セッション数</div>
            <div class="dashboard__stat-detail">
              <el-tag type="success" effect="plain"> 実行中: {{ trainingStore.activeSessions.length }} </el-tag>
            </div>
          </div>
          <div class="dashboard__card-actions">
            <el-button type="primary" @click="navigateTo('/training')"> セッション管理 </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- Models Card -->
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="dashboard__card dashboard__card--models" shadow="hover">
          <template #header>
            <div class="dashboard__card-header">
              <el-icon :size="24" class="dashboard__card-icon">
                <Files />
              </el-icon>
              <span class="dashboard__card-title">モデル管理</span>
            </div>
          </template>
          <div class="dashboard__card-content">
            <div class="dashboard__stat-number">{{ modelsStore.models.length }}</div>
            <div class="dashboard__stat-label">登録モデル数</div>
            <div class="dashboard__stat-detail">
              <el-tag type="success" effect="plain"> 利用可能 </el-tag>
            </div>
          </div>
          <div class="dashboard__card-actions">
            <el-button type="success" @click="navigateTo('/models')"> モデル管理 </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- Playback Card -->
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="dashboard__card dashboard__card--playback" shadow="hover">
          <template #header>
            <div class="dashboard__card-header">
              <el-icon :size="24" class="dashboard__card-icon">
                <VideoPlay />
              </el-icon>
              <span class="dashboard__card-title">再生管理</span>
            </div>
          </template>
          <div class="dashboard__card-content">
            <div class="dashboard__stat-number">{{ playbackStore.sessions.length }}</div>
            <div class="dashboard__stat-label">再生可能セッション数</div>
            <div class="dashboard__stat-detail">
              <el-tag type="info" effect="plain"> 記録済み </el-tag>
            </div>
          </div>
          <div class="dashboard__card-actions">
            <el-button type="warning" @click="navigateTo('/playback')"> 再生管理 </el-button>
          </div>
        </el-card>
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
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
  padding: 20px;

  &__header {
    margin-bottom: 30px;
    text-align: center;
  }

  &__title {
    color: #303133;
    font-size: 32px;
    font-weight: 600;
    margin: 0 0 10px;
  }

  &__subtitle {
    color: #909399;
    font-size: 16px;
    margin: 0;
  }

  &__stats {
    margin-bottom: 30px;
  }

  &__card {
    border-radius: 8px;
    margin-bottom: 20px;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
    }
  }

  &__card-header {
    align-items: center;
    display: flex;
    font-size: 18px;
    font-weight: 600;
    gap: 10px;
  }

  &__card-icon {
    flex-shrink: 0;
  }

  &__card-title {
    color: #303133;
  }

  &__card--training {
    border-top: 4px solid #409eff;

    .dashboard__card-icon {
      color: #409eff;
    }
  }

  &__card--models {
    border-top: 4px solid #67c23a;

    .dashboard__card-icon {
      color: #67c23a;
    }
  }

  &__card--playback {
    border-top: 4px solid #e6a23c;

    .dashboard__card-icon {
      color: #e6a23c;
    }
  }

  &__card-content {
    padding: 20px 0;
    text-align: center;
  }

  &__stat-number {
    color: #303133;
    font-size: 48px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 10px;
  }

  &__stat-label {
    color: #909399;
    font-size: 14px;
    margin-bottom: 15px;
  }

  &__stat-detail {
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  &__card-actions {
    border-top: 1px solid #ebeef5;
    padding-top: 15px;
    text-align: center;
  }

  &__quick-actions {
    margin-bottom: 20px;
  }

  &__quick-actions-card {
    border-radius: 8px;
  }

  &__section-title {
    color: #303133;
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

    &__stat-number {
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
