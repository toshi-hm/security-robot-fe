<script setup lang="ts">
import { onMounted } from 'vue'

import { usePlaybackStore } from '~/stores/playback'

const router = useRouter()
const playbackStore = usePlaybackStore()

onMounted(async () => {
  await playbackStore.fetchSessions()
})

const handleViewSession = (sessionId: string) => {
  router.push(`/playback/${sessionId}`)
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
    <div class="playback__header">
      <div>
        <h2 class="playback__title">再生セッション</h2>
        <p class="playback__description">完了した訓練セッションの再生</p>
      </div>
    </div>

    <el-card v-loading="playbackStore.isLoading" class="playback__card">
      <el-alert
        v-if="playbackStore.error"
        :title="playbackStore.error"
        type="error"
        :closable="false"
        class="playback__error"
      />

      <el-empty
        v-if="playbackStore.sessions.length === 0 && !playbackStore.isLoading"
        description="再生可能なセッションがありません"
      />

      <el-table v-else :data="playbackStore.sessions" stripe style="width: 100%">
        <el-table-column prop="id" label="セッションID" width="120" />
        <el-table-column prop="sessionId" label="訓練ID" width="120" />
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
            <el-button size="small" type="primary" @click="handleViewSession(row.id)"> 再生 </el-button>
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
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  &__title {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  &__description {
    color: #909399;
    font-size: 0.875rem;
  }

  &__card {
    margin-top: 20px;
  }

  &__error {
    margin-bottom: 20px;
  }
}
</style>
