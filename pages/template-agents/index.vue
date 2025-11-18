<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

import type { TemplateAgentType } from '~/types/api'

// Composable
const {
  agentTypes,
  executeResult,
  compareResult,
  isLoading,
  error,
  fetchAgentTypes,
  executeAgent,
  compareAgents,
  clearError,
  clearResults,
} = useTemplateAgents()

// 実行モード (単一 or 比較)
const executionMode = ref<'single' | 'compare'>('single')

// フォームデータ
const formData = ref({
  agentType: 'horizontal_scan' as TemplateAgentType,
  compareAgentTypes: [] as TemplateAgentType[],
  width: 10,
  height: 10,
  episodes: 10,
  maxSteps: 1000,
  seed: null as number | null,
})

// 実行可能かどうか
const canExecute = computed(() => {
  if (executionMode.value === 'single') {
    return formData.value.agentType !== null
  } else {
    return formData.value.compareAgentTypes.length >= 1
  }
})

// 初期化
onMounted(async () => {
  await fetchAgentTypes()
})

// 実行ハンドラ
const handleExecute = async () => {
  clearResults()

  if (executionMode.value === 'single') {
    await executeAgent({
      agent_type: formData.value.agentType,
      width: formData.value.width,
      height: formData.value.height,
      episodes: formData.value.episodes,
      max_steps: formData.value.maxSteps,
      seed: formData.value.seed,
    })
  } else {
    await compareAgents({
      agent_types: formData.value.compareAgentTypes,
      width: formData.value.width,
      height: formData.value.height,
      episodes: formData.value.episodes,
      max_steps: formData.value.maxSteps,
      seed: formData.value.seed,
    })
  }
}

// リセットハンドラ
const handleReset = () => {
  formData.value = {
    agentType: 'horizontal_scan',
    compareAgentTypes: [],
    width: 10,
    height: 10,
    episodes: 10,
    maxSteps: 1000,
    seed: null,
  }
  clearResults()
}
</script>

<template>
  <div class="template-agents">
    <div class="template-agents__header">
      <h1 class="template-agents__title">テンプレートエージェント</h1>
      <p class="template-agents__subtitle">事前定義された巡回パターンを持つエージェントの実行・比較</p>
    </div>

    <!-- エラー表示 -->
    <el-alert
      v-if="error"
      type="error"
      :title="error"
      :closable="true"
      show-icon
      class="template-agents__alert"
      @close="clearError"
    />

    <!-- 実行モード選択 -->
    <el-card class="template-agents__mode-card">
      <template #header>
        <span>実行モード</span>
      </template>
      <el-radio-group v-model="executionMode" class="template-agents__mode-group">
        <el-radio-button value="single">単一実行</el-radio-button>
        <el-radio-button value="compare">比較実行</el-radio-button>
      </el-radio-group>
    </el-card>

    <!-- パラメータ設定フォーム -->
    <el-card class="template-agents__config-card">
      <template #header>
        <span>実行設定</span>
      </template>
      <el-form :model="formData" label-width="180px" label-position="left" class="template-agents__form">
        <!-- エージェントタイプ選択 (単一モード) -->
        <el-form-item v-if="executionMode === 'single'" label="エージェントタイプ">
          <el-select v-model="formData.agentType" placeholder="エージェントを選択">
            <el-option v-for="type in agentTypes" :key="type.type" :label="type.name" :value="type.type">
              <span>{{ type.name }}</span>
              <span style="color: var(--el-text-color-secondary); font-size: 12px; margin-left: 8px">
                {{ type.description }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- エージェントタイプ選択 (比較モード) -->
        <el-form-item v-if="executionMode === 'compare'" label="比較対象エージェント">
          <el-checkbox-group v-model="formData.compareAgentTypes">
            <el-checkbox v-for="type in agentTypes" :key="type.type" :value="type.type" :label="type.name">
              <span>{{ type.name }}</span>
              <span style="color: var(--el-text-color-secondary); font-size: 12px; margin-left: 4px">
                ({{ type.description }})
              </span>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <!-- グリッドサイズ -->
        <el-form-item label="グリッド幅">
          <el-input-number v-model="formData.width" :min="3" :max="100" :step="1" />
        </el-form-item>

        <el-form-item label="グリッド高さ">
          <el-input-number v-model="formData.height" :min="3" :max="100" :step="1" />
        </el-form-item>

        <!-- 実行パラメータ -->
        <el-form-item label="エピソード数">
          <el-input-number v-model="formData.episodes" :min="1" :max="100" :step="1" />
        </el-form-item>

        <el-form-item label="最大ステップ数">
          <el-input-number v-model="formData.maxSteps" :min="10" :max="10000" :step="100" />
        </el-form-item>

        <el-form-item label="ランダムシード (オプション)">
          <el-input-number v-model="formData.seed" :min="0" :max="999999" :step="1" placeholder="未設定（ランダム）" />
        </el-form-item>

        <!-- 実行ボタン -->
        <el-form-item>
          <el-button type="primary" :loading="isLoading" :disabled="!canExecute" @click="handleExecute">
            {{ executionMode === 'single' ? '実行' : '比較実行' }}
          </el-button>
          <el-button @click="handleReset">リセット</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 単一実行結果 -->
    <template v-if="executionMode === 'single' && executeResult">
      <el-card class="template-agents__result-card">
        <template #header>
          <span>実行結果 - {{ executeResult.agent_name }}</span>
        </template>

        <!-- サマリー統計 -->
        <div class="template-agents__summary">
          <div class="template-agents__stat">
            <div class="template-agents__stat-label">平均報酬</div>
            <div class="template-agents__stat-value">
              {{ executeResult.average_reward.toFixed(2) }}
            </div>
          </div>
          <div class="template-agents__stat">
            <div class="template-agents__stat-label">平均カバレッジ</div>
            <div class="template-agents__stat-value">{{ (executeResult.average_coverage * 100).toFixed(1) }}%</div>
          </div>
          <div class="template-agents__stat">
            <div class="template-agents__stat-label">平均エピソード長</div>
            <div class="template-agents__stat-value">
              {{ executeResult.average_episode_length.toFixed(0) }}
            </div>
          </div>
          <div class="template-agents__stat">
            <div class="template-agents__stat-label">平均バッテリー最小値</div>
            <div class="template-agents__stat-value">{{ executeResult.average_min_battery.toFixed(1) }}%</div>
          </div>
        </div>

        <!-- エピソード詳細テーブル -->
        <el-table :data="executeResult.episode_metrics as any" stripe class="template-agents__table">
          <el-table-column prop="episode" label="エピソード" width="100" />
          <el-table-column prop="total_reward" label="報酬" width="100">
            <template #default="{ row }">
              {{ row.total_reward.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="coverage_ratio" label="カバレッジ" width="120">
            <template #default="{ row }"> {{ (row.coverage_ratio * 100).toFixed(1) }}% </template>
          </el-table-column>
          <el-table-column prop="episode_length" label="ステップ数" width="120" />
          <el-table-column prop="patrol_count" label="巡回回数" width="100" />
          <el-table-column prop="min_battery" label="最小バッテリー" width="140">
            <template #default="{ row }"> {{ row.min_battery.toFixed(1) }}% </template>
          </el-table-column>
          <el-table-column prop="battery_deaths" label="バッテリー切れ" width="140" />
        </el-table>
      </el-card>
    </template>

    <!-- 比較実行結果 -->
    <template v-if="executionMode === 'compare' && compareResult">
      <el-card class="template-agents__result-card">
        <template #header>
          <span>比較結果</span>
        </template>

        <!-- 最良・最悪エージェント表示 -->
        <div class="template-agents__comparison-summary">
          <el-alert type="success" :closable="false" show-icon class="template-agents__best-agent">
            <template #title>
              最良エージェント: <strong>{{ compareResult.best_agent }}</strong>
            </template>
          </el-alert>
          <el-alert type="info" :closable="false" show-icon class="template-agents__worst-agent">
            <template #title>
              最劣エージェント: <strong>{{ compareResult.worst_agent }}</strong>
            </template>
          </el-alert>
          <div class="template-agents__performance-gap">
            <span>性能差: </span>
            <strong>{{ compareResult.performance_gap.toFixed(2) }}</strong>
          </div>
        </div>

        <!-- 比較テーブル -->
        <el-table :data="compareResult.results as any" stripe class="template-agents__table">
          <el-table-column prop="rank" label="順位" width="80">
            <template #default="{ row }">
              <el-tag v-if="row.rank === 1" type="success">🥇 {{ row.rank }}</el-tag>
              <el-tag v-else-if="row.rank === 2" type="warning">🥈 {{ row.rank }}</el-tag>
              <el-tag v-else-if="row.rank === 3" type="info">🥉 {{ row.rank }}</el-tag>
              <el-tag v-else>{{ row.rank }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="agent_name" label="エージェント" width="180" />
          <el-table-column prop="average_reward" label="平均報酬" width="120">
            <template #default="{ row }">
              {{ row.average_reward.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="average_coverage" label="平均カバレッジ" width="140">
            <template #default="{ row }"> {{ (row.average_coverage * 100).toFixed(1) }}% </template>
          </el-table-column>
          <el-table-column prop="average_episode_length" label="平均ステップ数" width="140">
            <template #default="{ row }">
              {{ row.average_episode_length.toFixed(0) }}
            </template>
          </el-table-column>
          <el-table-column prop="average_min_battery" label="平均最小バッテリー" width="160">
            <template #default="{ row }"> {{ row.average_min_battery.toFixed(1) }}% </template>
          </el-table-column>
          <el-table-column prop="total_battery_deaths" label="バッテリー切れ" width="140" />
        </el-table>
      </el-card>
    </template>
  </div>
</template>

<style scoped lang="scss">
.template-agents {
  margin: 0 auto;
  max-width: 1400px;
  padding: 24px;

  &__header {
    margin-bottom: 24px;
  }

  &__title {
    color: var(--md-sys-color-on-background, #1c1b1f);
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 8px;
  }

  &__subtitle {
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-size: 14px;
    margin: 0;
  }

  &__alert {
    margin-bottom: 16px;
  }

  &__mode-card,
  &__config-card,
  &__result-card {
    margin-bottom: 24px;
  }

  &__mode-group {
    width: 100%;
  }

  &__form {
    max-width: 600px;
  }

  &__summary {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    margin-bottom: 24px;
  }

  &__stat {
    background: linear-gradient(
      135deg,
      var(--md-sys-color-primary-container, #eaddff) 0%,
      var(--md-sys-color-surface, #fefbff) 100%
    );
    border: 1px solid var(--md-sys-color-outline-variant, #c9c5d0);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
  }

  &__stat-label {
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-size: 12px;
    margin-bottom: 8px;
  }

  &__stat-value {
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-size: 24px;
    font-weight: 700;
  }

  &__comparison-summary {
    align-items: center;
    display: grid;
    gap: 16px;
    grid-template-columns: 1fr 1fr auto;
    margin-bottom: 24px;
  }

  &__performance-gap {
    background: var(--md-sys-color-surface-variant, #e7e0ec);
    border-radius: 8px;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-size: 14px;
    padding: 16px;
    text-align: center;

    strong {
      color: var(--md-sys-color-primary, #6442d6);
      font-size: 18px;
    }
  }

  &__table {
    width: 100%;
  }
}
</style>
