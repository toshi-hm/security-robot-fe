<script setup lang="ts">
import type { TemplateAgentExecuteResponse, TemplateAgentEpisodeMetrics } from '~/types/api'

const props = defineProps<{
  executeResult: TemplateAgentExecuteResponse
  episodeMetricsTableData: TemplateAgentEpisodeMetrics[]
}>()
</script>

<template>
  <el-card class="template-agents__episodes-card">
    <template #header>
      <div class="template-agents__episodes-header">
        <span>エピソードメトリクス</span>
        <el-tag size="small" type="info">{{ executeResult.agent_name }}</el-tag>
      </div>
    </template>

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

    <el-table :data="episodeMetricsTableData" stripe class="template-agents__table">
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

  <el-card
    v-if="executeResult.episode_playbacks && executeResult.episode_playbacks.length > 0"
    class="template-agents__playback-card"
  >
    <template #header>
      <span>エピソードPlayback</span>
    </template>

    <div class="template-agents__playback-info">
      <el-alert type="info" :closable="false" show-icon>
        <template #title>Playback UI は準備中です。エピソード概要のみ表示します。</template>
      </el-alert>
    </div>

    <div class="template-agents__playback-grid">
      <div
        v-for="playback in executeResult.episode_playbacks"
        :key="playback.episode"
        class="template-agents__playback-button"
      >
        <span class="template-agents__playback-button-text">
          エピソード {{ playback.episode }}
          <br />
          <small>フレーム数: {{ playback.frames.length }} / 報酬: {{ playback.total_reward.toFixed(2) }}</small>
        </span>
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.template-agents {
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

  &__episodes-card {
    margin-bottom: 24px;
  }

  &__episodes-header {
    align-items: center;
    display: flex;
    gap: 12px;
    justify-content: space-between;
  }

  &__table {
    width: 100%;
  }

  &__playback-card {
    margin-bottom: 24px;
  }

  &__playback-info {
    margin-bottom: 16px;
  }

  &__playback-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }

  &__playback-button {
    height: auto;
    padding: 16px;
  }

  &__playback-button-text {
    display: block;
    line-height: 1.5;

    small {
      font-size: 11px;
      opacity: 0.8;
    }
  }
}
</style>
