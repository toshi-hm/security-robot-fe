<script setup lang="ts">
import { VideoPlay, Refresh, Film, Timer } from '@element-plus/icons-vue'
import { onMounted, computed, ref } from 'vue'

import SearchFilter from '~/components/common/SearchFilter.vue'
import SessionStatusTag from '~/components/common/SessionStatusTag.vue'
import StatisticsCard from '~/components/common/StatisticsCard.vue'
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

const handleSearch = (value: string) => {
  searchQuery.value = value
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
        <StatisticsCard
          title="再生セッション"
          :value="totalSessions"
          label="再生可能セッション"
          color-theme="primary"
          :icon="VideoPlay"
        />
      </el-col>
      <el-col :span="8">
        <StatisticsCard
          title="総フレーム数"
          :value="totalFrames.toLocaleString()"
          label="録画済みフレーム"
          color-theme="secondary"
          :icon="Film"
        />
      </el-col>
      <el-col :span="8">
        <StatisticsCard
          title="平均継続時間"
          :value="formatDuration(averageDuration)"
          label="セッション平均"
          color-theme="tertiary"
          :icon="Timer"
        />
      </el-col>
    </el-row>

    <!-- Search and Filter -->
    <el-card class="playback__filter-card" shadow="never">
      <el-row :gutter="20">
        <el-col :span="12">
          <SearchFilter
            v-model="searchQuery"
            placeholder="セッションID、訓練ID、名前で検索..."
            @search="handleSearch"
          />
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
        <el-table-column label="ステータス" width="120">
          <template #default="{ row }">
            <SessionStatusTag :status="row.status" />
          </template>
        </el-table-column>
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

    .statistics-card {
      height: 100%;
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
