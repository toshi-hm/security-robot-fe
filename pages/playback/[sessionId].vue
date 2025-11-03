<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'

import EnvironmentVisualization from '~/components/environment/EnvironmentVisualization.vue'
import RobotPositionDisplay from '~/components/environment/RobotPositionDisplay.vue'
import PlaybackControl from '~/components/playback/PlaybackControl.vue'
import PlaybackSpeed from '~/components/playback/PlaybackSpeed.vue'
import PlaybackTimeline from '~/components/playback/PlaybackTimeline.vue'
import { usePlaybackStore } from '~/stores/playback'

const route = useRoute()
const router = useRouter()
const playbackStore = usePlaybackStore()

const sessionId = computed(() => route.params.sessionId as string)
const currentFrame = computed(() => {
  const frames = playbackStore.frames
  const index = playbackStore.currentFrameIndex
  return frames[index] || null
})

let playbackInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  try {
    await playbackStore.fetchFrames(sessionId.value)
  } catch {
    ElMessage.error('セッションデータの読み込みに失敗しました')
  }
})

onUnmounted(() => {
  playbackStore.stop()
  if (playbackInterval) {
    clearInterval(playbackInterval)
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
          <el-descriptions :column="4" border>
            <el-descriptions-item label="フレーム">
              {{ playbackStore.currentFrameIndex + 1 }} / {{ playbackStore.frames.length }}
            </el-descriptions-item>
            <el-descriptions-item label="フレーム番号">
              {{ playbackStore.currentFrameIndex }}
            </el-descriptions-item>
            <el-descriptions-item label="報酬">
              {{ currentFrame.reward?.toFixed(2) || 'N/A' }}
            </el-descriptions-item>
            <el-descriptions-item label="タイムスタンプ">
              {{ currentFrame.timestamp ? new Date(currentFrame.timestamp).toLocaleTimeString('ja-JP') : 'N/A' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- Environment Visualization -->
        <div class="playback-detail__visualization">
          <div class="playback-detail__environment">
            <h3>環境状態</h3>
            <EnvironmentVisualization
              v-if="currentFrame?.environmentState"
              :environment-state="currentFrame.environmentState"
            />
            <el-empty v-else description="環境データがありません" />
          </div>

          <div class="playback-detail__robot">
            <h3>ロボット位置</h3>
            <RobotPositionDisplay
              v-if="
                currentFrame?.environmentState &&
                typeof currentFrame.environmentState === 'object' &&
                'robot' in currentFrame.environmentState
              "
              :position="(currentFrame.environmentState as any).robot"
            />
            <el-empty v-else description="ロボットデータがありません" />
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
    padding: 20px;

    h3 {
      color: var(--md-on-primary-container);
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
