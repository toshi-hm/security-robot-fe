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
      <h2>Training Sessions</h2>
    </div>

    <el-card class="training-page__control">
      <TrainingControl />
    </el-card>

    <el-card v-loading="isLoading" class="training-page__sessions">
      <template #header>
        <div class="training-page__sessions-header">
          <span>Active Sessions</span>
          <el-button size="small" :loading="isLoading" @click="fetchSessions">
            <i class="el-icon-refresh"></i> Refresh
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
        <el-table-column prop="name" label="Name" min-width="150" />
        <el-table-column label="Algorithm" width="120">
          <template #default="{ row }">
            {{ row.algorithmDisplayName }}
          </template>
        </el-table-column>
        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Progress" width="120">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress"
              :status="row.progress === 100 ? 'success' : undefined"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column label="Timestep" width="150">
          <template #default="{ row }"> {{ row.currentTimestep }} / {{ row.totalTimesteps }} </template>
        </el-table-column>
        <el-table-column label="Episodes" width="100">
          <template #default="{ row }">
            {{ row.episodesCompleted }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click.stop="handleSessionClick(row.id)"> View Details </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="sessions.length === 0 && !isLoading" description="No training sessions found" />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.training-page {
  padding: 20px;

  &__header {
    margin-bottom: 20px;

    h2 {
      margin: 0;
    }
  }

  &__control {
    margin-bottom: 20px;
  }

  &__sessions {
    &-header {
      align-items: center;
      display: flex;
      justify-content: space-between;
    }
  }

  :deep(.active-row) {
    background-color: #f0f9ff;
    cursor: pointer;

    &:hover {
      background-color: #e0f2fe;
    }
  }

  :deep(.el-table__row) {
    cursor: pointer;

    &:hover {
      background-color: #f5f7fa;
    }
  }
}
</style>
