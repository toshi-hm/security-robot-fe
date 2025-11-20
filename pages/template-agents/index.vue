<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useTemplateAgents } from '~/composables/useTemplateAgents'

import TemplateAgentComparison from './components/TemplateAgentComparison.vue'
import TemplateAgentEnvironment from './components/TemplateAgentEnvironment.vue'
import TemplateAgentForm from './components/TemplateAgentForm.vue'
import TemplateAgentResults from './components/TemplateAgentResults.vue'
import { useTemplateAgentVisualization } from './composables/useTemplateAgentVisualization'

import type { TemplateAgentExecutionMode, TemplateAgentFormData } from './types'

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

const executionMode = ref<TemplateAgentExecutionMode>('single')
const formData = ref<TemplateAgentFormData>({
  agentType: 'horizontal_scan',
  compareAgentTypes: [],
  width: 10,
  height: 10,
  episodes: 10,
  maxSteps: 1000,
  seed: null,
  useDynamicMaxSteps: true,
})

const compareSelectionValid = computed(() => formData.value.compareAgentTypes.length >= 2)

const canExecute = computed(() => {
  if (executionMode.value === 'single') {
    return formData.value.agentType !== null
  }
  return compareSelectionValid.value
})

const episodeMetricsTableData = computed(() => {
  if (!executeResult.value?.episode_metrics) return []
  return [...executeResult.value.episode_metrics]
})

const comparisonResultsTableData = computed(() => {
  if (!compareResult.value?.results) return []
  return [...compareResult.value.results]
})

const mutableAgentTypes = computed(() => {
  return agentTypes.value.map((type) => ({ ...type }))
})

const mutableExecuteResult = computed(() => {
  if (!executeResult.value) return null
  const result = executeResult.value
  return {
    ...result,
    episode_metrics: [...result.episode_metrics],
    episode_playbacks: result.episode_playbacks
      ? result.episode_playbacks.map((playback) => ({
          ...playback,
          frames: playback.frames.map((frame) => ({
            ...frame,
            coverage_map: frame.coverage_map.map((row) => [...row]),
            threat_grid: frame.threat_grid ? frame.threat_grid.map((row) => [...row]) : undefined,
          })),
        }))
      : undefined,
    environment_info: result.environment_info
      ? {
          ...result.environment_info,
          threat_grid: result.environment_info.threat_grid.map((row) => [...row]),
          obstacles: result.environment_info.obstacles.map((row) => [...row]),
          suspicious_objects: [...result.environment_info.suspicious_objects],
        }
      : undefined,
  }
})

const mutableCompareResult = computed(() => {
  if (!compareResult.value) return null
  return {
    ...compareResult.value,
    results: [...compareResult.value.results],
  }
})

onMounted(async () => {
  await fetchAgentTypes()
})

const dynamicMaxSteps = computed(() => {
  const width = Math.max(1, formData.value.width)
  const height = Math.max(1, formData.value.height)
  return Math.max(1000, width * height * 4)
})

const dynamicMaxStepsDescription = computed(() => {
  const steps = dynamicMaxSteps.value.toLocaleString('ja-JP')
  return `${formData.value.width} × ${formData.value.height} グリッド → ${steps} ステップ`
})

const maxStepsHint = computed(() => {
  if (formData.value.useDynamicMaxSteps) {
    return `環境サイズに応じて自動計算: ${dynamicMaxStepsDescription.value}`
  }
  return 'カスタム上限を指定しています（10〜10,000ステップ）'
})

const selectedMaxSteps = computed<number | undefined>(() => {
  return formData.value.useDynamicMaxSteps ? undefined : formData.value.maxSteps
})

const handleExecute = async () => {
  clearResults()

  const payloadMaxSteps = selectedMaxSteps.value
  const requestSeed = formData.value.seed === null ? undefined : formData.value.seed

  if (executionMode.value === 'single') {
    await executeAgent({
      agent_type: formData.value.agentType,
      width: formData.value.width,
      height: formData.value.height,
      episodes: formData.value.episodes,
      max_steps: payloadMaxSteps,
      seed: requestSeed,
      save_frames: true,
    })
  } else {
    await compareAgents({
      agent_types: formData.value.compareAgentTypes,
      width: formData.value.width,
      height: formData.value.height,
      episodes: formData.value.episodes,
      max_steps: payloadMaxSteps,
      seed: requestSeed,
    })
  }
}

const handleReset = () => {
  formData.value = {
    agentType: 'horizontal_scan',
    compareAgentTypes: [],
    width: 10,
    height: 10,
    episodes: 10,
    maxSteps: 1000,
    seed: null,
    useDynamicMaxSteps: true,
  }
  clearResults()
}

const visualization = useTemplateAgentVisualization(mutableExecuteResult)
const { environmentInfo, environmentVisualizationProps, routeStats, routeWaypoints, suspiciousObjects } = visualization
</script>

<template>
  <div class="template-agents">
    <div class="template-agents__header">
      <h1 class="template-agents__title">テンプレートエージェント</h1>
      <p class="template-agents__subtitle">事前定義された巡回パターンを持つエージェントの実行・比較</p>
    </div>

    <el-alert
      v-if="error"
      type="error"
      :title="error"
      :closable="true"
      show-icon
      class="template-agents__alert"
      @close="clearError"
    />

    <TemplateAgentForm
      :execution-mode="executionMode"
      :form-data="formData"
      :agent-types="mutableAgentTypes"
      :compare-selection-valid="compareSelectionValid"
      :can-execute="canExecute"
      :max-steps-hint="maxStepsHint"
      :is-loading="isLoading"
      @update:execution-mode="executionMode = $event"
      @update:form-data="formData = $event"
      @execute="handleExecute"
      @reset="handleReset"
    />

    <TemplateAgentEnvironment
      v-if="executionMode === 'single' && mutableExecuteResult"
      :execute-result="mutableExecuteResult"
      :environment-info="environmentInfo"
      :environment-visualization-props="environmentVisualizationProps"
      :route-stats="routeStats"
      :route-waypoints="routeWaypoints"
      :suspicious-objects="suspiciousObjects"
    />

    <TemplateAgentResults
      v-if="executionMode === 'single' && mutableExecuteResult"
      :execute-result="mutableExecuteResult"
      :episode-metrics-table-data="episodeMetricsTableData"
    />

    <TemplateAgentComparison
      v-if="executionMode === 'compare' && mutableCompareResult"
      :compare-result="mutableCompareResult"
      :comparison-results-table-data="comparisonResultsTableData"
    />
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
}
</style>
