<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  position: { row: number; col: number }
  orientation?: number | null
}>()

const orientationLabels = ['北', '東', '南', '西']
const orientationIcons = ['↑', '→', '↓', '←']

const hasOrientation = computed(() => typeof props.orientation === 'number' && !Number.isNaN(props.orientation))

const normalizedOrientation = computed(() => {
  if (!hasOrientation.value) return null
  const value = Math.round(props.orientation ?? 0) % orientationLabels.length
  return value < 0 ? value + orientationLabels.length : value
})

const orientationText = computed(() => {
  if (normalizedOrientation.value === null) return '未取得'
  return orientationLabels[normalizedOrientation.value]
})

const orientationIcon = computed(() => {
  if (normalizedOrientation.value === null) return ''
  return orientationIcons[normalizedOrientation.value]
})
</script>

<template>
  <div class="robot-position">
    <el-tag type="info" class="robot-position__coordinate">
      座標: ({{ position.row }}, {{ position.col }})
    </el-tag>
    <el-tag :type="hasOrientation ? 'success' : 'warning'" class="robot-position__orientation">
      向き:
      <span v-if="hasOrientation">
        {{ orientationText }}
        <span aria-hidden="true" class="robot-position__orientation-icon">{{ orientationIcon }}</span>
      </span>
      <span v-else>未取得</span>
    </el-tag>
  </div>
</template>

<style scoped lang="scss">
.robot-position {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__coordinate,
  &__orientation {
    width: fit-content;
  }

  &__orientation-icon {
    display: inline-block;
    font-weight: 700;
    margin-left: 6px;
  }
}
</style>
