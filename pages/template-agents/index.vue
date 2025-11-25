<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useTemplateAgents } from '~/composables/useTemplateAgents'
import { useTemplateAgentVisualization } from '~/composables/useTemplateAgentVisualization'
import {
  TEMPLATE_AGENT_GRID_MIN,
  TEMPLATE_AGENT_GRID_MAX,
  TEMPLATE_AGENT_SEED_MIN,
  TEMPLATE_AGENT_SEED_MAX,
} from '~/configs/constants'
import type {
  TemplateAgentEpisodeMetrics,
  TemplateAgentEpisodePlayback,
  TemplateAgentEnvironmentInfo,
} from '~/types/api'
import type { TemplateAgentExecutionMode, TemplateAgentFormData } from '~/types/template-agent-page'

import TemplateAgentComparison from './components/TemplateAgentComparison.vue'
import TemplateAgentEnvironment from './components/TemplateAgentEnvironment.vue'
import TemplateAgentForm from './components/TemplateAgentForm.vue'
import TemplateAgentResults from './components/TemplateAgentResults.vue'

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

const validationError = ref<string | null>(null)

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

  // パフォーマンス最適化: 必要な場合のみコピーを作成し、不変データは参照を維持
  return {
    ...result,
    episode_metrics: [...result.episode_metrics] as TemplateAgentEpisodeMetrics[],
    episode_playbacks: result.episode_playbacks as TemplateAgentEpisodePlayback[] | undefined,
    environment_info: result.environment_info as TemplateAgentEnvironmentInfo | undefined,
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

const validateFormData = (): boolean => {
  validationError.value = null

  // グリッドサイズ検証
  if (formData.value.width < TEMPLATE_AGENT_GRID_MIN || formData.value.width > TEMPLATE_AGENT_GRID_MAX) {
    validationError.value = `幅は${TEMPLATE_AGENT_GRID_MIN}〜${TEMPLATE_AGENT_GRID_MAX}の範囲で指定してください`
    return false
  }

  if (formData.value.height < TEMPLATE_AGENT_GRID_MIN || formData.value.height > TEMPLATE_AGENT_GRID_MAX) {
    validationError.value = `高さは${TEMPLATE_AGENT_GRID_MIN}〜${TEMPLATE_AGENT_GRID_MAX}の範囲で指定してください`
    return false
  }

  // シード値検証
  if (formData.value.seed !== null && formData.value.seed !== undefined) {
    if (
      !Number.isInteger(formData.value.seed) ||
      formData.value.seed < TEMPLATE_AGENT_SEED_MIN ||
      formData.value.seed > TEMPLATE_AGENT_SEED_MAX
    ) {
      validationError.value = `シード値は${TEMPLATE_AGENT_SEED_MIN}〜${TEMPLATE_AGENT_SEED_MAX}の整数で指定してください`
      return false
    }
  }

  return true
}

const handleExecute = async () => {
  if (!validateFormData()) return
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
  validationError.value = null
}

const clearAllErrors = () => {
  clearError()
  validationError.value = null
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
      v-if="error || validationError"
      type="error"
      :title="error || validationError || ''"
      :closable="true"
      show-icon
      class="template-agents__alert"
      @close="clearAllErrors"
    />

    <el-progress
      v-if="isLoading"
      :percentage="50"
      :indeterminate="true"
      :text-inside="true"
      class="template-agents__progress"
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

  &__progress {
    margin-bottom: 16px;
    max-width: 480px;
  }
}
</style>
