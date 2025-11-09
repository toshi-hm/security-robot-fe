<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  batteryPercentage?: number | null
  isCharging?: boolean
  distanceToStation?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  batteryPercentage: null,
  isCharging: false,
  distanceToStation: null,
})

/**
 * バッテリー残量に応じた色を取得
 */
const batteryColor = computed(() => {
  const percentage = props.batteryPercentage ?? 0
  if (percentage >= 80) return 'success' // 緑
  if (percentage >= 20) return 'warning' // 黄
  return 'danger' // 赤
})

/**
 * バッテリー残量に応じたステータステキスト
 */
const batteryStatus = computed(() => {
  const percentage = props.batteryPercentage ?? 0
  if (props.isCharging) return '充電中'
  if (percentage >= 80) return '良好'
  if (percentage >= 50) return '普通'
  if (percentage >= 20) return '低下'
  if (percentage >= 10) return '警告'
  return '危険'
})

/**
 * バッテリーアイコン
 */
const batteryIcon = computed(() => {
  if (props.isCharging) return '⚡'
  const percentage = props.batteryPercentage ?? 0
  if (percentage >= 80) return '🔋'
  if (percentage >= 20) return '🪫'
  return '🪫'
})

/**
 * フォーマットされた距離
 */
const formattedDistance = computed(() => {
  if (props.distanceToStation === null || props.distanceToStation === undefined) {
    return '未取得'
  }
  return `${props.distanceToStation} マス`
})
</script>

<template>
  <el-card class="battery-display" shadow="hover">
    <template #header>
      <div class="battery-display__header">
        <span class="battery-display__icon">{{ batteryIcon }}</span>
        <span class="battery-display__title">バッテリー残量</span>
      </div>
    </template>

    <div class="battery-display__content">
      <!-- バッテリー残量プログレスバー -->
      <div class="battery-display__progress">
        <el-progress
          :percentage="batteryPercentage ?? 0"
          :color="batteryColor"
          :stroke-width="20"
        />
      </div>

      <!-- バッテリー情報 -->
      <div class="battery-display__info">
        <div class="battery-display__info-item">
          <span class="battery-display__label">残量:</span>
          <span class="battery-display__value">{{ batteryPercentage?.toFixed(1) ?? '---' }}%</span>
        </div>
        <div class="battery-display__info-item">
          <span class="battery-display__label">状態:</span>
          <el-tag :type="batteryColor" size="small">{{ batteryStatus }}</el-tag>
        </div>
        <div v-if="distanceToStation !== null" class="battery-display__info-item">
          <span class="battery-display__label">充電ステーションまで:</span>
          <span class="battery-display__value">{{ formattedDistance }}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.battery-display {
  width: 100%;

  &__header {
    align-items: center;
    display: flex;
    font-weight: 600;
    gap: 0.5rem;
  }

  &__icon {
    font-size: 1.5rem;
  }

  &__title {
    font-size: 1rem;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__progress {
    width: 100%;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__info-item {
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0;
  }

  &__label {
    color: var(--el-text-color-secondary);
    font-size: 0.875rem;
  }

  &__value {
    color: var(--el-text-color-primary);
    font-size: 0.875rem;
    font-weight: 600;
  }
}
</style>
