<template>
  <el-card>
    <pre>{{ JSON.stringify(metrics, null, 2) }}</pre>
  </el-card>
</template>

<script setup lang="ts">
import type { TrainingMetricsEntity } from '~/libs/entities/training/TrainingMetricsEntity'

const props = defineProps<{ metrics: TrainingMetricsEntity | null }>()
</script>
