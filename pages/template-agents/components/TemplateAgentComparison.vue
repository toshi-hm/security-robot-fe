<script setup lang="ts">
import type { TemplateAgentCompareResponse } from '~/types/api'

const props = defineProps<{
  compareResult: TemplateAgentCompareResponse
  comparisonResultsTableData: TemplateAgentCompareResponse['results']
}>()
</script>

<template>
  <el-card class="template-agents__result-card">
    <template #header>
      <span>比較結果</span>
    </template>

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

    <el-table :data="comparisonResultsTableData" stripe class="template-agents__table">
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

<style scoped lang="scss">
.template-agents {
  &__result-card {
    margin-bottom: 24px;
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
