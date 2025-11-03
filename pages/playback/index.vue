<script setup lang="ts">
import { VideoPlay } from '@element-plus/icons-vue'
import { onMounted, computed, ref } from 'vue'

import { usePlaybackStore } from '~/stores/playback'

const router = useRouter()
const playbackStore = usePlaybackStore()

// Filter state
const searchQuery = ref('')

onMounted(async () => {
  await playbackStore.fetchSessions()
})

// Statistics
const totalSessions = computed(() => playbackStore.sessions.length)
const totalFrames = computed(() => playbackStore.sessions.reduce((sum, session) => sum + (session.frameCount || 0), 0))
const averageDuration = computed(() => {
  if (playbackStore.sessions.length === 0) return 0
  const totalSeconds = playbackStore.sessions.reduce((sum, session) => sum + (session.durationSeconds || 0), 0)
  return Math.round(totalSeconds / playbackStore.sessions.length)
})

// Filtered sessions
const filteredSessions = computed(() => {
  let sessions = playbackStore.sessions

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    sessions = sessions.filter(
      (session) =>
        session.id.toString().includes(query) ||
        session.sessionId?.toString().includes(query) ||
        session.name?.toLowerCase().includes(query)
    )
  }

  return sessions
})

const handleViewSession = (sessionId: string) => {
  router.push(`/playback/${sessionId}`)
}

const handleRefresh = async () => {
  await playbackStore.fetchSessions()
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleString('ja-JP')
}
</script>

<template>
  <div class="playback">
    <!-- Header -->
    <div class="playback__header">
      <div>
        <h2 class="playback__title">再生セッション</h2>
        <p class="playback__description">完了した訓練セッションの再生と分析</p>
      </div>
      <el-button type="primary" :loading="playbackStore.isLoading" @click="handleRefresh">
        <el-icon><Refresh /></el-icon>
        更新
      </el-button>
    </div>

    <!-- Statistics Cards -->
    <el-row :gutter="20" class="playback__statistics">
      <el-col :span="8">
        <el-card class="playback__stat-card playback__stat-card--primary" shadow="hover">
          <div class="playback__stat-content">
            <el-icon class="playback__stat-icon"><VideoPlay /></el-icon>
            <div>
              <div class="playback__stat-value">{{ totalSessions }}</div>
              <div class="playback__stat-label">再生可能セッション</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="playback__stat-card playback__stat-card--secondary" shadow="hover">
          <div class="playback__stat-content">
            <el-icon class="playback__stat-icon"><Film /></el-icon>
            <div>
              <div class="playback__stat-value">{{ totalFrames.toLocaleString() }}</div>
              <div class="playback__stat-label">総フレーム数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="playback__stat-card playback__stat-card--tertiary" shadow="hover">
          <div class="playback__stat-content">
            <el-icon class="playback__stat-icon"><Timer /></el-icon>
            <div>
              <div class="playback__stat-value">{{ formatDuration(averageDuration) }}</div>
              <div class="playback__stat-label">平均継続時間</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Search and Filter -->
    <el-card class="playback__filter-card" shadow="never">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input v-model="searchQuery" placeholder="セッションID、訓練ID、名前で検索..." clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
      </el-row>
    </el-card>

    <!-- Sessions Table -->
    <el-card v-loading="playbackStore.isLoading" class="playback__card" shadow="never">
      <el-alert
        v-if="playbackStore.error"
        :title="playbackStore.error"
        type="error"
        :closable="false"
        class="playback__error"
      />

      <el-empty
        v-if="filteredSessions.length === 0 && !playbackStore.isLoading"
        description="再生可能なセッションがありません"
      />

      <el-table v-else :data="filteredSessions" stripe style="width: 100%">
        <el-table-column prop="id" label="セッションID" width="120" />
        <el-table-column prop="sessionId" label="訓練ID" width="120" />
        <el-table-column prop="name" label="名前" min-width="150" />
        <el-table-column label="フレーム数" width="120">
          <template #default="{ row }">
            {{ row.frameCount?.toLocaleString() || 'N/A' }}
          </template>
        </el-table-column>
        <el-table-column label="記録日時" width="200">
          <template #default="{ row }">
            {{ row.recordedAt ? formatDate(row.recordedAt) : 'N/A' }}
          </template>
        </el-table-column>
        <el-table-column label="継続時間" width="120">
          <template #default="{ row }">
            {{ row.durationSeconds ? formatDuration(row.durationSeconds) : 'N/A' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleViewSession(row.id)">
              <el-icon><VideoPlay /></el-icon>
              再生
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.playback {
  padding: 20px;

  &__header {
    align-items: flex-start;
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
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

  &__statistics {
    margin-bottom: 24px;
  }

  &__stat-card {
    border: 1px solid var(--md-outline-variant);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
    }
  }

  &__stat-content {
    align-items: center;
    display: flex;
    gap: 16px;
  }

  &__stat-icon {
    font-size: 2.5rem;
  }

  &__stat-value {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 8px;
  }

  &__stat-label {
    color: var(--md-on-surface-variant);
    font-size: 0.875rem;
    font-weight: 500;
  }

  &__stat-card--primary {
    background: linear-gradient(135deg, var(--md-primary-container) 0%, var(--md-surface) 100%);
    border-color: var(--md-primary);

    .playback__stat-icon {
      color: var(--md-primary);
    }

    .playback__stat-value {
      color: var(--md-on-primary-container);
    }
  }

  &__stat-card--secondary {
    background: linear-gradient(135deg, var(--md-secondary-container) 0%, var(--md-surface) 100%);
    border-color: var(--md-secondary);

    .playback__stat-icon {
      color: var(--md-secondary);
    }

    .playback__stat-value {
      color: var(--md-on-secondary-container);
    }
  }

  &__stat-card--tertiary {
    background: linear-gradient(135deg, var(--md-tertiary-container) 0%, var(--md-surface) 100%);
    border-color: var(--md-tertiary);

    .playback__stat-icon {
      color: var(--md-tertiary);
    }

    .playback__stat-value {
      color: var(--md-on-tertiary-container);
    }
  }

  &__filter-card {
    background-color: var(--md-surface-1);
    border: 1px solid var(--md-outline-variant);
    margin-bottom: 20px;
  }

  &__card {
    background-color: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
  }

  &__error {
    margin-bottom: 20px;
  }
}
</style>
