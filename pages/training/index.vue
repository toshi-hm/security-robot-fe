<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import SearchFilter from '~/components/common/SearchFilter.vue'
import SessionStatusTag from '~/components/common/SessionStatusTag.vue'
import TrainingControl from '~/components/training/TrainingControl.vue'

const { sessions, fetchSessions, isLoading } = useTraining()
const router = useRouter()

// Filter state
const searchQuery = ref('')

onMounted(async () => {
  await fetchSessions()
})

const handleSessionClick = (sessionId: number) => {
  router.push(`/training/${sessionId}`)
}

const filteredSessions = computed(() => {
  if (!searchQuery.value) {
    return sessions.value
  }

  const query = searchQuery.value.toLowerCase()
  return sessions.value.filter((session) => {
    return (
      session.id?.toString().includes(query) ||
      session.name?.toLowerCase().includes(query) ||
      session.algorithmDisplayName?.toLowerCase().includes(query) ||
      session.status?.toLowerCase().includes(query)
    )
  })
})

const handleSearch = (value: string) => {
  searchQuery.value = value
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

      <div class="training-page__filter">
        <SearchFilter
          v-model="searchQuery"
          placeholder="ID、名前、アルゴリズム、ステータスで検索..."
          @search="handleSearch"
        />
      </div>

      <el-table
        :data="filteredSessions"
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
            <SessionStatusTag :status="row.status" />
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

      <el-empty v-if="filteredSessions.length === 0 && !isLoading" description="学習セッションが見つかりません" />
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

  &__filter {
    margin-bottom: 20px;
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
