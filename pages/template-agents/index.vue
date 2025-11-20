<script setup lang="ts">
import { ref, computed, onMounted, shallowRef, watch } from 'vue'

import EnvironmentVisualization from '~/components/environment/EnvironmentVisualization.vue'
import {
  TEMPLATE_AGENT_GRID_MAX,
  TEMPLATE_AGENT_GRID_MIN,
  TEMPLATE_AGENT_SEED_MAX,
  TEMPLATE_AGENT_SEED_MIN,
  ROUTE_PREVIEW_LIMIT,
} from '~/configs/constants'
import type { Position } from '~/libs/domains/common/Position'
import type { TemplateAgentType, TemplateAgentFrameData, TemplateAgentExecuteResponse } from '~/types/api'
import { calculateAverageThreat, calculateMaxThreat, countObstacles, normalizeGridMatrix } from '~/utils/gridHelpers'

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
interface TemplateAgentFormData {
  agentType: TemplateAgentType
  compareAgentTypes: TemplateAgentType[]
  width: number
  height: number
  episodes: number
  maxSteps: number
  seed: number | null
  useDynamicMaxSteps: boolean
}

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

// 実行可能かどうか
const compareSelectionValid = computed(() => formData.value.compareAgentTypes.length >= 2)

const canExecute = computed(() => {
  if (executionMode.value === 'single') {
    return formData.value.agentType !== null
  }
  return compareSelectionValid.value
})

// el-table用データ (readonly配列を通常配列に変換)
const episodeMetricsTableData = computed(() => {
  if (!executeResult.value?.episode_metrics) return []
  return [...executeResult.value.episode_metrics]
})

const comparisonResultsTableData = computed(() => {
  if (!compareResult.value?.results) return []
  return [...compareResult.value.results]
})

// 初期化
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

// 実行ハンドラ
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
    useDynamicMaxSteps: true,
  }
  clearResults()
}

const environmentInfo = computed(() => executeResult.value?.environment_info ?? null)

let cachedExecutionId: string | null = null
let cachedPlaybacksRef: TemplateAgentExecuteResponse['episode_playbacks'] | null = null
let cachedPlaybackFrameCount = 0
let cachedPlaybackFrames: TemplateAgentFrameData[] = []

const playbackFrames = computed<TemplateAgentFrameData[]>(() => {
  const result = executeResult.value as TemplateAgentExecuteResponse | null
  const playbacks = result?.episode_playbacks ?? []
  const executionId = result?.execution_id ?? null

  if (!playbacks.length) {
    cachedExecutionId = null
    cachedPlaybacksRef = null
    cachedPlaybackFrameCount = 0
    cachedPlaybackFrames = []
    return cachedPlaybackFrames
  }

  const frameCount = playbacks.reduce((total, episode) => total + (episode.frames?.length ?? 0), 0)

  if (
    executionId === cachedExecutionId &&
    cachedPlaybacksRef === playbacks &&
    cachedPlaybackFrameCount === frameCount &&
    cachedPlaybackFrames.length
  ) {
    return cachedPlaybackFrames
  }

  cachedPlaybackFrames = playbacks.flatMap((episode) => episode.frames ?? [])
  cachedExecutionId = executionId
  cachedPlaybacksRef = playbacks
  cachedPlaybackFrameCount = frameCount

  return cachedPlaybackFrames
})

const latestFrame = computed<TemplateAgentFrameData | null>(() => {
  const frames = playbackFrames.value
  if (!frames.length) return null
  return frames[frames.length - 1] ?? null
})

const createEmptyCoverageMap = (width: number, height: number): number[][] => {
  if (width <= 0 || height <= 0) return []
  return Array.from({ length: height }, () => Array.from({ length: width }, () => 0))
}

const coverageMap = computed<number[][]>(() => {
  if (latestFrame.value?.coverage_map?.length) {
    return normalizeGridMatrix(latestFrame.value.coverage_map)
  }
  const info = environmentInfo.value
  if (!info) return []
  return createEmptyCoverageMap(info.width, info.height)
})

const threatGrid = computed<number[][]>(() => {
  if (latestFrame.value?.threat_grid?.length) {
    return normalizeGridMatrix(latestFrame.value.threat_grid)
  }
  const grid = environmentInfo.value?.threat_grid
  if (grid) {
    return normalizeGridMatrix(grid)
  }
  return []
})

const robotPosition = computed<Position | null>(() => {
  const frame = latestFrame.value
  if (!frame) return null
  return { x: frame.robot_x, y: frame.robot_y }
})

const robotOrientation = computed<number | null>(() => {
  if (typeof latestFrame.value?.robot_orientation === 'number') {
    return latestFrame.value.robot_orientation
  }
  return null
})

const robotTrajectory = shallowRef<Position[]>([])
const processedFrameCount = ref(0)

const appendTrajectory = (frames: TemplateAgentFrameData[], startIndex: number) => {
  if (!frames.length) {
    robotTrajectory.value = []
    processedFrameCount.value = 0
    return
  }

  let updated = robotTrajectory.value
  let mutated = false

  for (let index = startIndex; index < frames.length; index += 1) {
    const frame = frames[index]
    const previous = updated[updated.length - 1]
    if (!previous || previous.x !== frame.robot_x || previous.y !== frame.robot_y) {
      if (!mutated) {
        updated = [...updated]
        mutated = true
      }
      updated.push({ x: frame.robot_x, y: frame.robot_y })
    }
  }

  if (mutated || startIndex === 0) {
    robotTrajectory.value = updated
  }

  processedFrameCount.value = frames.length
}

watch(
  () => playbackFrames.value,
  (frames) => {
    // 新しい実行結果が来たらキャッシュをリセットして再構築
    processedFrameCount.value = 0
    robotTrajectory.value = []
    appendTrajectory(frames, 0)
  },
  { immediate: true, deep: false },
)

watch(
  () => playbackFrames.value.length,
  (length, previousLength) => {
    const frames = playbackFrames.value

    // 巻き戻し（クリア）検知: 長さが減ったら全再計算
    if (length < previousLength) {
      processedFrameCount.value = 0
      robotTrajectory.value = []
      appendTrajectory(frames, 0)
      return
    }

    if (length === processedFrameCount.value) return

    appendTrajectory(frames, processedFrameCount.value)
  },
)

const routeWaypoints = computed<Position[]>(() => {
  const trajectory = robotTrajectory.value
  if (!trajectory.length) return []

  if (trajectory.length <= ROUTE_PREVIEW_LIMIT) {
    return trajectory
  }

  const preview: Position[] = []
  const interval = Math.ceil(trajectory.length / ROUTE_PREVIEW_LIMIT)
  for (let index = 0; index < trajectory.length; index += interval) {
    const point = trajectory[index]
    if (point) {
      preview.push(point)
    }
  }

  const lastPoint = trajectory[trajectory.length - 1]
  const previewLastPoint = preview[preview.length - 1]
  if (lastPoint && (!previewLastPoint || previewLastPoint.x !== lastPoint.x || previewLastPoint.y !== lastPoint.y)) {
    preview.push(lastPoint)
  }

  return preview
})

const chargingStationPosition = computed<Position | null>(() => {
  const station = environmentInfo.value?.charging_station
  if (!station) return null
  return { x: station.x, y: station.y }
})

const countVisitedTiles = (grid: number[][]): number => {
  if (!grid?.length) return 0
  return grid.reduce((total, row) => {
    return (
      total +
      row.reduce((rowCount, cell) => {
        return rowCount + (cell > 0 ? 1 : 0)
      }, 0)
    )
  }, 0)
}

const routeStats = computed(() => {
  const info = environmentInfo.value
  if (!info) {
    return {
      visitedTiles: 0,
      totalTiles: 0,
      visitedRatio: 0,
      stepCount: playbackFrames.value.length,
      pathLength: robotTrajectory.value.length,
      start: null,
      end: null,
    }
  }

  const totalTiles = info.width * info.height
  const visitedTiles = countVisitedTiles(coverageMap.value)
  const start = robotTrajectory.value[0] ?? null
  const end = robotTrajectory.value[robotTrajectory.value.length - 1] ?? null

  return {
    visitedTiles,
    totalTiles,
    visitedRatio: totalTiles ? (visitedTiles / totalTiles) * 100 : 0,
    stepCount: playbackFrames.value.length,
    pathLength: robotTrajectory.value.length,
    start,
    end,
  }
})

const environmentVisualizationProps = computed(() => {
  const info = environmentInfo.value
  if (!info) return null

  return {
    gridWidth: info.width,
    gridHeight: info.height,
    threatGrid: threatGrid.value,
    coverageMap: coverageMap.value,
    robotPosition: robotPosition.value,
    robotOrientation: robotOrientation.value,
    trajectory: robotTrajectory.value,
    chargingStationPosition: chargingStationPosition.value,
  }
})

const suspiciousObjects = computed(() => environmentInfo.value?.suspicious_objects ?? [])

const formatCoordinate = (position: Position | null): string => {
  if (!position) return '-'
  return `(${position.x}, ${position.y})`
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
            <el-checkbox v-for="type in agentTypes" :key="type.type" :value="type.type" :label="type.type">
              <span>{{ type.name }}</span>
              <span style="color: var(--el-text-color-secondary); font-size: 12px; margin-left: 4px">
                ({{ type.description }})
              </span>
            </el-checkbox>
          </el-checkbox-group>
          <p v-if="!compareSelectionValid" class="template-agents__form-hint">
            比較モードでは2つ以上のエージェントを選択してください
          </p>
        </el-form-item>

        <!-- グリッドサイズ -->
        <el-form-item label="グリッド幅">
          <el-input-number
            v-model="formData.width"
            :min="TEMPLATE_AGENT_GRID_MIN"
            :max="TEMPLATE_AGENT_GRID_MAX"
            :step="1"
          />
        </el-form-item>

        <el-form-item label="グリッド高さ">
          <el-input-number
            v-model="formData.height"
            :min="TEMPLATE_AGENT_GRID_MIN"
            :max="TEMPLATE_AGENT_GRID_MAX"
            :step="1"
          />
        </el-form-item>

        <!-- 実行パラメータ -->
        <el-form-item label="エピソード数">
          <el-input-number v-model="formData.episodes" :min="1" :max="100" :step="1" />
        </el-form-item>

        <el-form-item label="最大ステップ数">
          <div class="template-agents__max-steps-controls">
            <el-switch v-model="formData.useDynamicMaxSteps" active-text="動的計算" inactive-text="カスタム" />
            <el-input-number
              v-model="formData.maxSteps"
              :min="10"
              :max="10000"
              :step="100"
              :disabled="formData.useDynamicMaxSteps"
            />
          </div>
          <p class="template-agents__form-hint">{{ maxStepsHint }}</p>
        </el-form-item>

        <el-form-item label="ランダムシード (オプション)">
          <el-input-number
            v-model="formData.seed"
            :min="TEMPLATE_AGENT_SEED_MIN"
            :max="TEMPLATE_AGENT_SEED_MAX"
            :step="1"
            placeholder="未設定（ランダム）"
          />
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

    <!-- 単一実行時の環境可視化 -->
    <template v-if="executionMode === 'single' && executeResult">
      <el-card class="template-agents__environment-card">
        <template #header>
          <div class="template-agents__env-header">
            <div>
              <div class="template-agents__env-title">環境情報</div>
              <p class="template-agents__env-subtitle">
                {{ executeResult.agent_name }} / {{ executeResult.environment.width }} ×
                {{ executeResult.environment.height }} グリッド
              </p>
            </div>
            <el-tag type="primary" effect="dark"> 実行ID: {{ executeResult.execution_id }} </el-tag>
          </div>
        </template>

        <div v-if="environmentVisualizationProps" class="template-agents__environment-content">
          <div class="template-agents__visualization-wrapper">
            <EnvironmentVisualization
              :grid-width="environmentVisualizationProps.gridWidth"
              :grid-height="environmentVisualizationProps.gridHeight"
              :threat-grid="environmentVisualizationProps.threatGrid"
              :coverage-map="environmentVisualizationProps.coverageMap"
              :robot-position="environmentVisualizationProps.robotPosition"
              :robot-orientation="environmentVisualizationProps.robotOrientation"
              :trajectory="environmentVisualizationProps.trajectory"
              :charging-station-position="environmentVisualizationProps.chargingStationPosition"
            />
          </div>

          <div class="template-agents__environment-details">
            <div class="template-agents__env-section">
              <div class="template-agents__env-section-title">静的情報</div>
              <div class="template-agents__environment-grid">
                <div class="template-agents__env-stat">
                  <div class="template-agents__env-label">グリッドサイズ</div>
                  <div class="template-agents__env-value">
                    {{ environmentInfo?.width ?? '-' }} × {{ environmentInfo?.height ?? '-' }}
                  </div>
                </div>
                <div class="template-agents__env-stat">
                  <div class="template-agents__env-label">障害物数</div>
                  <div class="template-agents__env-value">
                    {{ environmentInfo ? countObstacles(environmentInfo.obstacles) : '-' }}
                  </div>
                </div>
                <div class="template-agents__env-stat">
                  <div class="template-agents__env-label">充電ステーション</div>
                  <div class="template-agents__env-value">
                    {{ formatCoordinate(chargingStationPosition) }}
                  </div>
                </div>
                <div class="template-agents__env-stat">
                  <div class="template-agents__env-label">不審物数</div>
                  <div class="template-agents__env-value">
                    {{ suspiciousObjects.length }}
                  </div>
                </div>
                <div class="template-agents__env-stat">
                  <div class="template-agents__env-label">平均脅威度</div>
                  <div class="template-agents__env-value">
                    {{ environmentInfo ? calculateAverageThreat(environmentInfo.threat_grid).toFixed(3) : '0.000' }}
                  </div>
                </div>
                <div class="template-agents__env-stat">
                  <div class="template-agents__env-label">最大脅威度</div>
                  <div class="template-agents__env-value">
                    {{ environmentInfo ? calculateMaxThreat(environmentInfo.threat_grid).toFixed(3) : '0.000' }}
                  </div>
                </div>
              </div>
            </div>

            <div class="template-agents__env-section">
              <div class="template-agents__env-section-title">巡回サマリー</div>
              <div class="template-agents__environment-grid">
                <div class="template-agents__env-stat">
                  <div class="template-agents__env-label">現在位置</div>
                  <div class="template-agents__env-value">
                    {{ formatCoordinate(robotPosition) }}
                  </div>
                </div>
                <div class="template-agents__env-stat">
                  <div class="template-agents__env-label">開始タイル</div>
                  <div class="template-agents__env-value">
                    {{ formatCoordinate(routeStats.start) }}
                  </div>
                </div>
                <div class="template-agents__env-stat">
                  <div class="template-agents__env-label">最新タイル</div>
                  <div class="template-agents__env-value">
                    {{ formatCoordinate(routeStats.end) }}
                  </div>
                </div>
                <div class="template-agents__env-stat">
                  <div class="template-agents__env-label">訪問セル</div>
                  <div class="template-agents__env-value">
                    {{ routeStats.visitedTiles }} / {{ routeStats.totalTiles }}
                    <small>({{ routeStats.visitedRatio.toFixed(1) }}%)</small>
                  </div>
                </div>
                <div class="template-agents__env-stat">
                  <div class="template-agents__env-label">ステップ数</div>
                  <div class="template-agents__env-value">
                    {{ routeStats.stepCount }}
                  </div>
                </div>
                <div class="template-agents__env-stat">
                  <div class="template-agents__env-label">巡回タイル数</div>
                  <div class="template-agents__env-value">
                    {{ routeStats.pathLength }}
                  </div>
                </div>
              </div>
            </div>

            <div v-if="suspiciousObjects.length" class="template-agents__env-section">
              <div class="template-agents__env-section-title">不審物一覧</div>
              <ul class="template-agents__objects-list">
                <li v-for="(object, index) in suspiciousObjects" :key="`suspicious-${index}`">
                  ({{ object.x }}, {{ object.y }}) - {{ object.type }} / 脅威度 {{ object.threat_level.toFixed(2) }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div v-else class="template-agents__environment-empty">
          <el-empty description="環境情報が付属していません" />
        </div>

        <div v-if="routeWaypoints.length" class="template-agents__route-preview">
          <div class="template-agents__env-section-title">巡回ルート ({{ routeStats.pathLength }} タイル)</div>
          <div class="template-agents__route-list">
            <span
              v-for="(waypoint, index) in routeWaypoints"
              :key="`route-${waypoint.x}-${waypoint.y}-${index}`"
              class="template-agents__waypoint"
            >
              {{ index + 1 }}. ({{ waypoint.x }}, {{ waypoint.y }})
            </span>
          </div>
        </div>
      </el-card>

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

    <!-- エピソードPlayback (Future: Backend実装後に表示) -->
    <template v-if="executeResult && executeResult.episode_playbacks && executeResult.episode_playbacks.length > 0">
      <el-card class="template-agents__playback-card">
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

    <!-- 実行中進捗表示 (Future: WebSocket実装時に使用) -->
    <template v-if="false">
      <el-card class="template-agents__progress-card">
        <template #header>
          <span>実行中...</span>
        </template>

        <div class="template-agents__progress-content">
          <el-progress :percentage="50" :stroke-width="20" />
          <div class="template-agents__progress-text">エピソード 5 / 10</div>
          <div class="template-agents__progress-stats">
            <span>現在の報酬: 125.5</span>
            <span>カバレッジ: 85%</span>
            <span>バッテリー: 75%</span>
          </div>
        </div>
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

  &__max-steps-controls {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__form-hint {
    color: var(--el-text-color-secondary, #6b6b6b);
    font-size: 12px;
    margin: 4px 0 0;
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

  // 環境情報表示スタイル
  &__environment-card {
    margin-bottom: 24px;
  }

  &__env-header {
    align-items: center;
    display: flex;
    gap: 16px;
    justify-content: space-between;
  }

  &__env-title {
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-size: 20px;
    font-weight: 700;
    margin: 0;
  }

  &__env-subtitle {
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-size: 14px;
    margin: 4px 0 0;
  }

  &__environment-content {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
  }

  &__visualization-wrapper {
    flex: 1 1 480px;
    min-width: 360px;
  }

  &__environment-details {
    display: flex;
    flex: 1 1 320px;
    flex-direction: column;
    gap: 16px;
    min-width: 300px;
  }

  &__env-section {
    background: var(--md-sys-color-surface-container, #f3edf7);
    border: 1px solid var(--md-sys-color-outline-variant, #c9c5d0);
    border-radius: 12px;
    padding: 16px;
  }

  &__env-section-title {
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  &__environment-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  &__env-stat {
    background: var(--md-sys-color-surface-container, #f3edf7);
    border-radius: 8px;
    padding: 16px;
    text-align: center;
  }

  &__env-label {
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-size: 12px;
    margin-bottom: 8px;
  }

  &__env-value {
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-size: 18px;
    font-weight: 600;
  }

  &__objects-list {
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-size: 13px;
    list-style: disc;
    margin: 0;
    padding-left: 20px;

    li + li {
      margin-top: 4px;
    }
  }

  &__environment-empty {
    padding: 24px 0;
  }

  &__route-preview {
    margin-top: 24px;
  }

  &__route-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  &__waypoint {
    background: var(--md-sys-color-surface-variant, #e7e0ec);
    border: 1px solid var(--md-sys-color-outline-variant, #c9c5d0);
    border-radius: 999px;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-size: 12px;
    padding: 6px 12px;
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

  // Playbackボタンスタイル
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

  // 進捗表示スタイル (Future)
  &__progress-card {
    margin-bottom: 24px;
  }

  &__progress-content {
    text-align: center;
  }

  &__progress-text {
    font-size: 18px;
    font-weight: 600;
    margin-top: 16px;
  }

  &__progress-stats {
    display: flex;
    gap: 24px;
    justify-content: center;
    margin-top: 16px;

    span {
      color: var(--md-sys-color-on-surface-variant, #49454f);
      font-size: 14px;
    }
  }
}
</style>
