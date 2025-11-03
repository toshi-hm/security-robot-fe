<script setup lang="ts">
import { onMounted, ref } from 'vue'

import TrainingControl from '~/components/training/TrainingControl.vue'

const { sessions, fetchSessions, isLoading } = useTraining()
const router = useRouter()

// Real-time updates via WebSocket
const activeSessionIds = ref<Set<number>>(new Set())

onMounted(async () => {
  await fetchSessions()

  // Track active sessions
  sessions.value.forEach((session) => {
    if (session.isRunning) {
      activeSessionIds.value.add(session.id)
    }
  })
})

const handleSessionClick = (sessionId: number) => {
  router.push(`/training/${sessionId}`)
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'running':
      return 'success'
    case 'paused':
      return 'warning'
    case 'completed':
      return 'info'
    case 'failed':
      return 'danger'
    default:
      return 'info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'running':
      return '実行中'
    case 'paused':
      return '一時停止'
    case 'completed':
      return '完了'
    case 'failed':
      return '失敗'
    case 'created':
      return '作成済み'
    default:
      return status
  }
}
</script>

<template>
  <div class="training-page">
    <div class="training-page__header">
      <h2>学習セッション</h2>
    </div>

    <el-card class="training-page__control">
      <TrainingControl />
    </el-card>

    <el-card v-loading="isLoading" class="training-page__sessions">
      <template #header>
        <div class="training-page__sessions-header">
          <span>アクティブセッション</span>
          <el-button size="small" :loading="isLoading" @click="fetchSessions">
            <i class="el-icon-refresh"></i> 更新
          </el-button>
        </div>
      </template>

      <el-table
        :data="sessions"
        style="width: 100%"
        :row-class-name="({ row }) => (row.isRunning ? 'active-row' : '')"
        @row-click="handleSessionClick"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="セッション名" min-width="150" />
        <el-table-column label="アルゴリズム" width="120">
          <template #default="{ row }">
            {{ row.algorithmDisplayName }}
          </template>
        </el-table-column>
        <el-table-column label="ステータス" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="進捗" width="120">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress"
              :status="row.progress === 100 ? 'success' : undefined"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column label="タイムステップ" width="150">
          <template #default="{ row }"> {{ row.currentTimestep }} / {{ row.totalTimesteps }} </template>
        </el-table-column>
        <el-table-column label="エピソード数" width="120">
          <template #default="{ row }">
            {{ row.episodesCompleted }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click.stop="handleSessionClick(row.id)">詳細を表示</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="sessions.length === 0 && !isLoading" description="学習セッションが見つかりません" />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.training-page {
  padding: 20px;

  &__header {
    margin-bottom: 20px;

    h2 {
      color: var(--md-on-background);
      font-size: 1.75rem;
      font-weight: 600;
      margin: 0;
    }
  }

  &__control {
    background-color: var(--md-surface-1);
    border: 1px solid var(--md-outline-variant);
    margin-bottom: 20px;
  }

  &__sessions {
    background-color: var(--md-surface);
    border: 1px solid var(--md-outline-variant);

    &-header {
      align-items: center;
      display: flex;
      justify-content: space-between;
    }
  }

  :deep(.active-row) {
    background-color: var(--md-primary-container);
    cursor: pointer;

    &:hover {
      background-color: var(--md-primary-container);
      filter: brightness(0.95);
    }
  }

  :deep(.el-table__row) {
    cursor: pointer;

    &:hover {
      background-color: var(--md-surface-2);
    }
  }
}
</style>
