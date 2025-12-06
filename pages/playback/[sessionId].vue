<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted, ref } from 'vue'

import BatteryDisplay from '~/components/environment/BatteryDisplay.vue'
import EnvironmentVisualization from '~/components/environment/EnvironmentVisualization.vue'
import RobotPositionDisplay from '~/components/environment/RobotPositionDisplay.vue'
import PlaybackControl from '~/components/playback/PlaybackControl.vue'
import PlaybackSpeed from '~/components/playback/PlaybackSpeed.vue'
import PlaybackTimeline from '~/components/playback/PlaybackTimeline.vue'
import TrainingMetrics from '~/components/training/TrainingMetrics.vue'
import { DEFAULT_PATROL_RADIUS } from '~/configs/constants'
import type { Position, GridPosition } from '~/libs/domains/common/Position'
import { usePlaybackStore } from '~/stores/playback'
import type { TrainingMetricDTO, PaginatedMetricsResponse, ApiResponse } from '~/types/api'
import { getChargingStationPosition } from '~/utils/batteryHelpers'

const route = useRoute()
const router = useRouter()
const playbackStore = usePlaybackStore()
const config = useRuntimeConfig()
const PATROL_RADIUS = DEFAULT_PATROL_RADIUS
const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1920)

const metricsHistory = ref<TrainingMetricDTO[]>([])
const sessionMetricsLoading = ref(false)

const sessionId = computed(() => route.params.sessionId as string)
const currentFrame = computed(() => {
  const frames = playbackStore.frames
  const index = playbackStore.currentFrameIndex
  return frames[index] || null
})

// Current metrics synchronized with playback frame
const currentMetrics = computed(() => {
  if (!currentFrame.value || metricsHistory.value.length === 0) {
    return {
      timestep: 0,
      episode: 0,
      reward: 0,
      loss: null,
      coverageRatio: null,
      explorationScore: null,
      threatLevelAvg: null,
    }
  }

  const frameStep = currentFrame.value.environmentState?.step ?? 0
  // Find metric close to this step.
  // Assuming metrics are sorted by timestep.
  const metric =
    metricsHistory.value.find((m) => m.timestep === frameStep) || metricsHistory.value[metricsHistory.value.length - 1] // Fallback? Or maybe find nearest?

  // Refined search: find last metric with timestep <= frameStep
  // Because metrics might be sparse (e.g. every 10 steps) while frames are every step?
  // Or vice versa.
  // Ideally, find nearest.
  if (metricsHistory.value.length === 0)
    return {
      timestep: 0,
      episode: 0,
      reward: 0,
      loss: null,
      coverageRatio: null,
      explorationScore: null,
      threatLevelAvg: null,
    }

  let bestMetric = metricsHistory.value[0]
  if (!bestMetric)
    return {
      // Safety check
      timestep: 0,
      episode: 0,
      reward: 0,
      loss: null,
      coverageRatio: null,
      explorationScore: null,
      threatLevelAvg: null,
    }

  let minDiff = Math.abs(bestMetric.timestep - frameStep)

  for (let i = 1; i < metricsHistory.value.length; i++) {
    const current = metricsHistory.value[i]
    if (!current) continue
    const diff = Math.abs(current.timestep - frameStep)
    if (diff <= minDiff) {
      minDiff = diff
      bestMetric = current
    } else {
      // If sorted, we can stop early if diff starts increasing
      // But let's be safe
    }
  }

  const m = bestMetric
  return {
    timestep: m.timestep,
    episode: m.episode ?? 0,
    reward: m.reward,
    loss: m.loss,
    coverageRatio: m.coverage_ratio,
    explorationScore: m.exploration_score,
    threatLevelAvg: m.threat_level_avg,
  }
})

const robotTrajectory = computed<Position[]>(() => {
  const frames = playbackStore.frames
  const index = playbackStore.currentFrameIndex
  if (!frames.length || index < 0) return []

  const path: Position[] = []
  for (let i = 0; i <= index && i < frames.length; i++) {
    const env = frames[i]?.environmentState
    if (!env || typeof env.robot_x !== 'number' || typeof env.robot_y !== 'number') continue

    const x = env.robot_x
    const y = env.robot_y
    const last = path[path.length - 1]
    if (last && last.x === x && last.y === y) continue
    path.push({ x, y })
  }

  return path
})

const frameInfoColumns = computed(() => {
  if (viewportWidth.value >= 1280) return 4
  if (viewportWidth.value >= 1024) return 3
  return 2
})

const frameInfoItems = computed(() => {
  if (!currentFrame.value) return []
  const env = currentFrame.value.environmentState
  const items: Array<{ label: string; value: string }> = [
    {
      label: 'フレーム',
      value: `${playbackStore.currentFrameIndex + 1} / ${playbackStore.frames.length}`,
    },
    {
      label: 'フレーム番号',
      value: String(playbackStore.currentFrameIndex),
    },
    {
      label: '報酬',
      value: currentFrame.value.reward?.toFixed(2) ?? 'N/A',
    },
    {
      label: 'タイムスタンプ',
      value: currentFrame.value.timestamp ? new Date(currentFrame.value.timestamp).toLocaleTimeString('ja-JP') : 'N/A',
    },
    {
      label: '警備半径(セル)',
      value: String(PATROL_RADIUS),
    },
  ]

  if (env) {
    items.splice(3, 0, {
      label: '向き',
      value: formatOrientation(env.robot_orientation),
    })
  }

  return items
})

// Battery system computed properties (Session 050)
const batteryPercentage = computed(() => {
  const env = currentFrame.value?.environmentState
  return env?.battery_percentage ?? null
})

const isCharging = computed(() => {
  const env = currentFrame.value?.environmentState
  return env?.is_charging ?? false
})

const distanceToStation = computed(() => {
  const env = currentFrame.value?.environmentState
  return env?.distance_to_charging_station ?? null
})

const chargingStationPosition = computed<Position | null>(() => {
  const env = currentFrame.value?.environmentState
  if (!env) return null
  return getChargingStationPosition(env)
})

const chargingStationsList = computed<Position[]>(() => {
  const env = currentFrame.value?.environmentState
  return env?.charging_stations ?? []
})

// Compute trajectories for all robots up to current frame
const robotTrajectories = computed<Record<number, Position[]>>(() => {
  const frames = playbackStore.frames
  const index = playbackStore.currentFrameIndex
  if (!frames.length || index < 0) return {}

  const trajectories: Record<number, Position[]> = {}

  for (let i = 0; i <= index && i < frames.length; i++) {
    const robots = frames[i]?.environmentState?.robots
    if (robots && Array.isArray(robots)) {
      robots.forEach((r) => {
        let traj = trajectories[r.id]
        if (!traj) {
          traj = []
          trajectories[r.id] = traj
        }
        const last = traj.length > 0 ? traj[traj.length - 1] : null

        // Only add if position changed
        if (!last || last.x !== r.x || last.y !== r.y) {
          traj.push({ x: r.x, y: r.y })
        }
      })
    } else {
      // Legacy single robot fallback support in multi-agent structure?
      // If env.robot_x exists, treat as robot 0
      const env = frames[i]?.environmentState
      if (env && typeof env.robot_x === 'number' && typeof env.robot_y === 'number') {
        const id = 0
        let traj = trajectories[id]
        if (!traj) {
          traj = []
          trajectories[id] = traj
        }
        const last = traj.length > 0 ? traj[traj.length - 1] : null
        if (!last || last.x !== env.robot_x || last.y !== env.robot_y) {
          traj.push({ x: env.robot_x, y: env.robot_y })
        }
      }
    }
  }
  return trajectories
})

/**
 * Calculate Manhattan distance from a robot to the nearest charging station.
 */
const calculateDistanceToStation = (robot: { x: number; y: number }): number | null => {
  const env = currentFrame.value?.environmentState
  if (!env) return null

  // Use current frame's charging stations
  const stations = env.charging_stations ?? []

  if (stations.length === 0) {
    // Fallback to legacy single station
    const legacyStation = getChargingStationPosition(env)
    if (legacyStation) {
      return (
        Math.abs(Math.round(robot.x) - Math.round(legacyStation.x)) +
        Math.abs(Math.round(robot.y) - Math.round(legacyStation.y))
      )
    }
    return null
  }

  let minDist = Infinity
  for (const station of stations) {
    const dist =
      Math.abs(Math.round(robot.x) - Math.round(station.x)) + Math.abs(Math.round(robot.y) - Math.round(station.y))
    if (dist < minDist) {
      minDist = dist
    }
  }
  return minDist === Infinity ? null : minDist
}

// Grid dimensions computed from threat_grid
const gridWidth = computed(() => {
  const threatGrid = currentFrame.value?.environmentState?.threat_grid
  if (!threatGrid || !Array.isArray(threatGrid) || threatGrid.length === 0) {
    return 8 // Default fallback
  }
  // threat_grid is [y][x], so width is the length of the first row
  const firstRow = threatGrid?.[0]
  return Array.isArray(firstRow) ? firstRow.length : 8
})

const gridHeight = computed(() => {
  const threatGrid = currentFrame.value?.environmentState?.threat_grid
  if (!threatGrid || !Array.isArray(threatGrid)) {
    return 8 // Default fallback
  }

  // threat_grid is [y][x], so height is the number of rows
  const height = threatGrid.length
  return height
})

const fetchMetrics = async () => {
  sessionMetricsLoading.value = true
  try {
    const { data, error } = await useFetch<ApiResponse<PaginatedMetricsResponse>>(
      `/api/v1/training/sessions/${sessionId.value}/metrics`,
      {
        baseURL: (config.public as unknown as { apiBase: string }).apiBase,
        params: { page: 1, page_size: 10000 },
      }
    )
    if (error.value) throw error.value
    const responseData = data.value as unknown as ApiResponse<PaginatedMetricsResponse>
    metricsHistory.value = responseData?.data?.metrics ?? []
  } catch (e) {
    console.error('Failed to fetch metrics', e)
  } finally {
    sessionMetricsLoading.value = false
  }
}

let playbackInterval: ReturnType<typeof setInterval> | null = null
const handleResize = () => {
  if (typeof window === 'undefined') return
  viewportWidth.value = window.innerWidth
}

onMounted(async () => {
  try {
    await Promise.all([playbackStore.fetchFrames(sessionId.value), fetchMetrics()])
  } catch {
    ElMessage.error('セッションデータの読み込みに失敗しました')
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  playbackStore.stop()
  if (playbackInterval) {
    clearInterval(playbackInterval)
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
})

// Watch for playback state changes
watch(
  () => playbackStore.isPlaying,
  (isPlaying) => {
    if (isPlaying) {
      startPlayback()
    } else {
      stopPlayback()
    }
  }
)

const startPlayback = () => {
  if (playbackInterval) {
    clearInterval(playbackInterval)
  }

  // Calculate interval based on playback speed
  // Base: 100ms per frame (10 FPS)
  const baseInterval = 1000
  // Fix speed logic:
  // If speed=1.0 -> 1x (Realtime? or 1 step per sec?)
  // Actually, usually user wants faster.
  // Previous code: baseInterval = 100 (= 10 steps/sec).
  // If speed=1 -> 10 steps/sec.
  // If speed=10 -> 100 steps/sec (10ms).
  // If speed=0.1 -> 1 step/sec.
  // I will check PlaybackSpeed component, but let's assume it provides factors like 0.5, 1, 2, 5, 10.
  // NOTE: User said "Speed control doesn't work".
  // Ideally, 1 step corresponds to 1 environment step.
  // If I change baseInterval to 1000 (1 step/sec) it might be too slow.
  // Let's keep 100 as base.
  // Wait, if I change 100 to 1000 I slow it down.
  // If the user feels it's not changing, maybe the interval is invalid?
  // I will stick to 100 for now, but ensure I clear interval correctly.

  // Revert baseInterval to 100 for now.
  const interval = 100 / playbackStore.playbackSpeed

  playbackInterval = setInterval(() => {
    const nextIndex = playbackStore.currentFrameIndex + 1
    if (nextIndex >= playbackStore.frames.length) {
      // End of playback
      playbackStore.stop()
    } else {
      playbackStore.seekToFrame(nextIndex)
    }
  }, interval)
}

const stopPlayback = () => {
  if (playbackInterval) {
    clearInterval(playbackInterval)
    playbackInterval = null
  }
}

const handlePlay = () => {
  playbackStore.play()
}

const handlePause = () => {
  playbackStore.pause()
}

const handleStop = () => {
  playbackStore.stop()
}

const handleSpeedChange = (speed: number) => {
  // Ensure speed is set
  playbackStore.setPlaybackSpeed(speed)
  // Restart playback with new speed if currently playing
  if (playbackStore.isPlaying) {
    stopPlayback()
    startPlayback()
  }
}

const handleTimelineChange = (value: number) => {
  playbackStore.seekToFrame(value)
}

const handleBack = () => {
  router.push('/playback')
}

const orientationLabels = ['北', '東', '南', '西'] as const
const formatOrientation = (orientation?: number | null): string => {
  if (typeof orientation !== 'number' || Number.isNaN(orientation)) return '未取得'
  const normalized =
    ((Math.round(orientation) % orientationLabels.length) + orientationLabels.length) % orientationLabels.length
  return orientationLabels[normalized] ?? '未取得'
}
</script>

<template>
  <div class="playback-detail">
    <div class="playback-detail__header">
      <div>
        <el-button type="default" @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          戻る
        </el-button>
        <h2 class="playback-detail__title">セッション {{ sessionId }} の再生</h2>
      </div>
    </div>

    <el-card v-loading="playbackStore.isLoading" class="playback-detail__card">
      <el-alert
        v-if="playbackStore.error"
        :title="playbackStore.error"
        type="error"
        :closable="false"
        class="playback-detail__error"
      />

      <div v-if="playbackStore.frames.length > 0" class="playback-detail__content">
        <!-- Playback Controls -->
        <div class="playback-detail__controls">
          <PlaybackControl
            :is-playing="playbackStore.isPlaying"
            @play="handlePlay"
            @pause="handlePause"
            @stop="handleStop"
          />
          <PlaybackSpeed :model-value="playbackStore.playbackSpeed" @update:model-value="handleSpeedChange" />
        </div>

        <!-- Timeline -->
        <div class="playback-detail__timeline">
          <PlaybackTimeline
            :model-value="playbackStore.currentFrameIndex"
            :max="playbackStore.frames.length - 1"
            @update:model-value="handleTimelineChange"
          />
        </div>

        <!-- Frame Info -->
        <div v-if="currentFrame" class="playback-detail__frame-info">
          <div
            class="playback-detail__frame-grid"
            :style="{ gridTemplateColumns: `repeat(${frameInfoColumns}, minmax(0, 1fr))` }"
          >
            <div v-for="item in frameInfoItems" :key="item.label" class="playback-detail__frame-card">
              <span class="playback-detail__frame-label">{{ item.label }}</span>
              <span class="playback-detail__frame-value">{{ item.value }}</span>
            </div>
          </div>
        </div>

        <!-- Environment Visualization -->
        <div class="playback-detail__visualization">
          <div class="playback-detail__environment">
            <h3>環境状態</h3>
            <EnvironmentVisualization
              v-if="currentFrame?.environmentState"
              :grid-width="gridWidth"
              :grid-height="gridHeight"
              :robot-position="
                {
                  x: currentFrame.environmentState.robot_x ?? 0,
                  y: currentFrame.environmentState.robot_y ?? 0,
                } satisfies Position
              "
              :robot-orientation="currentFrame.environmentState.robot_orientation ?? null"
              :robots="
                (currentFrame.environmentState.robots ?? []).map((r) => ({
                  id: r.id,
                  x: r.x,
                  y: r.y,
                  orientation: r.orientation,
                  batteryPercentage: r.battery_percentage,
                  isCharging: r.is_charging,
                  actionTaken: r.action_taken ?? undefined,
                }))
              "
              :coverage-map="currentFrame.environmentState.coverage_map ?? []"
              :threat-grid="currentFrame.environmentState.threat_grid ?? []"
              :obstacles="currentFrame.environmentState.obstacles ?? null"
              :trajectories="robotTrajectories"
              :patrol-radius="PATROL_RADIUS"
              :charging-station-position="chargingStationPosition"
              :charging-stations="chargingStationsList"
            />
            <el-empty v-else description="環境データがありません" />
          </div>

          <div class="playback-detail__robot">
            <h3>ロボット位置</h3>

            <!-- Multi-robot display -->
            <div
              v-if="currentFrame?.environmentState?.robots && currentFrame.environmentState.robots.length > 0"
              class="robots-list"
            >
              <div v-for="(robot, index) in currentFrame.environmentState.robots" :key="index" class="robot-item">
                <h4>Robot {{ robot.id ?? index }}</h4>
                <RobotPositionDisplay
                  :position="{ row: Math.round(robot.y), col: Math.round(robot.x) }"
                  :orientation="robot.orientation"
                />
                <BatteryDisplay
                  :battery-percentage="robot.battery_percentage"
                  :is-charging="robot.is_charging"
                  :distance-to-station="calculateDistanceToStation(robot)"
                  style="margin-top: 10px"
                />
                <el-divider v-if="index < currentFrame.environmentState.robots.length - 1" />
              </div>
            </div>

            <!-- Legacy fallback -->
            <div v-else-if="currentFrame?.environmentState">
              <RobotPositionDisplay
                :position="
                  {
                    row: currentFrame.environmentState.robot_y ?? 0,
                    col: currentFrame.environmentState.robot_x ?? 0,
                  } satisfies GridPosition
                "
                :orientation="currentFrame.environmentState.robot_orientation ?? null"
              />
              <BatteryDisplay
                :battery-percentage="batteryPercentage"
                :is-charging="isCharging"
                :distance-to-station="distanceToStation"
                style="margin-top: 15px"
              />
            </div>
            <el-empty v-else description="ロボットデータがありません" />
          </div>
        </div>

        <!-- Training Metrics -->
        <div class="playback-detail__metrics">
          <h3>トレーニング指標</h3>
          <TrainingMetrics :realtime-metrics="currentMetrics" :metrics-history="metricsHistory" />
        </div>
      </div>

      <el-empty v-else-if="!playbackStore.isLoading" description="フレームデータがありません" />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.playback-detail {
  padding: 20px;

  &__header {
    margin-bottom: 24px;
  }

  &__title {
    color: var(--md-on-background);
    font-size: 1.75rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    margin-top: 1rem;
  }

  &__card {
    background-color: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
    margin-top: 20px;
  }

  &__error {
    margin-bottom: 20px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__controls {
    align-items: center;
    background: linear-gradient(135deg, var(--md-surface-2) 0%, var(--md-surface-1) 100%);
    border: 1px solid var(--md-outline-variant);
    border-radius: 8px;
    display: flex;
    gap: 20px;
    padding: 24px;
  }

  &__timeline {
    background-color: var(--md-surface-1);
    border: 1px solid var(--md-outline-variant);
    border-radius: 8px;
    padding: 20px;
  }

  &__frame-info {
    margin: 10px 0;
  }

  &__frame-grid {
    display: grid;
    gap: 12px;
    width: 100%;
  }

  &__frame-card {
    background-color: var(--md-surface-1);
    border: 1px solid var(--md-outline-variant);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-height: 72px;
    padding: 12px 16px;
  }

  &__frame-label {
    color: var(--md-on-surface-variant);
    font-size: 0.85rem;
    font-weight: 600;
  }

  &__frame-value {
    color: var(--md-on-surface);
    font-size: 1rem;
    font-weight: 700;
    white-space: nowrap;
  }

  &__visualization {
    display: grid;
    gap: 24px;
    grid-template-columns: 2fr 1fr;
    margin-top: 20px;

    h3 {
      color: var(--md-on-surface);
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 16px;
    }
  }

  &__environment {
    background: linear-gradient(135deg, var(--md-primary-container) 0%, var(--md-surface) 100%);
    border: 2px solid var(--md-primary);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    min-height: 400px; // Consistency with Training
    height: auto;
    overflow: visible; // Allow canvas aspect ratio to drive height, avoid scrollbars if possible
    padding: 20px;

    h3 {
      color: var(--md-on-primary-container);
      flex-shrink: 0;
    }
  }

  &__robot {
    background: linear-gradient(135deg, var(--md-tertiary-container) 0%, var(--md-surface) 100%);
    border: 2px solid var(--md-tertiary);
    border-radius: 12px;
    min-height: 400px;
    height: auto;
    max-height: 80vh; // Prevent unlimited growth
    overflow-y: auto; // Allow scrolling for multiple robots
    padding: 20px;

    h3 {
      color: var(--md-on-tertiary-container);
    }
  }

  &__metrics {
    margin-top: 24px;

    h3 {
      color: var(--md-on-surface);
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 16px;
    }
  }
}

.robots-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.robot-item {
  h4 {
    color: var(--color-text-primary);
    margin: 0 0 10px;
  }
}
</style>
