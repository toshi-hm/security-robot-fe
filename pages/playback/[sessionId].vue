<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted, ref } from 'vue'

import BatteryDisplay from '~/components/environment/BatteryDisplay.vue'
import EnvironmentVisualization from '~/components/environment/EnvironmentVisualization.vue'
import RobotPositionDisplay from '~/components/environment/RobotPositionDisplay.vue'
import PlaybackControl from '~/components/playback/PlaybackControl.vue'
import PlaybackSpeed from '~/components/playback/PlaybackSpeed.vue'
import PlaybackTimeline from '~/components/playback/PlaybackTimeline.vue'
import { DEFAULT_PATROL_RADIUS } from '~/configs/constants'
import type { Position, GridPosition } from '~/libs/domains/common/Position'
import { usePlaybackStore } from '~/stores/playback'
import { getChargingStationPosition } from '~/utils/batteryHelpers'

const route = useRoute()
const router = useRouter()
const playbackStore = usePlaybackStore()
const PATROL_RADIUS = DEFAULT_PATROL_RADIUS
const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1920)

const sessionId = computed(() => route.params.sessionId as string)
const currentFrame = computed(() => {
  const frames = playbackStore.frames
  const index = playbackStore.currentFrameIndex
  return frames[index] || null
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

let playbackInterval: ReturnType<typeof setInterval> | null = null
const handleResize = () => {
  if (typeof window === 'undefined') return
  viewportWidth.value = window.innerWidth
}

onMounted(async () => {
  try {
    await playbackStore.fetchFrames(sessionId.value)
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
  const baseInterval = 100
  const interval = baseInterval / playbackStore.playbackSpeed

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
              :coverage-map="currentFrame.environmentState.coverage_map ?? []"
              :threat-grid="currentFrame.environmentState.threat_grid ?? []"
              :obstacles="currentFrame.environmentState.obstacles ?? null"
              :trajectory="robotTrajectory"
              :patrol-radius="PATROL_RADIUS"
              :charging-station-position="chargingStationPosition"
            />
            <el-empty v-else description="環境データがありません" />
          </div>

          <div class="playback-detail__robot">
            <h3>ロボット位置</h3>
            <RobotPositionDisplay
              v-if="currentFrame?.environmentState"
              :position="
                {
                  row: currentFrame.environmentState.robot_y ?? 0,
                  col: currentFrame.environmentState.robot_x ?? 0,
                } satisfies GridPosition
              "
              :orientation="currentFrame.environmentState.robot_orientation ?? null"
            />
            <el-empty v-else description="ロボットデータがありません" />
          </div>

          <div class="playback-detail__battery">
            <h3>バッテリー状態</h3>
            <BatteryDisplay
              :battery-percentage="batteryPercentage"
              :is-charging="isCharging"
              :distance-to-station="distanceToStation"
            />
          </div>
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
    overflow: auto;
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
    padding: 20px;

    h3 {
      color: var(--md-on-tertiary-container);
    }
  }
}
</style>
